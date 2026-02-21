# Stage 1: Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build -- --configuration=production

# Stage 2: Backend build
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn package -DskipTests -B

# Stage 3: Final image - Nginx + Java
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache nginx curl

WORKDIR /app

# Copy frontend static files
COPY --from=frontend-build /app/dist/frontend/browser /usr/share/nginx/html

# Nginx config template (PORT substituted at runtime for Railway)
COPY frontend/nginx.standalone.full.conf.template /etc/nginx/nginx.conf.template

# Entrypoint: substitute PORT, start Java on 5000, nginx on $PORT
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy backend JAR (single executable JAR; * would match -plain.jar too and break COPY)
COPY --from=backend-build /app/target/cirquetask-backend-1.0.0.jar app.jar

# Create nginx directories
RUN mkdir -p /run/nginx

EXPOSE 80

# Railway sends traffic to $PORT; entrypoint makes nginx listen on $PORT, Java on 5000
ENTRYPOINT ["/docker-entrypoint.sh"]
