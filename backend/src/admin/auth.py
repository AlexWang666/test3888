import psycopg2
import bcrypt

from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)
from ..core import db_conn
from . import admin_blueprint

# login and set access_token in cookies
@admin_blueprint.route("/login", methods=["POST"])
def admin_login():
    """
    Authenticates a Admin and grants access to the Searten Admin site.
    Receives an email and a password as URL parameters.
    :return: Fields from the `admin` table with access_token
    rtype: dict
    """
    data = request.get_json()
    response = {}

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
            SELECT * FROM admin WHERE email = %(email)s
        """
        params = {'email': email}

        db_cursor.execute(
            query_string, params,
        )
        admin = db_cursor.fetchone()
    
    # If email address not found or password incorrect, send response now
    if not admin or not bcrypt.checkpw(password.encode(), admin["password"].encode()):
        response = {
                'message': "Incorrect credentials",
                'status_code': 400,
            }
        return response, 400

    del admin['password']

    access_token = create_access_token(identity=admin)
    refresh_token = create_refresh_token(identity=admin)

    response = jsonify({
        'message': "Admin Login Successfully",
        'status_code': 200,
        'data': admin,
        'access_token': access_token,
    })

    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

# jwt protected endpoint for verification
@admin_blueprint.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    return jsonify({'message': 'Protected Endpoint'}), 200

# logout and unset cookies
@admin_blueprint.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logout Successful"})
    unset_jwt_cookies(response)
    return response, 200