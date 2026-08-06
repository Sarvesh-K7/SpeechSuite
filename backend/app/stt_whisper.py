
"""
Speech-to-Text via faster-whisper (self-hosted, open-source).

faster-whisper is a CTranslate2 reimplementation of OpenAI's Whisper model.
It runs entirely on your own server (no external API calls, no API key)
and supports 90+ languages, including reasonable handling of code-mixed
speech (e.g. Hindi+English in the same utterance).
"""
import io
import logging
import threading

logger = logging.getLogger(__name__)

_model = None
_model_lock = threading.Lock()


class WhisperError(Exception):
    pass


def _load_model(model_size: str, device: str, compute_type: str):
    global _model
    with _model_lock:
        if _model is None:
            try:
                from faster_whisper import WhisperModel
            except ImportError as e:
                raise WhisperError(
                    "faster-whisper is not installed. Run: pip install faster-whisper"
                ) from e

            logger.info(
                "Loading faster-whisper model '%s' (device=%s, compute_type=%s)...",
                model_size,
                device,
                compute_type,
            )
            _model = WhisperModel(model_size, device=device, compute_type=compute_type)
            logger.info("Whisper model loaded.")
    return _model


def transcribe_audio_bytes(
    audio_bytes: bytes,
    filename: str = "chunk.wav",
    model_size: str = "base",
    device: str = "cpu",
    compute_type: str = "int8",
):
    """
    Transcribe an audio chunk (any ffmpeg-readable format, e.g. wav/webm).

    Returns:
        dict with keys: text, language, language_probability
    """
    try:
        model = _load_model(model_size, device, compute_type)
        audio_buffer = io.BytesIO(audio_bytes)

        # language=None => Whisper auto-detects the dominant language.
        # Note: Whisper picks one dominant language per segment rather than
        # switching mid-segment, so heavily code-mixed speech within a
        # single short chunk may be transcribed in whichever language it
        # judges dominant for that chunk.
        #
        # VAD tuning: short/quiet real speech in a 4s chunk can otherwise
        # get entirely stripped by the VAD, which triggers an upstream
        # faster-whisper bug (max() on an empty sequence) when 100% of the
        # chunk is removed. min_silence_duration_ms is raised and a
        # speech_pad_ms is added so brief pauses inside a chunk aren't
        # treated as silence to cut.
        try:
            segments, info = model.transcribe(
                audio_buffer,
                language=None,
                beam_size=5,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=1000, speech_pad_ms=300),
            )
            text_parts = [seg.text.strip() for seg in segments]
        except ValueError:
            # VAD determined the entire chunk was silence -> nothing to
            # transcribe. Not an error condition, just an empty result.
            logger.info("VAD found no speech in this chunk; skipping.")
            return {"text": "", "language": None, "language_probability": None}

        full_text = " ".join(part for part in text_parts if part)

        return {
            "text": full_text,
            "language": info.language,
            "language_probability": round(info.language_probability, 3)
            if info.language_probability
            else None,
        }
    except WhisperError:
        raise
    except Exception as e:
        logger.exception("Whisper transcription failed")
        raise WhisperError(f"Whisper transcription failed: {e}")