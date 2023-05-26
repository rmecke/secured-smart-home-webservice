FROM alpine:3.8

RUN apk add --update curl && \
    rm -rf /var/cache/apk/*

RUN apk --update upgrade && \
    apk add --update inotify-tools && \
    rm -rf /var/cache/apk/*

RUN apk add --no-cache --upgrade bash

RUN apk add --no-cache --upgrade diffutils

ADD init.sh /init.sh
RUN chmod 750 /init.sh

WORKDIR /

CMD ["./init.sh"]