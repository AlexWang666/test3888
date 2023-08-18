# Deployment steps

## Amazon services to activate
* Make sure the services are hosted in Sydney (ap-southeast-2)
### RDS
* Create PostgreSQL DB (current version: 14.4 R1)
* Store master username and password
* Configure security group rules. Currently it accepts inbound and outbounds from all IP address, but this should probably be restricted to only the backend server's IP in production.

### EC2
* Current OS: Amazon Linux 2 Kernel 5.10 AMI 2.0.20220912.1 x86_64 HVM gp2
* Create a key pair (.pem file)
* Inbound rules
  * IPv4	HTTP	TCP	80	0.0.0.0/0
  * IPv4	SSH	TCP	22	0.0.0.0/0
* Outbound rules (anywhere)
  * IPv4	All traffic	All	All	0.0.0.0/0

* Connecting to instance using .pem key
  * Change permissions: `chmod 400 searten.pem`
  * `ssh -i "searten.pem" ec2-user@ec2-52-65-179-190.ap-southeast-2.compute.amazonaws.com`

### S3
TBD

## Hosting - Amazon Linux OS
Flask, React and Nginx setup was mostly taken from this [site](https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project).

### Installing packages
* `sudo yum update`
* Install Python Python 3.8.10: `sudo yum install python38` 
* Install Nginx: `sudo yum install nginx`. If it fails follow [this](https://devcoops.com/install-nginx-on-aws-ec2-amazon-linux/).
* Install [npm](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html). Each time you connect to the instance you need to run `nvm install --lts`.
* Clone repo
* Create Python virtual environment and install packages from the requirements file.

### DB setup
Some of these steps are from the original README

Run the following commands to install PostgreSQL and create initial tables:
* `sudo yum update`
* Install [PostgresSQL](https://techviewleo.com/how-to-install-postgresql-database-on-amazon-linux/) 
* Creating tables `psql -U <username> -h <host IP/name> -p <port> <db name> -W -f <file path>`: 
* In general if you want to connect to DB via CLI: `psql -U <username> -h <host IP/name> -p <port> <db name>`
  * Current: `psql -U master_user -h seartendb.csymu63ljfmz.ap-southeast-2.rds.amazonaws.com -p 5432 searten_db`

### Flask server setup
* Navigate to backend/ folder
* First check if you can host the server using Gunicorn: `gunicorn -b 127.0.0.1:5001 wsgi:app`
  * Port 5000 is taken by the live server so it doesn't work with Instance Connect
* Create a service for the server to run on. The server should restart on its own if it crashes.
  *  `sudo touch /etc/systemd/system/flask_backend.service`
  *  `sudo cp ../deployment/flask_backend.service /etc/systemd/system/flask_backend.service`
  *  Change WorkingDirectory and ExecStart variable in the file depending on the user name (currently ec2-user) and the virtual environment folder (currently backend/)
* `sudo systemctl daemon-reload`
  * Everytime you make a change to the system service files you need to run this
* `sudo systemctl restart flask_backend`
  * To check the server logs: `sudo systemctl status flask_backend`

#### TLDR Flask server setup
* `sudo systemctl daemon-reload`
* `sudo systemctl restart flask_backend`
* `sudo systemctl status flask_backend`

### Y-websocket server setup
* Basically we want to run the command `npx y-websocket` in the /frontend folder and rerun this command if the websocket server crashes for any reason. Please see the Flask server setup starting from "Create a service..."
* `sudo systemctl restart y_websocket`
* `sudo systemctl status y_websocket`

### React setup
* Build the app: `npm run build`
* Contents should be stored under dist/
* Currently I'm building the app on my PC as the free tier EC2 instance gets an OOM error when building

### Nginx setup

For some reason on Amazon Linux Nginx there is no proxy params file ([site](https://stackoverflow.com/questions/42589781/django-nginx-emerg-open-etc-nginx-proxy-params-failed-2-no-such-file)) and sites-available directory [site](https://stackoverflow.com/questions/42589781/django-nginx-emerg-open-etc-nginx-proxy-params-failed-2-no-such-file) (should be there if install on Ubuntu)

* Copy proxy_params file: `sudo cp deployment/proxy_params /etc/nginx/proxy_params`
* Follow these [steps](https://stackoverflow.com/questions/17413526/nginx-missing-sites-available-directory) to make the sites-available/ directory
* Remove default site: `sudo rm /etc/nginx/sites-enabled/default`
* Copy Nginx site config: `sudo cp deployment/searten.nginx /etc/nginx/sites-available/searten.nginx`
  * Change value of root depending on the location of the build folder
* Create symlink (any changes are reflected in both files): `sudo ln -s /etc/nginx/sites-available/searten.nginx /etc/nginx/sites-enabled/searten.nginx`
* Start server: `sudo systemctl start nginx`
  * If you get a stat error follow these steps from the [site](https://stackoverflow.com/questions/25774999/nginx-stat-failed-13-permission-denied). Gives nginx access to all directories till the site root directory:
    * chmod +x /home/
    * chmod +x /home/ec2-user
    * chmod +x /home/ec2-user/Searten-API
    * chmod +x /home/ec2-user/Searten-API/frontend
    * chmod +x /home/ec2-user/Searten-API/frontend/dist
  * Anytime you make a change to the .nginx file, you need to reload the server using `sudo systemctl reload nginx`
  


## Other notes
* Should probably try to use https in the future --> remember to set `app.config["JWT_COOKIE_SECURE"] = True` in backend/run.py


