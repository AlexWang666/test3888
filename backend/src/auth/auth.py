import io

import bcrypt
import boto3
import psycopg2
from flask import Blueprint, jsonify, make_response, request, send_file
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_refresh_cookies,
)

from ..core import db_conn, s3

auth_blueprint = Blueprint("auth_blueprint", __name__)


@auth_blueprint.route("/api/logo", methods=["GET"])
def logo():
    filename = "/tmp/searten_logo.jpg"
    s3.download_file("searten-bucket", "searten_logo.jpg", filename)
    # s3.Bucket('searten-bucket').download_file('searten_logo.jpg', filename)
    image_content = None
    with open(filename, "rb") as f:
        image_content = f.read()

    response = make_response(
        send_file(
            io.BytesIO(image_content),
            mimetype="image/jpeg",
            attachment_filename="searten_logo.jpg",
        )
    )

    response.headers["Access-Control-Allow-Origin"] = "*"

    return response


@auth_blueprint.route("/api/register", methods=["POST"])
def register():
    """
    Registers a user on Searten.

    Receives email, first name, last name, password and org_id in the request payload.
    """

    data = request.get_json()
    response = {}
    try:
        email = data["email"]
        first_name = data["first_name"]
        last_name = data["last_name"]
        password = data["password"]
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute("SELECT * FROM profile WHERE email = %s", (email,))
        users = db_cursor.fetchone()
    if users:
        response['message'] = "There is already a profile with this email address."
        response["status_code"] = 409
        return response, 409

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        try:
            db_cursor.execute(
                """insert into profile(first_name, last_name, email, password) values(%s, %s, %s, %s)
                RETURNING id;""",
                (
                    first_name,
                    last_name,
                    email,
                    bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode(),
                ),
            )
            id = db_cursor.fetchone()["id"]
            org_id = data["org_id"] if "org_id" in data else None

            # Creates a blank profile for the user
            db_cursor.execute(
                """
                INSERT INTO profile_info (user_id, bio, education, link, org_id)
                VALUES (%s, %s, %s, %s, %s);
                """,
                (id, "", "", "", org_id),
            )
            db_conn.commit()
        except BaseException as e:
            response['message'] = f"Error while registering user - {e}"
            response["status_code"] = 400
            return response, 400
    response['message'] = "Your profile has successfully been registered. Please log in now."
    response["status_code"] = 200
    return response, 200

@auth_blueprint.route("/api/login", methods=["post"])
def login():
    """
    Authenticates a user and grants access to the Searten site.

    Receives an email and a password as URL parameters.
    Generates an access token and refresh token. The access_token
    is a short lived and can be stored in memory/local storage in the front-end.
    The refresh_token is long-lived and should be stored as a HTTPOnly
    cookie.

    :return: Fields from the `profile` table and the access_token
    rtype: dict
    """

    data = request.get_json()

    try:
        email = data["email"]
        password = data["password"]
    except KeyError as e:
        response = {
                'message': f"Missing field in request - {e}",
                'status_code': 400,
            }
        return response, 400

    # Search for credentials
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT * FROM profile WHERE email = %(email)s
        """
        params = {'email': email}

        db_cursor.execute(
            query_string, params,
        )
        user = db_cursor.fetchone()

    # If email address not found or password incorrect, send response now
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        response = {
                'message': "Incorrect credentials",
                'status_code': 400,
                'status': 2
            }
        return response, 400
    
    # If user status is blocked then give forbidden
    if user and user['status'] == 'blocked':
        response = {
                'message': "You are blocked by admin. Please email to admin@searten.com",
                'status_code': 403,
                'status': 2
            }
        return response, 403

    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)

    response = jsonify(
        {
            'status': "1",
            'message': "Login Successful",
            'id': user["id"],
            'first_name': user["first_name"],
            'last_name': user["last_name"],
            'access_token': access_token,
            'status_code': 200,
        }
    )

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200


@auth_blueprint.route("/api/logout", methods=["POST"])
def logout():
    """
    Logs a user out of Searten.

    Requires a refresh_token and a csrf_refresh_token
    (should be sent in the header 'X-CSRF-TOKEN'). This function removes
    the refresh_token from HTTPOnly cookies. The access token will be removed
    from memory/local storage in the frontend.
    """

    response = jsonify({"msg": "Logout successful"})
    unset_refresh_cookies(response)
    return response


@auth_blueprint.route("/api/refresh_access_token", methods=["POST"])
@jwt_required(refresh=True, verify_type=True)
def refresh_access_token():
    """
    Given a valid refresh_token, generates and returns a new access_token.

    :return: A dictionary containing the new access_token
    :rtype: dict
    """

    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    response = jsonify({"access_token": access_token})
    set_access_cookies(response, access_token)
    return response, 200
