import psycopg2
from flask import request

from ..core import db_conn
from . import user_blueprint

# Search Organization with name & shortname
@user_blueprint.route("/api/search/organization", methods=["GET"])
def search_organization():
    response = {}
    query = request.args.get('query', '')
    limit = request.args.get('limit', 20)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT * FROM organization WHERE status = 'active' 
            AND (LOWER(name) like %(query)s OR LOWER(shortname) 
            like %(query)s) LIMIT %(limit)s;
        """
        params = {'query': f'%{query.lower()}%', 'limit': limit}

        db_cursor.execute(
            query_string, params,
        )

        result = db_cursor.fetchall()

    response = {
        'message': "Organizations Fetched Successfully",
        'status_code': 200,
        'data': result
    }
    return response, 200

# Create Organization
@user_blueprint.route("/api/create/organization", methods=["POST"])
def create_organization():
    data = request.get_json()
    response = {}
    try:
        name = data["name"]
        email = data["email"]
        phone = data["phone"]
        link = data["link"]
    except KeyError as e:
        response = {
                'message': f"Missing field in request - {e}",
                'status_code': 400,
            }
        return response, 400

    shortname = data["shortname"] if 'shortname' in data else ''
    description = data["description"] if 'description' in data else ''
    logo_url = data["logo_url"] if 'logo_url' in data else ''
    address = data["address"] if 'address' in data else ''

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            INSERT INTO organization (name, shortname, description, link, 
            logo_url, address, email, phone, status) VALUES (%(name)s, 
            %(shortname)s, %(description)s, %(link)s, %(logo_url)s, 
            %(address)s, %(email)s, %(phone)s, 'pending')
        """
        params = {"name": name, "email": email, "phone": phone, "link": link,
            "shortname": shortname, "description": description, "logo_url": logo_url, 
            "address": address}

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response = {
                'message': f"Error while creating organization - {e}",
                'status_code': 400,
            }
            return response, 400

    db_conn.commit()

    response = {
        'message': "Organization Created Successfully",
        'status_code': 200,
    }
    return response, 200