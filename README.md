## Installation

Run ```docker compose up -d --build```  to start the containers.

## Warning

The ```docker-compose.yml``` contains some exposed ports. Note, that this means, that they can automatically be accessed by the outside world - 
No matter, if you have set other firewall rules with commands manually. See https://docs.docker.com/network/iptables/ for more informations.

For more security, you can remove the ports 54000 and 3000 from the listed ports in ```docker-compose.yml```. This ensures,
that the ports can only be accessed through the VPN tunnel. So you can only control the smart home, if you are using a device logged in to the VPN.
In that case, make sure that the frontend calls the internal VPN IP of the server (e.g. 10.13.13.1).