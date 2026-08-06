

# import logging
# import uuid

# from flask import Blueprint, Response, current_app, jsonify, request

# from .models import Transcription, db
# from .stt_elevenlabs import ElevenLabsError
# from .stt_elevenlabs import transcribe_audio_bytes as transcribe_with_elevenlabs
# from .stt_whisper import WhisperError
# from .stt_whisper import transcribe_audio_bytes as transcribe_with_whisper
# from .tts_elevenlabs import ElevenLabsTTSError
# from .tts_elevenlabs import synthesize_speech as synthesize_with_elevenlabs
# from .tts_piper import PiperTTSError
# from .tts_piper import synthesize_speech as synthesize_with_piper

# logger = logging.getLogger(__name__)

# api_bp = Blueprint("api", __name__, url_prefix="/api")


# # ---------- STT ----------

# @api_bp.route("/transcribe", methods=["POST"])
# def transcribe():
#     """
#     Accepts an audio chunk (multipart/form-data, field name 'audio')
#     recorded from the browser, transcribes it using whichever provider is
#     configured (STT_PROVIDER = "whisper" | "elevenlabs"), and returns the
#     transcribed text. Does NOT save to DB - saving is a separate explicit
#     action (POST /api/transcriptions).
#     """
#     if "audio" not in request.files:
#         return jsonify({"error": "No audio file provided"}), 400

#     audio_file = request.files["audio"]
#     audio_bytes = audio_file.read()

#     if not audio_bytes:
#         return jsonify({"error": "Empty audio file"}), 400

#     provider = current_app.config["STT_PROVIDER"]
#     filename = audio_file.filename or "chunk.wav"

#     try:
#         if provider == "elevenlabs":
#             result = transcribe_with_elevenlabs(
#                 audio_bytes,
#                 filename=filename,
#                 api_key=current_app.config["ELEVENLABS_API_KEY"],
#                 model_id=current_app.config["ELEVENLABS_STT_MODEL"],
#             )
#         else:  # default: whisper (self-hosted, open-source)
#             result = transcribe_with_whisper(
#                 audio_bytes,
#                 filename=filename,
#                 model_size=current_app.config["WHISPER_MODEL_SIZE"],
#                 device=current_app.config["WHISPER_DEVICE"],
#                 compute_type=current_app.config["WHISPER_COMPUTE_TYPE"],
#             )
#         result["provider"] = provider
#         return jsonify(result), 200
#     except (ElevenLabsError, WhisperError) as e:
#         logger.error("STT (%s) failed: %s", provider, e)
#         return jsonify({"error": str(e)}), 502
#     except Exception as e:
#         logger.exception("Unexpected error during transcription")
#         return jsonify({"error": f"Transcription failed: {e}"}), 500


# # ---------- TTS ----------

# # @api_bp.route("/tts", methods=["POST"])
# # def text_to_speech():
# #     """
# #     Accepts JSON { "text": "..." } and returns synthesized speech audio
# #     using whichever provider is configured
# #     (TTS_PROVIDER = "piper" | "elevenlabs").

# #     Piper (self-hosted) returns audio/wav.
# #     ElevenLabs (cloud) returns audio/mpeg.
# #     """
# #     data = request.get_json(silent=True) or {}
# #     text = (data.get("text") or "").strip()
# #     if not text:
# #         return jsonify({"error": "text is required"}), 400

# #     provider = current_app.config["TTS_PROVIDER"]

# #     try:
# #         if provider == "elevenlabs":
# #             voice_id = data.get("voice_id") or current_app.config["ELEVENLABS_TTS_VOICE_ID"]
# #             audio_bytes = synthesize_with_elevenlabs(
# #                 text,
# #                 api_key=current_app.config["ELEVENLABS_API_KEY"],
# #                 voice_id=voice_id,
# #                 model_id=current_app.config["ELEVENLABS_TTS_MODEL"],
# #             )
# #             return Response(audio_bytes, mimetype="audio/mpeg")
# #         else:  # default: piper (self-hosted, open-source)
# #             voice_name = data.get("voice_id") or current_app.config["PIPER_VOICE"]
# #             audio_bytes = synthesize_with_piper(text, voice_name=voice_name)
# #             return Response(audio_bytes, mimetype="audio/wav")
# #     except (ElevenLabsTTSError, PiperTTSError) as e:
# #         logger.error("TTS (%s) failed: %s", provider, e)
# #         return jsonify({"error": str(e)}), 502
# #     except Exception as e:
# #         logger.exception("Unexpected error during speech synthesis")
# #         return jsonify({"error": f"Speech synthesis failed: {e}"}), 500


# @api_bp.route("/tts", methods=["POST"])
# def text_to_speech():
#     """
#     Accepts JSON { "text": "..." } and returns synthesized speech audio
#     using whichever provider is configured (TTS_PROVIDER = "piper" | "elevenlabs").
#     Voice selection is server-side only via config; clients cannot override it.

