# Deployment Guide

This guide covers deploying the Asteroid Impact Simulator to production.

## Deployment Options

### Option 1: Traditional VPS (Recommended)

**Providers:** DigitalOcean, Linode, AWS EC2, Google Cloud

**Requirements:**
- Ubuntu 20.04+ or similar
- 2GB RAM minimum
- Node.js 16+
- Python 3.8+
- Nginx (reverse proxy)
- SSL certificate

**Steps:**

1. **Set up server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3 python3-pip python3-venv
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone repository**
   ```bash
   cd /var/www
   sudo git clone <your-repo-url> asteroid-simulator
   cd asteroid-simulator
   ```

3. **Install dependencies**
   ```bash
   # Node.js
   npm install --production
   
   # Python virtual environment
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   sudo nano .env
   ```
   
   Add:
   ```
   NASA_API_KEY=your_actual_key
   PORT=3000
   FLASK_PORT=5000
   NODE_ENV=production
   ```

5. **Set up PM2 (process manager)**
   ```bash
   sudo npm install -g pm2
   
   # Start Node.js server
   pm2 start server.js --name asteroid-node
   
   # Start Flask server
   pm2 start "venv/bin/python app.py" --name asteroid-flask
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/asteroid-simulator
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Redirect to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # Node.js app
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Flask API
       location /api/calculate {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/asteroid-simulator /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

8. **Configure firewall**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow OpenSSH
   sudo ufw enable
   ```

### Option 2: Docker Deployment

**Create Dockerfile:**

```dockerfile
# Node.js stage
FROM node:18-alpine AS node-app
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js .
COPY public ./public

# Python stage
FROM python:3.10-slim AS python-app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

# Final stage
FROM node:18-alpine
WORKDIR /app

# Copy Node.js app
COPY --from=node-app /app /app

# Install Python
RUN apk add --no-cache python3 py3-pip

# Copy Python app
COPY --from=python-app /app/app.py .
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 3000 5000

# Start both servers
CMD ["sh", "-c", "node server.js & python3 app.py"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  asteroid-simulator:
    build: .
    ports:
      - "3000:3000"
      - "5000:5000"
    environment:
      - NASA_API_KEY=${NASA_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - asteroid-simulator
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 3: Heroku

**Procfile:**
```
web: node server.js
worker: python app.py
```

**Deploy:**
```bash
heroku create your-app-name
heroku config:set NASA_API_KEY=your_key
git push heroku main
```

### Option 4: Vercel (Frontend) + Railway (Backend)

**Vercel for Node.js:**
```bash
npm i -g vercel
vercel
```

**Railway for Flask:**
- Connect GitHub repo
- Deploy Python app
- Set environment variables

### Option 5: AWS

**Services needed:**
- EC2 for servers
- Route 53 for DNS
- CloudFront for CDN
- S3 for static assets
- Certificate Manager for SSL

## Performance Optimization

### 1. Enable Gzip Compression

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 2. Cache Static Assets

**Nginx:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN Integration

Use CloudFlare, AWS CloudFront, or similar:
- Cache static assets
- DDoS protection
- Global distribution

### 4. Database Caching (if added)

Use Redis for:
- NASA API response caching
- Calculation result caching
- Session management

### 5. Load Balancing

For high traffic:
```nginx
upstream backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

## Monitoring

### 1. PM2 Monitoring

```bash
pm2 monit
pm2 logs
```

### 2. Server Monitoring

Install monitoring tools:
```bash
# Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Or Prometheus + Grafana
```

### 3. Application Monitoring

- **Sentry** for error tracking
- **Google Analytics** for usage
- **LogRocket** for session replay

### 4. Uptime Monitoring

- UptimeRobot
- Pingdom
- StatusCake

## Backup Strategy

### 1. Code Backup

- Use Git with remote repository
- Regular commits
- Tag releases

### 2. Database Backup (if applicable)

```bash
# Automated daily backup
0 2 * * * /usr/bin/backup-script.sh
```

### 3. Configuration Backup

```bash
# Backup .env and configs
tar -czf backup-$(date +%Y%m%d).tar.gz .env nginx.conf
```

## Security Checklist

- [ ] Use HTTPS only
- [ ] Set secure headers
- [ ] Rate limit API endpoints
- [ ] Validate all inputs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable firewall
- [ ] Regular security audits
- [ ] Monitor logs for suspicious activity
- [ ] Implement CORS properly

**Security Headers (Nginx):**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://d3js.org https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;
```

## Scaling

### Vertical Scaling
- Upgrade server resources
- More CPU/RAM
- Faster storage

### Horizontal Scaling
- Multiple server instances
- Load balancer
- Shared session storage

### Database Scaling (if added)
- Read replicas
- Sharding
- Caching layer

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor uptime
- Review performance metrics

**Weekly:**
- Update dependencies
- Review security alerts
- Check disk space

**Monthly:**
- Security audit
- Performance optimization
- Backup verification

### Update Process

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm update
pip install -r requirements.txt --upgrade

# Restart services
pm2 restart all

# Verify
curl https://your-domain.com/api/health
```

## Troubleshooting

### Server won't start

```bash
# Check logs
pm2 logs
journalctl -u nginx

# Check ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5000
```

### High memory usage

```bash
# Check processes
htop
pm2 monit

# Restart if needed
pm2 restart all
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Cost Estimation

### Small Scale (< 1000 users/day)
- VPS: $5-10/month
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- **Total: ~$10/month**

### Medium Scale (1000-10000 users/day)
- VPS: $20-40/month
- CDN: $10-20/month
- Monitoring: $10/month
- **Total: ~$50/month**

### Large Scale (>10000 users/day)
- Multiple servers: $100+/month
- Load balancer: $20/month
- CDN: $50+/month
- Database: $30/month
- Monitoring: $30/month
- **Total: ~$250+/month**

## Support

For deployment issues:
- Check server logs
- Review Nginx error logs
- Test API endpoints
- Verify environment variables
- Check firewall rules

---

**Good luck with your deployment!** 🚀
