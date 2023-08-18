import psycopg2
import json
from flask import request

from ..core import db_conn
from . import user_blueprint


@user_blueprint.route("/api/get-profile-info", methods=["GET"])
def get_profile_info():
    try:
        userid = request.args["userid"]
    except:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        db_cursor.execute(
            """
                SELECT * FROM profile WHERE id = %s;
            """,
            (userid,),
        )

        result = db_cursor.fetchone()

        return result, 200

@user_blueprint.route("/api/search/researchers", methods=["GET"])
def search_researchers():
    response = {}
    query = request.args.get('query', '')
    limit = request.args.get('limit', 20)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT id, first_name, last_name, email FROM profile WHERE
            (first_name like %(query)s OR last_name like %(query)s)
            LIMIT %(limit)s
        """
        params = {'query': f'%{query}%', 'limit': limit}

        db_cursor.execute(
            query_string, params,
        )

        result = db_cursor.fetchall()
    response['message'] = "Members Fetched Successfully"
    response["status_code"] = 200
    response['data'] = result
    return response, 200