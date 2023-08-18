import psycopg2
from flask import request

from ..core import db_conn
from . import user_blueprint

# Create feedback
@user_blueprint.route("/api/create/feedback", methods=["POST"])
def create_feedback():
    data = request.get_json()
    response = {}
    try:
        name = data["name"]
        email = data["email"]
        title = data["title"]
        description = data["description"]
    except KeyError as e:
        response = {
                'message': f"Missing field in request - {e}",
                'status_code': 400,
            }
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            INSERT INTO feedback (name, email, title, description, status) 
            VALUES (%(name)s, %(email)s, %(title)s, %(description)s, 'active')
        """
        params = {"name": name, "email": email, "title": title,
            "description": description}

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while creating feedback - {e}",
                'status_code': 400,
            }
            return response, 400

    db_conn.commit()

    response = {
        'message': "Feedback Created Successfully",
        'status_code': 200,
    }
    return response, 200