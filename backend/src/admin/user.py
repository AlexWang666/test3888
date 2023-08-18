import psycopg2
from flask import request
from flask_jwt_extended import jwt_required

from ..core import db_conn
from . import admin_blueprint

# Get all users details on Admin
@admin_blueprint.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """
    Get All Users
    """
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=10, type=int)
    response = {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT id, first_name, last_name, email, status FROM profile
            ORDER BY id ASC LIMIT %(limit)s OFFSET %(offset)s;
        """
        params = {"limit": limit, "offset": (page-1)*limit}

        db_cursor.execute(
            query_string, params,
        )
        result = db_cursor.fetchall()

    # Get total count of users
    with db_conn.cursor() as count_cursor:
        count_query = "SELECT COUNT(*) FROM profile;"
        count_cursor.execute(count_query)
        total_users = count_cursor.fetchone()[0]
    
    response = {
        'message': "Users Fetched Successfully",
        'status_code': 200,
        'data': result,
        'total_users': total_users,
        'page': page,
        'limit': limit,
        'total_pages': (total_users + limit - 1) // limit
    }

    return response, 200

# Update user status
@admin_blueprint.route('/user/update-status', methods=['PUT'])
@jwt_required()
def update_user_status():
    """
    Updates User Status
    """
    data = request.get_json()
    response = {}
    try:
        id = data["id"]
        status = data["status"]
    except KeyError as e:
        response = {
                'message': f"Missing field in request - {e}",
                'status_code': 400,
            }
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            UPDATE profile SET status=%(status)s WHERE id = %(id)s;
        """
        params = {"id": id, "status": status}

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while updating user - {e}",
                'status_code': 400,
            }
            return response, 400
    db_conn.commit()

    response = {
        'message': "User Status Updated Successfully",
        'status_code': 200,
    }
    return response, 200