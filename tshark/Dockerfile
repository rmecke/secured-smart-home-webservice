FROM alpine:3.8

RUN apk update && apk add --update tshark && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache --upgrade bash

ADD init.sh /init.sh
RUN chmod 750 /init.sh

ADD eth0.sh /eth0.sh
RUN chmod 750 /eth0.sh

ADD wg0.sh /wg0.sh
RUN chmod 750 /wg0.sh

WORKDIR /

CMD ["./init.sh"]