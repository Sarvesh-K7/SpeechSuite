
import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")

    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "3306")
    DB_USER = os.environ.get("DB_USER", "root")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "speech_to_text")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    )
    SQLALCHEMY_ENGINE_OPTIONS = {
    "connect_args": {
        "ssl": {}
    }
}

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---- Speech-to-Text ----
    # STT_PROVIDER switches between the two supported STT backends:
    #   "elevenlabs" -> ElevenLabs Speech-to-Text API (cloud)
    #   "whisper"    -> self-hosted faster-whisper (local, open-source)
    STT_PROVIDER = os.environ.get("STT_PROVIDER", "whisper").lower()

    ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
    ELEVENLABS_STT_MODEL = os.environ.get("ELEVENLABS_STT_MODEL", "scribe_v1")

    WHISPER_MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")
    WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

    # ---- Text-to-Speech ----
    # TTS_PROVIDER switches between the two supported TTS backends:
    #   "elevenlabs" -> ElevenLabs Text-to-Speech API (cloud)
    #   "piper"      -> self-hosted Piper TTS (local, open-source)
    TTS_PROVIDER = os.environ.get("TTS_PROVIDER", "piper").lower()

    ELEVENLABS_TTS_VOICE_ID = os.environ.get("ELEVENLABS_TTS_VOICE_ID", "")
    ELEVENLABS_TTS_MODEL = os.environ.get("ELEVENLABS_TTS_MODEL", "eleven_multilingual_v2")

    PIPER_VOICE = os.environ.get("PIPER_VOICE", "en_US-lessac-medium")

    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25 MB max upload

    # CORS - allow the Vite dev server / deployed frontend origin
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