#     Piper (self-hosted) returns audio/wav.
#     ElevenLabs (cloud) returns audio/mpeg.
#     """
#     data = request.get_json(silent=True) or {}
#     text = (data.get("text") or "").strip()
#     if not text:
#         return jsonify({"error": "text is required"}), 400

#     provider = current_app.config["TTS_PROVIDER"]

#     try:
#         if provider == "elevenlabs":
#             audio_bytes = synthesize_with_elevenlabs(
#                 text,
#                 api_key=current_app.config["ELEVENLABS_API_KEY"],
#                 voice_id=current_app.config["ELEVENLABS_TTS_VOICE_ID"],
#                 model_id=current_app.config["ELEVENLABS_TTS_MODEL"],
#             )
#             return Response(audio_bytes, mimetype="audio/mpeg")
#         else:  # default: piper (self-hosted, open-source)
#             audio_bytes = synthesize_with_piper(
#                 text, voice_name=current_app.config["PIPER_VOICE"]
#             )
#             return Response(audio_bytes, mimetype="audio/wav")
#     except (ElevenLabsTTSError, PiperTTSError) as e:
#         logger.error("TTS (%s) failed: %s", provider, e)
#         return jsonify({"error": str(e)}), 502
#     except Exception as e:
#         logger.exception("Unexpected error during speech synthesis")
#         return jsonify({"error": f"Speech synthesis failed: {e}"}), 500


# # ---------- CRUD: Transcriptions ----------

# @api_bp.route("/transcriptions", methods=["GET"])
# def list_transcriptions():
#     page = request.args.get("page", 1, type=int)
#     per_page = min(request.args.get("per_page", 10, type=int), 100)
#     search = request.args.get("search", "", type=str).strip()

#     query = Transcription.query
#     if search:
#         query = query.filter(Transcription.text.ilike(f"%{search}%"))

#     query = query.order_by(Transcription.created_at.desc())
#     pagination = query.paginate(page=page, per_page=per_page, error_out=False)

#     return jsonify({
#         "items": [t.to_dict() for t in pagination.items],
#         "total": pagination.total,
#         "page": pagination.page,
#         "pages": pagination.pages,
#     }), 200


# @api_bp.route("/transcriptions/<int:transcription_id>", methods=["GET"])
# def get_transcription(transcription_id):
#     t = Transcription.query.get_or_404(transcription_id)
#     return jsonify(t.to_dict()), 200


# @api_bp.route("/transcriptions", methods=["POST"])
# def create_transcription():
#     data = request.get_json(silent=True) or {}
#     text = (data.get("text") or "").strip()
#     if not text:
#         return jsonify({"error": "text is required"}), 400

#     session_id = data.get("session_id") or str(uuid.uuid4())

#     t = Transcription(
#         text=text,
#         detected_language=data.get("detected_language"),
#         duration_seconds=data.get("duration_seconds"),
#         session_id=session_id,
#     )
#     db.session.add(t)
#     db.session.commit()
#     return jsonify(t.to_dict()), 201


# @api_bp.route("/transcriptions/<int:transcription_id>", methods=["PUT"])
# def update_transcription(transcription_id):
#     t = Transcription.query.get_or_404(transcription_id)
#     data = request.get_json(silent=True) or {}

#     if "text" in data:
#         new_text = (data.get("text") or "").strip()
#         if not new_text:
#             return jsonify({"error": "text cannot be empty"}), 400
#         t.text = new_text
#     if "detected_language" in data:
#         t.detected_language = data.get("detected_language")

#     db.session.commit()
#     return jsonify(t.to_dict()), 200


# @api_bp.route("/transcriptions/<int:transcription_id>", methods=["DELETE"])
# def delete_transcription(transcription_id):
#     t = Transcription.query.get_or_404(transcription_id)
#     db.session.delete(t)
#     db.session.commit()
#     return jsonify({"message": "Deleted", "id": transcription_id}), 200


# @api_bp.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "ok"}), 200








import logging
import uuid

from flask import Blueprint, Response, current_app, jsonify, request

from .models import Transcription, db
from .stt_elevenlabs import ElevenLabsError
from .stt_elevenlabs import transcribe_audio_bytes as transcribe_with_elevenlabs
from .stt_whisper import WhisperError
from .stt_whisper import transcribe_audio_bytes as transcribe_with_whisper
from .tts_elevenlabs import ElevenLabsTTSError
from .tts_elevenlabs import synthesize_speech as synthesize_with_elevenlabs
from .tts_piper import PiperTTSError
from .tts_piper import synthesize_speech as synthesize_with_piper

logger = logging.getLogger(__name__)

api_bp = Blueprint("api", __name__, url_prefix="/api")


# ---------- STT ----------

