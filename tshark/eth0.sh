#!/bin/bash

if [ -d "./logs/" ]; then
    mkdir -p ./logs/tshark
    tshark -i eth0 -g -f "${TSHARK_ETH0_FILTER}" -b duration:"${TSHARK_DURATION}" -b interval:"${TSHARK_DURATION}" -b files:"${TSHARK_FILES}" -F pcapng -w ./logs/tshark/eth0.pcapng
fi