import psycopg2
from flask import request
from flask_jwt_extended import jwt_required

from ..core import db_conn
from . import admin_blueprint

# Create feedback
@admin_blueprint.route("/feedbacks", methods=["GET"])
@jwt_required()
def get_all_feedbacks():
    """
    Get all feedbacks
    """
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=10, type=int)
    response = {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT * FROM feedback ORDER BY id ASC 
            LIMIT %(limit)s OFFSET %(offset)s;
        """
        params = {"limit": limit, "offset": (page-1)*limit}

        db_cursor.execute(
            query_string, params,
        )
        result = db_cursor.fetchall()

    # Get total count of feedback
    with db_conn.cursor() as count_cursor:
        count_query = "SELECT COUNT(*) FROM feedback;"
        count_cursor.execute(count_query)
        total_feedbacks = count_cursor.fetchone()[0]
    
    response = {
        'message': "Feedbacks fetched successfully",
        'status_code': 200,
        'data': result,
        'total_feedbacks': total_feedbacks,
        'page': page,
        'limit': limit,
        'total_pages': (total_feedbacks + limit - 1) // limit
    }
    return response, 200

# Update feedback status
@admin_blueprint.route("/feedback/update", methods=["PUT"])
@jwt_required()
def update_feeback():
    """
    Update feedback status
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
            UPDATE feedback SET status = %(status)s WHERE id = %(id)s;
        """
        params = {"id": id, "status": status}

        try:
            db_cursor.execute(
                query_string, params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while updating feedback - {e}",
                'status_code': 400
            }
            return response, 400
    db_conn.commit()

    response = {
        'message': "Feedback updated successfully",
        'status_code': 200
    }
    return response, 200

# Delete feedback
@admin_blueprint.route("/feedback/delete", methods=["DELETE"])
@jwt_required()
def delete_feedback():
    data = request.get_json()
    response = {}

    try:
        id = data["id"]
    except KeyError as e:
        response = {
            'message': f"Missing field in request - {e}",
            'status_code': 400
        }
        return response, 400
    
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            DELETE FROM feedback WHERE id = %(id)s;
        """
        params = {"id": id}

        try:
            db_cursor.execute(
                query_string, params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while deleting feedback - {e}",
                'status_code': 400
            }
            return response, 400
    db_conn.commit()

    response = {
        'message': "Feedback deleted successfully",
        'status_code': 200
    }
    return response, 200