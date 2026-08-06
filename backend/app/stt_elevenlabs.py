# """
# Speech-to-Text via the ElevenLabs Speech-to-Text API (Scribe model).

# Docs: https://elevenlabs.io/docs/api-reference/speech-to-text
# Endpoint: POST https://api.elevenlabs.io/v1/speech-to-text

# ElevenLabs Scribe supports 99 languages with strong multilingual/code-mixed
# transcription accuracy (e.g. Hindi+English in the same utterance), and
# returns automatic language detection.
# """
# import logging

# import requests

# logger = logging.getLogger(__name__)

# ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"


# class ElevenLabsError(Exception):
#     pass


# def transcribe_audio_bytes(audio_bytes: bytes, filename: str, api_key: str, model_id: str = "scribe_v1"):
#     """
#     Send an audio chunk to ElevenLabs STT and return the transcription.

#     Returns:
#         dict with keys: text, language, language_probability
#     """
#     if not api_key:
#         raise ElevenLabsError(
#             "ELEVENLABS_API_KEY is not set. Add it to your backend .env file."
#         )

#     content_type = "audio/wav" if filename.lower().endswith(".wav") else "audio/webm"
#     headers = {"xi-api-key": api_key}
#     files = {"file": (filename, audio_bytes, content_type)}
#     data = {"model_id": model_id}

#     try:
#         response = requests.post(
#             ELEVENLABS_STT_URL, headers=headers, files=files, data=data, timeout=60
#         )
#     except requests.RequestException as e:
#         logger.exception("Network error calling ElevenLabs STT")
#         raise ElevenLabsError(f"Network error calling ElevenLabs: {e}")

#     if response.status_code != 200:
#         logger.error("ElevenLabs STT error %s: %s", response.status_code, response.text)
#         raise ElevenLabsError(
#             f"ElevenLabs API returned {response.status_code}: {response.text[:300]}"
#         )

#     payload = response.json()

#     return {
#         "text": (payload.get("text") or "").strip(),
#         "language": payload.get("language_code"),
#         "language_probability": payload.get("language_probability"),
#     }








"""
Speech-to-Text via the ElevenLabs Speech-to-Text API (Scribe model).

Docs: https://elevenlabs.io/docs/api-reference/speech-to-text
Endpoint: POST https://api.elevenlabs.io/v1/speech-to-text

ElevenLabs Scribe supports 99 languages with strong multilingual/code-mixed
transcription accuracy (e.g. Hindi+English in the same utterance), and
returns automatic language detection.
"""
import logging

import requests

logger = logging.getLogger(__name__)

ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"


class ElevenLabsError(Exception):
    pass


def transcribe_audio_bytes(audio_bytes: bytes, filename: str, api_key: str, model_id: str = "scribe_v1"):
    """
    Send an audio chunk to ElevenLabs STT and return the transcription.

    Returns:
        dict with keys: text, language, language_probability
    """
    if not api_key:
        raise ElevenLabsError(
            "ELEVENLABS_API_KEY is not set. Add it to your backend .env file."
        )

    content_type = "audio/wav" if filename.lower().endswith(".wav") else "audio/webm"
    headers = {"xi-api-key": api_key}
    files = {"file": (filename, audio_bytes, content_type)}
    data = {"model_id": model_id}

    try:
        response = requests.post(
            ELEVENLABS_STT_URL, headers=headers, files=files, data=data, timeout=60
        )
    except requests.RequestException as e:
        logger.exception("Network error calling ElevenLabs STT")
        raise ElevenLabsError(f"Network error calling ElevenLabs: {e}")

    if response.status_code != 200:
        logger.error("ElevenLabs STT error %s: %s", response.status_code, response.text)
        raise ElevenLabsError(
            f"ElevenLabs API returned {response.status_code}: {response.text[:300]}"
        )

    payload = response.json()

    return {
        "text": (payload.get("text") or "").strip(),
        "language": payload.get("language_code"),
        "language_probability": payload.get("language_probability"),
    }