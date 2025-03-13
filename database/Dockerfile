# Use the official PostgreSQL image
FROM postgres:latest

# Set environment variables (change values as needed)
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=stock_db

# Copy initialization scripts (optional, if you want to run SQL scripts)
COPY ./init-db.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
