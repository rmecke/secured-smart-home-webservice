#!/bin/bash

#
# Script options (exit script on command fail).
#
#set -e

INOTIFY_VOLUMES_DEFAULT=""
INOTIFY_EVENTS_DEFAULT="create,delete,modify,move,access,open,close"
INOTIFY_OPTIONS_DEFAULT='--monitor --exclude "*.sw[px]" --recursive'

WATCH_DIFFERENCES_DEFAULT=""

#
# Display settings on standard out.
#
echo "Settings"
echo "================"
echo
echo "  Volumes:            ${VOLUMES:=${INOTIFY_VOLUMES_DEFAULT}}"
echo "  Inotify_Events:     ${INOTIFY_EVENTS:=${INOTIFY_EVENTS_DEFAULT}}"
echo "  Inotify_Options:    ${INOTIFY_OPTIONS:=${INOTIFY_OPTIONS_DEFAULT}}"
echo "  Watch_Differences:  ${WATCH_DIFFERENCES:=${WATCH_DIFFERENCES_DEFAULT}}"
echo 

#
# Init snapshot copies
#
IFS=' ' read -r -a diff_array <<< "$WATCH_DIFFERENCES"
mkdir -p snaps
for file in "${diff_array[@]}"
do
    path_old="snaps/$file"
    snap_path="${path_old//\/\//\/}"
    mkdir -p "$snap_path"
    cp "$file" "$snap_path"
done


#
# Inotify part.
#
echo "[Starting inotifywait...]"
inotifywait -e ${INOTIFY_EVENTS} ${INOTIFY_OPTIONS} "${VOLUMES}" | \
    #while read -r notifies;
    #do
    #	echo "$notifies"
        #echo "notify received, sent signal ${SIGNAL} to container ${CONTAINER}"
        #curl ${CURL_OPTIONS} -X POST --unix-socket /var/run/docker.sock http:/containers/${CONTAINER}/kill?signal=${SIGNAL} > /dev/stdout 2> /dev/stderr
    #done
    while read -r path action file; do
        timestamp=$(date +%s)
        timestr=$(date '+%D %T (%Z)')
        datestr=$(date '+%d_%m_%Y')
        echo "'$timestamp' | '$timestr' | Directory: '$path' | File: '$file' | Action: '$action'"
        
        fullpath="$path$file"
        if [ "$path" == "" ]; then
            fullpath="$file"
        fi

        echo "fullpath=$fullpath"

        if [ -d "./logs/" ]; then
            echo "'$timestamp' | '$timestr' | Directory: '$path' | File: '$file' | Action: '$action'" >> "./logs/inotify_events_$datestr.log"
        fi

        # Print file differences, and copy snapshot
        if [ "$action" == "MODIFY" ]; then
            if printf '%s\0' "${diff_array[@]}" | grep -Fxq -- "$fullpath"; then
                path_old="snaps/$fullpath"
                snap_path="${path_old//\/\//\/}"
                echo "'$timestamp' | '$timestr' | Getting file difference for $fullpath and $snap_path ..."
                diff -u "./$snap_path" "./$fullpath"
                if [ -d "./logs/" ]; then
                    echo "'$timestamp' | '$timestr' | Getting file difference for $fullpath and $snap_path ..." >> "./logs/inotify_diffs_$datestr.log"
                    diff -u "./$snap_path" "./$fullpath" >> "./logs/inotify_diffs_$datestr.log"
                fi
                cp "$fullpath" "$snap_path"
            fi
        fi 
    done

    