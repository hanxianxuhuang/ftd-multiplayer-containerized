# ftd-multiplayer
A multiplayer shooting game 

## [Singleplayer Version](https://github.com/hanxianxuhuang/ftd-singleplayer)

## Tools
React, Web Sockets, Material-UI, MongoDB, PostgreSQL, JavaScript, jQuery, Restful API, Node.js, Express.js, Ajax and Middleware

## Setup

### VM
[A Ubuntu Server](https://ubuntu.com/download/server/step2) (others may also work) that has network connection configured to Bridged

### Installing required packages
```
sudo apt install nodejs npm postgresql
```

### Setting up PostgreSQL
```
sudo -u postgres createuser webdbuser
sudo -u postgres psql

ALTER USER webdbuser WITH ENCRYPTED PASSWORD 'password';
CREATE DATABASE webdb;
GRANT ALL PRIVILEGES ON DATABASE webdb TO webdbuser;
EXIT
```


### Setting up and starting the server
```
# cd into the directory
cd server && chmod +x setup.bash && ./setup.bash
```


### Setting up and starting the client (React)
```
# bring up another terminal and cd into the directory
cd client && chmod +x setup.bash && ./setup.bash
```

## Usage
- ```cd server && npm start``` if the server has not started
- ```cd client && npm start``` if the client has not started
- Visit IP_ADDRESS:3000 in browser (use ```ip a``` to determine IP_ADDRESS)

