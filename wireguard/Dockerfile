FROM linuxserver/wireguard

COPY /root /

RUN rm -f /etc/s6-overlay/s6-rc.d/svc-wireguard-logger/run

RUN tr -d '\r' < /etc/s6-overlay/s6-rc.d/svc-wireguard-logger/run.sh > /etc/s6-overlay/s6-rc.d/svc-wireguard-logger/run

RUN chmod 750 /etc/s6-overlay/s6-rc.d/svc-wireguard-logger/run