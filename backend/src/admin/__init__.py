# flake8: noqa
from flask import Blueprint

admin_blueprint = Blueprint("admin_blueprint", __name__)

from . import auth
from . import user
from . import organization
from . import feedback