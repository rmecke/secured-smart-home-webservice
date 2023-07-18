# About this repository

This repository provides a docker configuration for running a webservice for a smart home based on an ioBroker server. Also it provides useful utilities for forensic readiness.
The main docker configuration consists of 8 images/containers (docker-compose.yml):
- **wireguard**: Enables the VPN-Tunneling through the WireGuard-Protocol. This is needed for a secure connection with the smart home instance (ioBroker).
- **frontend**: This service provides a React frontend application to control the ioBroker devices remotely.
- **backend**: This service provides an API with authentification to handle the user requests sent by the frontend. It forwards the smart home actions to the ioBroker service using the secure VPN connection.
- **database**: This service provides a database for the backend to enable authentification.
- **wireshark** (optional): Live analysis of network activities. Traffic could be observed from another device in remotely via browser.
- **inotify** (optional): Mass storage logging. File activities related to the iobrokerdata-directory will be catched and written to logfiles.
- **tshark** (optional): Network logging. Network activities related to the wg0- and eth0-interface will be catched and written to logfiles.
- **gotify** (optional): An open source notification service, to provide a self-hosted alternative to commercial products.

The additional docker configuration consists of 6 images/containers (docker-compose-monitoring.yml):
- **Grafana** (optional): Visualisation platform for monitoring and logging overview.
- **Prometheus** (optional): Collect the statistics from Node-Exporter and cAdvisor for later visualisation in Grafana.
- **Node-Exporter** (optional): Provide hardware/system statistics.
- **cAdvisor** (optional): Provide docker container statistics.
- **Loki** (optional): Collect the logging data from Promtail for later visualisation in Grafana.
- **Promtail** (optional): Retrieve logfiles and provide preprocessed logging data.

## Installation

### Adapt the settings inside docker compose file
Configure the ```docker-compose.yml``` and ```docker-compose-monitoring.yml``` according to the desired setup. Also check, which optional services are necessary and, if admin-credentials are listed in the compose-file, change the credentials to secret ones. Especially have a look at the URL endpoints, they need to match the provided domain, ports and tls-status. It is highly recommended to use TLS encryption as it ensures secure communication between user and webservice.

### SSL-Certificate

It is recommended to use a ssl-certificate. You can enable HTTPS within the ```docker-compose.yml```. Just set the HTTPS environment variable for frontend and backend to true, and you are good to go. Make sure to place the "key.pem" and "crt.pem" in the folder "ssl_certificate".

### Some security advices

The ```docker-compose.yml``` contains some exposed ports. Note, that this means, that they can automatically be accessed by the outside world - 
No matter, if you have set other firewall rules with commands manually. See https://docs.docker.com/network/iptables/ for more informations.

For more security, you can remove the ports 54000 and 54001 from the listed ports in ```docker-compose.yml```. This ensures, that the ports can only be accessed through the VPN tunnel. So you can only control the smart home, if you are using a device logged in to the VPN. In that case, make sure that the frontend calls the internal VPN IP of the server (e.g. 10.13.13.1).

### Start the containers

Run ```docker compose up -d --build``` and at least four containers will start: wireguard, frontend, backend and database. The other containers are optional.

Run ```docker compose -f docker-compose-monitoring.yml up -d --build``` to start the optional monitoring related containers. These are all optional, according to their additional overhead.

### Retrieve the VPN-Configuration

The VPN access keys for the peers will be generated into the ```vpn_config``` folder.
You need the access data of one peer for the secured-smart-home-iobroker instance.
The access data of the other peers can be used to connect smartphones or notebooks to the VPN network, if necessary.


## Troubleshooting

### Monitoring: Enable cgroups

Edit the /boot/cmdline.txt as following:
```cgroup_enable=cpuset```
```cgroup_enable=memory```
```cgroup_memory=1```.

After that, restart the device with ```sudo reboot```.

## References

Also I would like to mention the following sources, which gave me an orientation on how to handle some issues:
- https://adamtheautomator.com/https-nodejs/ for setting up a basic webservice.
- https://www.bezkoder.com/react-redux-jwt-auth/ for setting up JWT authentification using access and refresh tokens.
- https://github.com/bezkoder/react-jwt-auth for authentification.
- https://github.com/abduvik/home-automation-ui for a great smart home ui as starting point.
- https://github.com/ioBroker/ioBroker.socketio for websocket connection with ioBroker.
- https://www.linode.com/docs/guides/authenticating-over-websockets-with-jwt/ for a JWT-protected webservice.
- https://www.geeksforgeeks.org/jwt-authentication-with-refresh-tokens/ for a guide on refresh tokens.