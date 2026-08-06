# """
# Text-to-Speech via the ElevenLabs TTS API.

# Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
# Endpoint: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
# """
# import logging

# import requests

# logger = logging.getLogger(__name__)

# ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


# class ElevenLabsTTSError(Exception):
#     pass


# def synthesize_speech(text: str, api_key: str, voice_id: str, model_id: str = "eleven_multilingual_v2"):
#     """
#     Convert text to speech via ElevenLabs TTS.

#     Returns:
#         raw MP3 audio bytes
#     """
#     if not api_key:
#         raise ElevenLabsTTSError(
#             "ELEVENLABS_API_KEY is not set. Add it to your backend .env file."
#         )
#     if not text or not text.strip():
#         raise ElevenLabsTTSError("Text is empty; nothing to synthesize.")

#     url = ELEVENLABS_TTS_URL.format(voice_id=voice_id)
#     headers = {
#         "xi-api-key": api_key,
#         "Content-Type": "application/json",
#         "Accept": "audio/mpeg",
#     }
#     payload = {
#         "text": text,
#         "model_id": model_id,
#         "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
#     }

#     try:
#         response = requests.post(url, headers=headers, json=payload, timeout=60)
#     except requests.RequestException as e:
#         logger.exception("Network error calling ElevenLabs TTS")
#         raise ElevenLabsTTSError(f"Network error calling ElevenLabs: {e}")

#     if response.status_code != 200:
#         logger.error("ElevenLabs TTS error %s: %s", response.status_code, response.text)
#         raise ElevenLabsTTSError(
#             f"ElevenLabs API returned {response.status_code}: {response.text[:300]}"
#         )

#     return response.content

"""
Text-to-Speech via the ElevenLabs TTS API.

Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
Endpoint: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
"""
import logging

import requests

logger = logging.getLogger(__name__)

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


class ElevenLabsTTSError(Exception):
    pass


def synthesize_speech(text: str, api_key: str, voice_id: str, model_id: str = "eleven_multilingual_v2"):
    """
    Convert text to speech via ElevenLabs TTS.

    Returns:
        raw MP3 audio bytes
    """
    if not api_key:
        raise ElevenLabsTTSError(
            "ELEVENLABS_API_KEY is not set. Add it to your backend .env file."
        )
    if not text or not text.strip():
        raise ElevenLabsTTSError("Text is empty; nothing to synthesize.")

    url = ELEVENLABS_TTS_URL.format(voice_id=voice_id)
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
    except requests.RequestException as e:
        logger.exception("Network error calling ElevenLabs TTS")
        raise ElevenLabsTTSError(f"Network error calling ElevenLabs: {e}")

    if response.status_code != 200:
        logger.error("ElevenLabs TTS error %s: %s", response.status_code, response.text)
        raise ElevenLabsTTSError(
            f"ElevenLabs API returned {response.status_code}: {response.text[:300]}"
        )

    return response.content