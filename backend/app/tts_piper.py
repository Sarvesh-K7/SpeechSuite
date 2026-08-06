# """
# Text-to-Speech via Piper (self-hosted, open-source).

# Piper is a fast, local neural TTS engine (no external API calls, no API
# key). Voices are small (~50-100MB) ONNX models downloaded once and cached
# on disk. This mirrors the self-hosted pattern used in stt_whisper.py.

# IMPORTANT: piper-tts (the OHF-Voice piper1-gpl rewrite, >=1.0) splits
# loading and downloading into two separate steps -- PiperVoice.load() only
# reads files that already exist on disk, it does NOT fetch anything.
# Downloading is handled by the separate `piper.download_voices` module, so
# we call it explicitly here if the voice files are missing.

# Docs: https://github.com/OHF-Voice/piper1-gpl
# CLI equivalent: python -m piper.download_voices en_US-lessac-medium --data-dir <dir>
# """
# import io
# import logging
# import threading
# import wave
# from pathlib import Path

# logger = logging.getLogger(__name__)

# _voice_cache = {}
# _voice_lock = threading.Lock()


# class PiperTTSError(Exception):
#     pass


# def _voices_dir() -> Path:
#     d = Path.home() / ".cache" / "piper" / "voices"
#     d.mkdir(parents=True, exist_ok=True)
#     return d


# def _download_voice_if_missing(voice_name: str, voices_dir: Path):
#     model_path = voices_dir / f"{voice_name}.onnx"
#     config_path = voices_dir / f"{voice_name}.onnx.json"

#     if model_path.exists() and config_path.exists():
#         return

#     logger.info("Piper voice '%s' not found locally, downloading...", voice_name)

#     try:
#         from piper.download_voices import download_voice
#     except ImportError as e:
#         raise PiperTTSError(
#             f"Could not import piper.download_voices to fetch '{voice_name}' "
#             f"({e}). Run this once on the server to download it manually: "
#             f'python -m piper.download_voices {voice_name} --data-dir "{voices_dir}"'
#         ) from e

#     try:
#         download_voice(voice_name, download_dir=voices_dir)
#     except Exception as e:
#         raise PiperTTSError(
#             f"Could not download Piper voice '{voice_name}' automatically "
#             f"({e}). Run this once on the server to download it manually: "
#             f'python -m piper.download_voices {voice_name} --data-dir "{voices_dir}"'
#         ) from e

#     if not (model_path.exists() and config_path.exists()):
#         raise PiperTTSError(
#             f"Piper voice '{voice_name}' files still missing after download attempt."
#         )


# def _load_voice(voice_name: str):
#     with _voice_lock:
#         if voice_name not in _voice_cache:
#             try:
#                 from piper import PiperVoice
#             except ImportError as e:
#                 raise PiperTTSError(
#                     "piper-tts is not installed. Run: pip install piper-tts"
#                 ) from e

#             voices_dir = _voices_dir()
#             _download_voice_if_missing(voice_name, voices_dir)

#             model_path = voices_dir / f"{voice_name}.onnx"
#             config_path = voices_dir / f"{voice_name}.onnx.json"

#             logger.info("Loading Piper voice '%s'...", voice_name)
#             try:
#                 _voice_cache[voice_name] = PiperVoice.load(
#                     str(model_path), config_path=str(config_path)
#                 )
#             except Exception as e:
#                 raise PiperTTSError(
#                     f"Failed to load Piper voice '{voice_name}': {e}"
#                 ) from e
#             logger.info("Piper voice '%s' loaded.", voice_name)
#     return _voice_cache[voice_name]


# def synthesize_speech(text: str, voice_name: str = "en_US-lessac-medium"):
#     """
#     Convert text to speech using a local Piper voice model.

#     Returns:
#         raw WAV audio bytes
#     """
#     if not text or not text.strip():
#         raise PiperTTSError("Text is empty; nothing to synthesize.")

#     try:
#         voice = _load_voice(voice_name)

