#!/bin/sh
set -e
# Railway routes traffic to $PORT. Nginx must listen on $PORT; Java runs on 5000.
export PORT="${PORT:-80}"
NGINX_CONF="/etc/nginx/nginx.conf"
sed "s/__PORT__/${PORT}/g" /etc/nginx/nginx.conf.template > "$NGINX_CONF"
# Start Java on 5000 (backend)
export SERVER_PORT=5000
java -jar /app/app.jar &
# Wait for backend to be ready so frontend is not served before API is up
wait_for_backend() {
  i=0
  while [ $i -lt 60 ]; do
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:5000/actuator/health" | grep -q 200; then
      return 0
    fi
    i=$((i + 1))
    sleep 1
  done
  return 1
}
wait_for_backend || true
# Then start nginx on $PORT (frontend + proxy to backend)
exec nginx -g "daemon off;"
