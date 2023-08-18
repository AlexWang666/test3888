import os
from datetime import timedelta

from flask import Flask
from flask_jwt_extended import JWTManager
from src.core.config import config
from flask_cors import CORS, cross_origin
from flask_mail import Mail

app = Flask(__name__, template_folder="../frontend/src/Pages", static_folder="../frontend")
cors = CORS(app, resources={r'/api/*': {'origins': 'http://beta.searten.com'}})

app.config["S3_BUCKET"] = os.getenv("AWS_BUCKET_NAME")
app.config["S3_KEY"] = os.getenv("AWS_ACCESS_KEY")
app.config["S3_SECRET"] = os.getenv("AWS_SECRET_KEY")
app.config["S3_LOCATION"] = "http://{}.s3.amazonaws.com/".format(app.config["S3_BUCKET"])

# app.config["JWT_COOKIE_DOMAIN"] = "52.65.179.190"
# app.config["JWT_COOKIE_SAMESITE"] = "None"
# app.config["JWT_COOKIE_SECURE"] = True  # https only cookie
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_SECRET_KEY"] = config["jwt_shared_secret"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=20)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=14)
app.config["SECRET_KEY"] = config["secret_key"]

jwt = JWTManager(app)

app.config["MAIL_SERVER"] = "smtp.office365.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = "info@searten.com"
app.config["MAIL_PASSWORD"] = config["email_password"]

mail = Mail(app)

from src.auth.auth import auth_blueprint
from src.drive.drive_home import drive_blueprint
from src.drive.drive_sharing import drive_sharing_blueprint
from src.pagesbackend import pages_blueprint
from src.project import proj_blueprint
from src.researcher_recommender import researcher_recommender_blueprint
from src.user import user_blueprint
from src.admin import admin_blueprint

app.register_blueprint(auth_blueprint)
app.register_blueprint(proj_blueprint)
app.register_blueprint(pages_blueprint)
app.register_blueprint(researcher_recommender_blueprint)
app.register_blueprint(drive_blueprint)
app.register_blueprint(drive_sharing_blueprint)
app.register_blueprint(user_blueprint)
app.register_blueprint(admin_blueprint, url_prefix="/api/admin")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=True)

