# import logging

# from flask import Flask
# from flask_cors import CORS

# from .config import Config
# from .models import db
# from .routes import api_bp

# logging.basicConfig(level=logging.INFO)


# def create_app():
#     app = Flask(__name__)
#     app.config.from_object(Config)

#     CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

#     db.init_app(app)
#     with app.app_context():
#         db.create_all()

#     app.register_blueprint(api_bp)

#     return app






import logging

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()

from .config import Config
from .models import db
from .routes import api_bp

logging.basicConfig(level=logging.INFO)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    app.register_blueprint(api_bp)

    return app