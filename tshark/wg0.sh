#!/bin/bash

if [ -d "./logs/" ]; then
    mkdir -p ./logs/tshark
    tshark -i wg0 -g -b duration:"${TSHARK_DURATION}" -b interval:"${TSHARK_DURATION}" -b files:"${TSHARK_FILES}" -F pcapng -w ./logs/tshark/wg0.pcapng
fi