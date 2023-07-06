#!/bin/bash

if [ -d "/logs/" ]; then
    TSHARK_DURATION_DEFAULT="3600"
    TSHARK_FILES_DEFAULT="24"
    TSHARK_ETH0_FILTER_DEFAULT="port 51820"

    ${TSHARK_DURATION:=${TSHARK_DURATION_DEFAULT}}
    ${TSHARK_FILES:=${TSHARK_FILES_DEFAULT}}
    ${TSHARK_ETH0_FILTER:=${TSHARK_ETH0_FILTER_DEFAULT}}

    echo "=============================================="
    echo "           Tshark Logger started.             "
    echo "                                              "
    echo "      Logfiles will be written to /logs/.     "
    echo "                                              "
    echo " Capture duration: ${TSHARK_DURATION}         "
    echo " Files to keep:    ${TSHARK_FILES}            "
    echo " Filter for eth0:  ${TSHARK_ETH0_FILTER}      "
    echo "                                              "
    echo "=============================================="

    export TSHARK_DURATION=${TSHARK_DURATION}
    export TSHARK_FILES=${TSHARK_FILES}
    export TSHARK_ETH0_FILTER=${TSHARK_ETH0_FILTER}

    ./eth0.sh & ./wg0.sh
fi

