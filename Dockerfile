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
RUN apk add --no-cache nginx

WORKDIR /app

# Copy frontend static files
COPY --from=frontend-build /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx config (standalone - backend on 127.0.0.1)
COPY frontend/nginx.standalone.conf /etc/nginx/conf.d/default.conf

# Copy backend JAR (single executable JAR; * would match -plain.jar too and break COPY)
COPY --from=backend-build /app/target/cirquetask-backend-1.0.0.jar app.jar

# Create nginx directories
RUN mkdir -p /run/nginx

EXPOSE 80

# Start both: Java in background, Nginx in foreground
CMD java -jar app.jar & nginx -g "daemon off;"
