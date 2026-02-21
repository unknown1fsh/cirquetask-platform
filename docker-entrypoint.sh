#!/bin/sh
set -e
# Railway routes traffic to $PORT. Nginx must listen on $PORT; Java runs on 5001 (5000 ile cakismasin).
export PORT="${PORT:-80}"
NGINX_CONF="/etc/nginx/nginx.conf"
sed "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf.template > "$NGINX_CONF"
# Start Java on 5001 (backend; 5000 Railway tarafindan PORT olarak atanabilir)
export SERVER_PORT=5001
java -jar /app/app.jar &
# Nginx'i hemen baslat; Railway health check zaman asimina dusmesin. Backend birkaç saniye icinde ayaga kalkar.
exec nginx -g "daemon off;"
