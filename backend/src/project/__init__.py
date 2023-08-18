# flake8: noqa
from flask import Blueprint

proj_blueprint = Blueprint("proj_blueprint", __name__)

from . import project
from . import task
from . import milestone