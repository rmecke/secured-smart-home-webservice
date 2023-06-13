#!/usr/bin/with-contenv bash
# shellcheck shell=bash

if [ -d "/logs/" ]; then
    echo "=============================================="
    echo "          WireGuard Logger started.           "
    echo "                                              "
    echo "      Logfiles will be written to /logs/.     "
    echo "=============================================="

    while true; do
        timestamp=$(date +%s)
        timestr=$(date '+%D %T (%Z)')
        datestr=$(date '+%d_%m_%Y')
        {
            echo "=============================================="
            echo "Wireguard Status on '$timestamp' | '$timestr':"
            wg show
            echo "=============================================="
        } >> "/logs/wireguard_$datestr.log"
        sleep 60;
    done
fi