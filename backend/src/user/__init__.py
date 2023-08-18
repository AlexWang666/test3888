# flake8: noqa
from flask import Blueprint

user_blueprint = Blueprint("user_blueprint", __name__)

from . import user
from . import organization
from . import feedback