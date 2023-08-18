# How to run the app locally

## Frontend

## Backend
### Database Setup
Install and run a Python virtual environment (eg Pyenv or Virtualenv). 
Install all the necessary pip modules for this project.
`pip install -r requirements.txt`

We are using git-secret as our secret manager. Your GPG public key needs to be added to git-secret and hidden files 
will need to be re-encrypted with all the keys in git-secret. Once this has been done, run:
`git secret reveal`
This should decrypt the config.json file which contains sensitive information such as Postgres credentials.

Now, we need to create the necessary role/database/tables in Postgres which our config.json relies on. 
<br />
Install a postgres server application/command line tool. Below are the steps to setup a postgresql server running in 
your WSL command line. Run the following commands:
<br />
`sudo apt-get update && sudo apt-get upgrade`
<br />
`sudo apt-get install postgresql`
<br />
Make sure the postgresql server process is running.
<br />
`sudo service postgresql [status]/[start]/[stop]/[restart]`
<br />
The command line tool to interact with this server process is "psql". Use the following commands to create
<br />
a role and database.
<br />
`sudo -u postgres psql`
<br />
`create database searten_db;`
<br />
`\c searten_db`
<br />
`create role searten_db_owner with login password 'POSTGRESQL DB PASSWORD IN config.json'`
<br />
`create role searten with login password 'POSTGRESQL DB PASSWORD IN config.json'`
<br />
`alter database searten_db owner to searten_db_owner;`
<br />
`grant searten_db_owner to searten;` 
<br />
Now we just have to create the tables necessary for the project. Exit the psql command line by pressing Ctrl+C or typing \q. Navigate to the root directory of our project.
<br />
`psql -U searten -h 127.0.0.1 -d searten_db -W -f ./backend/sql/init.sql`
<br />

### Python API
to run backend execute run.py in backend

# How to host the app on your computer 
The main goal is to route all the incoming traffic from your main router's IP address to your nginx server running on your computer.

## Finding IP address of your device 
* For linux, type in `hostname -I` into the terminal 
* For Windows follow any of these [steps](https://www.linksys.com/us/support-article?articleNum=137818#:~:text=Right%2Dclick%20the%20Start%20button,is%20your%20router's%20IP%20Address). Need to find the Default Gateway

If the IP address starts with 172, or 127 it means that your computer isn't directly connected to the main router (eg there is a mesh network and/or you are using a WSL which as a different IP to the Windows OS). So more port forwarding needs to be done.


## Fowarding traffic from router to your computer
These steps are for a TP-link router but any router should have a similar steps.

1. Get router's IP address `curl ifconfig.me` (for Linux)
2. Type in that IP address into Google
3. Go to Advanced > System Tools > Adminstration > Local Management > Change 'Port for HTTP' to 8080 (or any other one - just make sure you remember it!) > Save
4. Go to Advanced > NAT Forwarding > Virtual Servers > Add >
   1. Service Type: HTTP
   2. External Port: 80
   3. Internal IP: \<IP address of your computer or next network on the path to your computer\>
   4. Internal Port: 8080 (Ideally 80, but it didn't allow me to do that

If you have intermediary networks follow a similar process to above - forwarding the traffic to a specific IP address and port (gettig closer to your device)

For Windows, once you have forwarded the traffic to the Windows machine:
1. Create port proxy to route traffic to WSL machine, using `netsh interface portproxy add v4tov4 listenport=<80 (or from previous steps)> listenaddress=<Windows IP address> connectport=80 connectaddress=<WSL IP address>`. [Source](https://stackoverflow.com/questions/11525703/port-forwarding-in-windows)

## Setting up nginx
1. `sudo apt update`
2. `sudo apt install nginx`
3. Check for firewall:
   1. If `sudo ufw status` is active
      1. Enter `sudo ufw allow 'Nginx HTTP'`
      2. Check status to verify if it is allowed
   2. Otherwise just leave it disabled
4. Create instance: `sudo nano /etc/nginx/sites-enabled/<name>`
   1. Paste in:
```
server {
    listen 80;
    server_name <host computer IP>;

    location / {
        proxy_pass <http://127.0.0.1:3000 or what ever port your Vite is running>;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

5. Load in new config file:
   1. `sudo unlink /etc/nginx/sites-enabled/default`
   2. `sudo /etc/init.d/nginx reload` or `sudo service nginx reload`

6. Start Postgres, Flask and Vite App
6. Start nginx server: `sudo service nginx start`
   1. Note: anytime you make a change to '/etc/nginx/sites-enabled/<name>' you need to reload or restart the server
7. Hopefully it should work now - still trying to figure out how to fix the CORS errors

