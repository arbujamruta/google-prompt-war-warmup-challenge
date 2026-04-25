# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the static files to Nginx's default public directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY data.json /usr/share/nginx/html/

# Expose port 8080 (Cloud Run default requirement for custom containers if configured, but default Nginx uses 80. Let's configure it for 8080)
# We override the default nginx config to listen on port 8080 instead of 80 to easily support Cloud Run's default expectations
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
