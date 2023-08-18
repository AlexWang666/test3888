import psycopg2
from flask import request
from flask_jwt_extended import jwt_required

from ..core import db_conn
from . import admin_blueprint

# Get all organizations details on Admin
@admin_blueprint.route('/organizations', methods=['GET'])
@jwt_required()
def get_organizations():
    """
    Get All Organizations
    """
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=10, type=int)
    response = {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT * FROM organization ORDER BY id ASC 
            LIMIT %(limit)s OFFSET %(offset)s;
        """
        params = {"limit": limit, "offset": (page-1)*limit}

        db_cursor.execute(
            query_string, params,
        )
        result = db_cursor.fetchall()

    # Get total count of organizations
    with db_conn.cursor() as count_cursor:
        count_query = "SELECT COUNT(*) FROM organization;"
        count_cursor.execute(count_query)
        total_organizations = count_cursor.fetchone()[0]
    
    response = {
        'message': "Organizations fetched successfully",
        'status_code': 200,
        'data': result,
        'total_organizations': total_organizations,
        'page': page,
        'limit': limit,
        'total_pages': (total_organizations + limit - 1) // limit
    }

    return response, 200

# Update organization details
@admin_blueprint.route('/organization/update', methods=['PUT'])
@jwt_required()
def update_organizations():
    """
    Updates Organization Details
    """
    data = request.get_json()
    response = {}
    try:
        id = data["id"]
        params = data["data"]
    except KeyError as e:
        response = {
            'message': f"Missing field in request - {e}",
            'status_code': 400,
        }
        return response, 400

    if not params.keys():
        response = {
            'message': "No fields for update in organization",
            'status_code': 400,
        }
        return response, 400

    update_fields = ', '.join(['{} = %({})s'.format(key, key) for key in params])

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = f"""
            UPDATE organization SET {update_fields} WHERE id = %(id)s;
        """
        params['id'] = id

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response = {
                'message': "Error while updating organization - {e}",
                'status_code': 400,
            }
            return response, 400
    db_conn.commit()

    response = {
        'message': "Organization updated successfully",
        'status_code': 200
    }
    return response, 200

# Delete Organization
@admin_blueprint.route('/organization/delete', methods=['DELETE'])
@jwt_required()
def delete_organizations():
    """
    Delete Organization
    """
    data = request.get_json()
    response = {}
    try:
        id = data["id"]
    except KeyError as e:
        response = {
            'message': f"Missing field in request - {e}",
            'status_code': 400,
        }
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        check_query_string = """
            SELECT status FROM organization WHERE id = %(id)s;
        """
        params = {"id": id}
        db_cursor.execute(check_query_string, params)

        organization = db_cursor.fetchone()

        if organization and organization["status"] == "active":
            response = {
                'message': "Organization has an active status and cannot be deleted",
                'status_code': 403
            }
            return response, 403
        
        query_string = """
            DELETE FROM organization WHERE id = %(id)s;
        """

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while deleting organization - {e}",
                'status_code': 400
            }
            return response, 400
    db_conn.commit()

    response = {
        'message': "Organization deleted successfully",
        'status_code': 200
    }
    return response, 200