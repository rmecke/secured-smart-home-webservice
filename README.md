# Secured-Smart-Home Webservice

## About

This repository contains all services needed to provide a webservice for a smart home based on an ioBroker server.
To ensure a simple installation approach, docker is used to run all these services:
- Wireguard:    This service is used to create a VPN server to which the ioBroker server can establish a secure connection.
- Frontend:     This service provides a React frontend application to control the ioBroker devices remotely.
- Backend:      This service provides an API with authentification to handle the user requests sent by the frontend.
                It forwards the smart home actions to the ioBroker service using the secure VPN connection.
- Database:     This service provides a database for the backend to enable authentification.


## Installation

Run ```docker compose up -d --build```  to start the containers.

## Warning

The ```docker-compose.yml``` contains some exposed ports. Note, that this means, that they can automatically be accessed by the outside world - 
No matter, if you have set other firewall rules with commands manually. See https://docs.docker.com/network/iptables/ for more informations.

For more security, you can remove the ports 54000 and 54001 from the listed ports in ```docker-compose.yml```. This ensures,
that the ports can only be accessed through the VPN tunnel. So you can only control the smart home, if you are using a device logged in to the VPN.
In that case, make sure that the frontend calls the internal VPN IP of the server (e.g. 10.13.13.1).


## SSL-Certificate

It is recommended to use a ssl-certificate. You can enable HTTPS within the ```docker-compose.yml```.
Just set the HTTPS environment variable for frontend and backend to true, and you are good to go.
Make sure to place the "key.pem" and "crt.pem" in the folder "ssl_certificate".


## VPN-Configuration

The VPN access keys for the peers will be generated into the ```vpn_config```` folder.
You need the access data of one peer for the secured-smart-home-ioBroker instance.
The access data of the other peers can be used to connect smartphones or notebooks to the VPN network.


## References

https://www.bezkoder.com/react-redux-jwt-auth/

https://adamtheautomator.com/https-nodejs/