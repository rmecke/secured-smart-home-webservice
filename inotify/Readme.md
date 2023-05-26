# Credits to

https://github.com/pstauffer/docker-curl/tree/master

and 

https://github.com/pstauffer/docker-inotify/tree/master

# Another helpful piece came from

https://stackoverflow.com/questions/70117645/inotify-on-docker-mounted-volumes-mac-linux

https://stackoverflow.com/questions/3685970/check-if-a-bash-array-contains-a-value

https://gist.github.com/fdob/5983637 --> file differences

# Adaptions

The original docker containers needed a rework due to:
- The original arch was amd64, but raspberry pi 4 has an arm64 architecure.
- The original image used curl to broadcast the events to another "listener"-container. 
  For the sake of simplicity, the event will not be broadcasted through docker - but instead will be handled directly in this container.