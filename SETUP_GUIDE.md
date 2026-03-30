# Juice Bar POS Frontend - Setup & Deployment Guide

## Quick Setup (Local Development)

### Step 1: Verify Backend is Running

Ensure all backend services are running:

```bash
# Terminal 1: Config Server
cd platform/config-server
mvn spring-boot:run

# Terminal 2: Eureka Server
cd platform/eureka-server
mvn spring-boot:run

# Terminal 3: API Gateway
cd platform/api-gateway
mvn spring-boot:run

# Terminal 4+: Microservices
cd services/user-service
mvn spring-boot:run

cd services/product-service
mvn spring-boot:run

cd services/order-service
mvn spring-boot:run
```

Or use the convenience script:
```bash
# Run all services
bash scripts/run-local.sh  # Linux/Mac
scripts/run-local.cmd      # Windows
```

### Step 2: Update Frontend Files

1. Replace old `frontend/index.html` with `frontend/new-index.html`
   ```bash
   cp frontend/new-index.html frontend/index.html
   ```

2. Or just open `new-index.html` directly in your browser

### Step 3: Access the Application

- Open in browser: `http://localhost:8000` (if serving via simple HTTP server)
- Or simply open the HTML file directly: `file:///path/to/frontend/new-index.html`

### Step 4: Test the Application

1. **Register** a new account
2. **Login** with your credentials
3. **Add Products** with images
4. **Place Orders** using POS interface
5. **View Dashboard** and order history

## Development Server Setup

### Option 1: Python Simple HTTP Server

```bash
cd /path/to/Cloud/frontend

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Node.js HTTP Server

```bash
# Install globally
npm install -g http-server

# Run
cd /path/to/Cloud/frontend
http-server -p 8000
```

### Option 3: Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click `new-index.html`
3. Select "Open with Live Server"

### Option 4: Using Vite (Recommended for Development)

```bash
cd /path/to/Cloud/frontend

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
EOF

# Install Vite
npm install -D vite

# Run dev server
npm run dev
```

## API Gateway Configuration

Ensure the API Gateway is configured to handle frontend requests:

**File**: `platform/api-gateway/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8081
          predicates:
            - Path=/auth/**,/users/**
        - id: product-service
          uri: http://localhost:8082
          predicates:
            - Path=/products/**
        - id: order-service
          uri: http://localhost:8083
          predicates:
            - Path=/orders/**
```

## Testing the Frontend

### 1. Manual Testing

**Authentication**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Logout and verify session cleared

**Products**
- [ ] View all products
- [ ] Create new product
- [ ] Upload product image (verify in GCP)
- [ ] Search products

**POS**
- [ ] Add items to cart
- [ ] Modify quantities
- [ ] Remove items from cart
- [ ] View cart total
- [ ] Place order

**Orders**
- [ ] View order history
- [ ] Check order details
- [ ] Verify correct amounts

**Dashboard**
- [ ] Verify statistics update
- [ ] Check recent orders list

### 2. Automated Testing with Postman

Use the included Postman collections:

```
postman/
├── Mini-POS-Collection.json
└── api-gateway-full-collection.json
```

1. Import collection in Postman
2. Set up environment variables:
   - `base_url` = `http://localhost:8080`
   - `token` = (obtained from login response)
3. Run collection tests

## Deployment to GCP VM

### Prerequisites
- GCP project created
- VM instance running Ubuntu 22.04
- SSH access configured
- Firewall rules allowing ports 8080, 8888, 8761, 8081-8083

### Step 1: Deploy Backend Services

```bash
# SSH into VM
gcloud compute ssh instance-name --zone=zone-name

# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Install Maven
sudo apt install maven -y

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/your-repo/Cloud.git
cd Cloud

# Build all services
bash scripts/build-all.sh

# Install PM2 for process management
curl https://raw.githubusercontent.com/creationix/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
npm install -g pm2

# Start services with PM2
pm2 start pm2/ecosystem.config.js
pm2 save
pm2 startup
```

### Step 2: Deploy Frontend

```bash
# Option A: Serve with Node.js
npm install -g http-server
pm2 start "http-server frontend -p 3000" --name "pos-frontend"

# Option B: Use Nginx
sudo apt install nginx -y

# Create nginx config
sudo tee /etc/nginx/sites-available/pos << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /home/user/Cloud/frontend;
    index new-index.html;
    
    location / {
        try_files $uri $uri/ /new-index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: Configure SSL/TLS (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 4: Monitor Deployment

```bash
# Check PM2 processes
pm2 monit

# View logs
pm2 logs

# Check Nginx
sudo systemctl status nginx
tail -f /var/log/nginx/access.log

# Check API Gateway
curl http://localhost:8080/health
```

## Environment Variables

Create `.env` file in frontend root:

```bash
# Frontend Config
VITE_API_BASE=http://localhost:8080
VITE_APP_NAME="Juice Bar POS"

# Optional: Development
VITE_DEBUG=false
```

Then in `js/api.js`:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
```

## Troubleshooting Deployment

### Issue: CORS Errors

**Solution**: Configure CORS in API Gateway

```yaml
# In platform/api-gateway/src/main/java/...
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(false)
                    .maxAge(3600);
            }
        };
    }
}
```

### Issue: Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
PORT=8081 npm start
```

### Issue: Images Not Loading from GCP

1. Verify GCS bucket exists and is accessible
2. Check service account permissions
3. Verify image URLs are correct
4. Check GCP CORS settings

```bash
# Set CORS on GCS bucket
gsutil cors set - gs://your-bucket << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

### Issue: Database Connection Errors

```bash
# Check database is running
# For MySQL (User Service)
mysql -h localhost -u root -p -e "SHOW DATABASES;"

# For MongoDB (Product/Order Service)
mongo --eval "db.adminCommand('ping')"
```

## Performance Optimization

### Frontend Optimization

1. **Minify CSS/JS**
   ```bash
   npm install -D terser cssnano
   ```

2. **Compress Images**
   ```bash
   npm install -D imagemin
   ```

3. **Enable Gzip**
   - Nginx: Add `gzip on;` to nginx.conf
   - Node: Use `compression` middleware

### Backend Optimization

1. **Database Indexing** - Already done in migrations
2. **Caching** - Configure Redis
3. **Load Balancing** - Use Nginx reverse proxy

## Backup & Recovery

### Database Backup

```bash
# MySQL backup
mysqldump -u root -p user_service > backup_user.sql

# MongoDB backup
mongodump --archive=backup_orders.archive
```

### Restore

```bash
# MySQL restore
mysql -u root -p user_service < backup_user.sql

# MongoDB restore
mongorestore --archive=backup_orders.archive
```

## Monitoring & Logging

### View Logs

```bash
# PM2 logs
pm2 logs

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u pm2 -f
```

### Health Checks

```bash
# API Gateway health
curl http://localhost:8080/actuator/health

# Service health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
```

## Version Control

Ensure `.gitignore` contains:

```
node_modules/
dist/
.env
.env.local
.vscode/
.idea/
*.jar
target/
build/
```

## Maintenance

### Regular Tasks

1. **Weekly**: Check logs and monitor performance
2. **Monthly**: Backup databases
3. **Quarterly**: Update dependencies
4. **Yearly**: Security audit

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update packages
npm update
npm audit fix
```

## Support & Documentation

- API Documentation: See Postman collections
- Backend Code: See `services/` directory
- Configuration: See `config-repo/` directory

---

**Happy Coding! 🍊**

