# flake8: noqa
from flask import Blueprint

pages_blueprint = Blueprint("pages_blueprint", __name__)

from . import budget
from . import chat
from . import forgotpassword
from . import marketplace
from . import notes
from . import planner
from . import profile
from . import programdata
from . import programmembers
from . import projectdashboard
from . import searchresults
from . import tasksinproject