@api_bp.route("/transcribe", methods=["POST"])
def transcribe():
    """
    Accepts an audio chunk (multipart/form-data, field name 'audio')
    recorded from the browser, transcribes it using whichever provider is
    configured (STT_PROVIDER = "whisper" | "elevenlabs"), and returns the
    transcribed text. Does NOT save to DB - saving is a separate explicit
    action (POST /api/transcriptions).
    """
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    if not audio_bytes:
        return jsonify({"error": "Empty audio file"}), 400

    provider = current_app.config["STT_PROVIDER"]
    filename = audio_file.filename or "chunk.wav"

    try:
        if provider == "elevenlabs":
            result = transcribe_with_elevenlabs(
                audio_bytes,
                filename=filename,
                api_key=current_app.config["ELEVENLABS_API_KEY"],
                model_id=current_app.config["ELEVENLABS_STT_MODEL"],
            )
        else:  # default: whisper (self-hosted, open-source)
            result = transcribe_with_whisper(
                audio_bytes,
                filename=filename,
                model_size=current_app.config["WHISPER_MODEL_SIZE"],
                device=current_app.config["WHISPER_DEVICE"],
                compute_type=current_app.config["WHISPER_COMPUTE_TYPE"],
            )
        result["provider"] = provider
        return jsonify(result), 200
    except (ElevenLabsError, WhisperError) as e:
        logger.error("STT (%s) failed: %s", provider, e)
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        logger.exception("Unexpected error during transcription")
        return jsonify({"error": f"Transcription failed: {e}"}), 500


# ---------- TTS ----------

@api_bp.route("/tts", methods=["POST"])
def text_to_speech():
    """
    Accepts JSON { "text": "..." } and returns synthesized speech audio
    using whichever provider is configured
    (TTS_PROVIDER = "piper" | "elevenlabs").

    Voice selection is server-side only via config (PIPER_VOICE /
    ELEVENLABS_TTS_VOICE_ID) -- clients cannot override it via the request
    body, since a voice ID valid for one provider is meaningless (and
    breaks) for the other.

    Piper (self-hosted) returns audio/wav.
    ElevenLabs (cloud) returns audio/mpeg.
    """
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    provider = current_app.config["TTS_PROVIDER"]

    try:
        if provider == "elevenlabs":
            audio_bytes = synthesize_with_elevenlabs(
                text,
                api_key=current_app.config["ELEVENLABS_API_KEY"],
                voice_id=current_app.config["ELEVENLABS_TTS_VOICE_ID"],
                model_id=current_app.config["ELEVENLABS_TTS_MODEL"],
            )
            return Response(audio_bytes, mimetype="audio/mpeg")
        else:  # default: piper (self-hosted, open-source)
            audio_bytes = synthesize_with_piper(
                text, voice_name=current_app.config["PIPER_VOICE"]
            )
            return Response(audio_bytes, mimetype="audio/wav")
    except (ElevenLabsTTSError, PiperTTSError) as e:
        logger.error("TTS (%s) failed: %s", provider, e)
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        logger.exception("Unexpected error during speech synthesis")
        return jsonify({"error": f"Speech synthesis failed: {e}"}), 500


# ---------- CRUD: Transcriptions ----------

@api_bp.route("/transcriptions", methods=["GET"])
def list_transcriptions():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 100)
    search = request.args.get("search", "", type=str).strip()

    query = Transcription.query
    if search:
        query = query.filter(Transcription.text.ilike(f"%{search}%"))

    query = query.order_by(Transcription.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [t.to_dict() for t in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@api_bp.route("/transcriptions/<int:transcription_id>", methods=["GET"])
def get_transcription(transcription_id):
    t = Transcription.query.get_or_404(transcription_id)
    return jsonify(t.to_dict()), 200


@api_bp.route("/transcriptions", methods=["POST"])
def create_transcription():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    session_id = data.get("session_id") or str(uuid.uuid4())

    t = Transcription(
        text=text,
        detected_language=data.get("detected_language"),
        duration_seconds=data.get("duration_seconds"),
        session_id=session_id,
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201


@api_bp.route("/transcriptions/<int:transcription_id>", methods=["PUT"])
def update_transcription(transcription_id):
    t = Transcription.query.get_or_404(transcription_id)
    data = request.get_json(silent=True) or {}

    if "text" in data:
        new_text = (data.get("text") or "").strip()
        if not new_text:
            return jsonify({"error": "text cannot be empty"}), 400
        t.text = new_text
    if "detected_language" in data:
        t.detected_language = data.get("detected_language")

    db.session.commit()
    return jsonify(t.to_dict()), 200


@api_bp.route("/transcriptions/<int:transcription_id>", methods=["DELETE"])
def delete_transcription(transcription_id):
    t = Transcription.query.get_or_404(transcription_id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Deleted", "id": transcription_id}), 200


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200