#!/bin/sh
set -e
# Railway routes traffic to $PORT. Nginx must listen on $PORT; Java runs on 5000.
export PORT="${PORT:-80}"
NGINX_CONF="/etc/nginx/nginx.conf"
sed "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf.template > "$NGINX_CONF"
# Start Java on 5000 (backend), then nginx on $PORT (frontend + proxy)
export SERVER_PORT=5000
java -jar /app/app.jar &
exec nginx -g "daemon off;"
