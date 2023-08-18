import psycopg2
import bcrypt
from flask import jsonify, request, url_for, render_template

from ..core import db_conn
from . import pages_blueprint

from itsdangerous import URLSafeTimedSerializer as Serializer
from flask_mail import Message
from run import mail
from src.core.config import config


# Verifies the token
def verify_token(token):
    s = Serializer(config["secret_key"])
    try:
        uid = s.loads(token, max_age=300)["uid"]
    except:
        return None
    return uid


# Sends the email for the password reset
def create_token(info):
    s = Serializer(config["secret_key"])

    # Gets the token
    token = s.dumps({"uid": info["id"]})
    return token


def send_mail(info):
    token = create_token(info)

    if (info["email"] != ""):
        msg = Message("Password Reset Request", recipients=[info["email"]],
        sender="info@searten.com")
        msg.html = render_template('LoginPage/reset_email.html', token=token)
        # msg.body = f'''
        # To reset your Searten password, click the link below.

        # {url_for("pages_blueprint.reset_password_token", token=token, _external=True)}

        # If this was not you, you can ignore this message. The link will expire in five minutes.

        # Kind regards,
        # The Searten Team
        # '''
        mail.send(msg)


# Determines if the email exists in the db
@pages_blueprint.route("/api/does-email-exist", methods=["GET"])
def does_email_exist():
    email = request.args.get('email', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT profile.id, profile.email
            FROM profile
            WHERE profile.email=%s;
            """,
            (email,),
        )
        creds = db_cursor.fetchall()

    if len(creds) != 0:
        send_mail(creds[0])

    db_conn.commit()
    return jsonify(creds)


# Resets the users password
@pages_blueprint.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()

    try:
        password = data["password"]
        token = data["token"]
    except KeyError:
        raise KeyError("Not all required fields were sent from the frontend")

    uid = verify_token(token)
    if uid == None:
        return jsonify({"msg": "Token has expired or is invalid."})

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            UPDATE profile
            SET password=%s
            WHERE id=%s;
            """,
            (
                bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode(),
                uid,
            ),
        )
        db_conn.commit()

    return jsonify({"msg": "Success. Please log in now."})


# Renders the reset password page given the valid link
@pages_blueprint.route("/reset-password/<token>", methods=["GET"])
def reset_password_token(token):
    uid = verify_token(token)

    if uid == None:
        return render_template('LoginPage/TokenFailure.html')
    else:
        return render_template('LoginPage/NewPassword.html')


# Verifies the token is valid
@pages_blueprint.route("/api/check-token", methods=["GET"])
def check_token():
    token = request.args.get('token', '')
    uid = verify_token(token)

    if uid == None:
        return jsonify({"msg": "Token has expired or is invalid."})
    else:
        return jsonify({"msg": "Success"})