#         buffer = io.BytesIO()
#         with wave.open(buffer, "wb") as wav_file:
#             voice.synthesize_wav(text, wav_file)

#         return buffer.getvalue()
#     except PiperTTSError:
#         raise
#     except Exception as e:
#         logger.exception("Piper TTS synthesis failed")
#         raise PiperTTSError(f"Piper TTS synthesis failed: {e}")












"""
Text-to-Speech via Piper (self-hosted, open-source).

Piper is a fast, local neural TTS engine (no external API calls, no API
key). Voices are small (~50-100MB) ONNX models downloaded once and cached
on disk.

IMPORTANT: piper-tts (the OHF-Voice piper1-gpl rewrite, >=1.0) splits
loading and downloading into two separate steps -- PiperVoice.load() only
reads files that already exist on disk, it does NOT fetch anything.
Downloading is handled by the separate `piper.download_voices` module, so
we call it explicitly here if the voice files are missing.

Docs: https://github.com/OHF-Voice/piper1-gpl
CLI equivalent: python -m piper.download_voices en_US-lessac-medium --data-dir <dir>
"""
import io
import logging
import threading
import wave
from pathlib import Path

logger = logging.getLogger(__name__)

_voice_cache = {}
_voice_lock = threading.Lock()


class PiperTTSError(Exception):
    pass


def _voices_dir() -> Path:
    d = Path.home() / ".cache" / "piper" / "voices"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _download_voice_if_missing(voice_name: str, voices_dir: Path):
    model_path = voices_dir / f"{voice_name}.onnx"
    config_path = voices_dir / f"{voice_name}.onnx.json"

    if model_path.exists() and config_path.exists():
        return

    logger.info("Piper voice '%s' not found locally, downloading...", voice_name)

    try:
        from piper.download_voices import download_voice
    except ImportError as e:
        raise PiperTTSError(
            f"Could not import piper.download_voices to fetch '{voice_name}' "
            f"({e}). Run this once on the server to download it manually: "
            f'python -m piper.download_voices {voice_name} --data-dir "{voices_dir}"'
        ) from e

    try:
        download_voice(voice_name, download_dir=voices_dir)
    except Exception as e:
        raise PiperTTSError(
            f"Could not download Piper voice '{voice_name}' automatically "
            f"({e}). Run this once on the server to download it manually: "
            f'python -m piper.download_voices {voice_name} --data-dir "{voices_dir}"'
        ) from e

    if not (model_path.exists() and config_path.exists()):
        raise PiperTTSError(
            f"Piper voice '{voice_name}' files still missing after download attempt."
        )


def _load_voice(voice_name: str):
    with _voice_lock:
        if voice_name not in _voice_cache:
            try:
                from piper import PiperVoice
            except ImportError as e:
                raise PiperTTSError(
                    "piper-tts is not installed. Run: pip install piper-tts"
                ) from e

            voices_dir = _voices_dir()
            _download_voice_if_missing(voice_name, voices_dir)

            model_path = voices_dir / f"{voice_name}.onnx"
            config_path = voices_dir / f"{voice_name}.onnx.json"

            logger.info("Loading Piper voice '%s'...", voice_name)
            try:
                _voice_cache[voice_name] = PiperVoice.load(
                    str(model_path), config_path=str(config_path)
                )
            except Exception as e:
                raise PiperTTSError(
                    f"Failed to load Piper voice '{voice_name}': {e}"
                ) from e
            logger.info("Piper voice '%s' loaded.", voice_name)
    return _voice_cache[voice_name]


def synthesize_speech(text: str, voice_name: str = "en_US-lessac-medium"):
    """
    Convert text to speech using a local Piper voice model.

    Returns:
        raw WAV audio bytes
    """
    if not text or not text.strip():
        raise PiperTTSError("Text is empty; nothing to synthesize.")

    try:
        voice = _load_voice(voice_name)

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)

        return buffer.getvalue()
    except PiperTTSError:
        raise
    except Exception as e:
        logger.exception("Piper TTS synthesis failed")
        raise PiperTTSError(f"Piper TTS synthesis failed: {e}")