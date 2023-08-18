# flake8: noqa
from run import jwt, app


if __name__ == "__main__":
    print("Starting app")
    app.run()
    print("App running")
