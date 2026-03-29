# ⚡ Quick Start Guide - 5 Minutes

Get the Juice Bar POS system running in 5 minutes!

## Prerequisites

✅ Backend services running (API Gateway on port 8080)
✅ Modern web browser
✅ (Optional) Simple HTTP server

---

## Step 1: Prepare Frontend (1 minute)

### Option A: Direct File Opening
1. Navigate to `/frontend/`
2. Open `new-index.html` directly in your browser
3. **Done!** Application loads instantly

### Option B: Using Python Server
```bash
cd /path/to/Cloud/frontend
python -m http.server 8000
# Open: http://localhost:8000/new-index.html
```

### Option C: Using Node.js Server
```bash
cd /path/to/Cloud/frontend
npx http-server -p 8000
# Open: http://localhost:8000/new-index.html
```

---

## Step 2: Start Backend (2 minutes)

Make sure API Gateway is running:

```bash
cd /path/to/Cloud

# Quick start all services
bash scripts/run-local.sh  # macOS/Linux
scripts/run-local.cmd      # Windows
```

Or manually:
```bash
# Terminal 1: Config Server
cd platform/config-server && mvn spring-boot:run

# Terminal 2: Eureka Server
cd platform/eureka-server && mvn spring-boot:run

# Terminal 3: API Gateway
cd platform/api-gateway && mvn spring-boot:run

# Terminal 4-6: Microservices
cd services/user-service && mvn spring-boot:run
cd services/product-service && mvn spring-boot:run
cd services/order-service && mvn spring-boot:run
```

---

## Step 3: Test Application (2 minutes)

### 3.1 Register Account
1. Open frontend in browser
2. Click "Create one" to toggle register mode
3. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Create Account"
5. ✅ Should see dashboard

### 3.2 Create Product
1. Go to **Products** tab
2. Click **+ Add Product**
3. Fill in:
   - Name: `Orange Juice`
   - Price: `4.99`
   - Type: `Juice`
4. Click "Create Product"
5. ✅ Product appears in grid

### 3.3 Upload Image (Optional)
1. Click 📸 on the product card
2. Select an image file (or drag & drop)
3. Click "Upload Image"
4. ✅ Image displays on product card

### 3.4 Place Order
1. Go to **POS** tab
2. Click on "Orange Juice" product
3. In cart on right, adjust quantity (use +/- buttons)
4. Click "Place Order"
5. ✅ See success message

### 3.5 View Orders
1. Go to **Orders** tab
2. ✅ See your order in the table
3. Check amount, date, quantity

### 3.6 Check Dashboard
1. Go to **Dashboard** tab
2. ✅ See statistics:
   - Products: 1
   - Orders: 1
   - Revenue: $4.99
   - Items Sold: 1

---

## Common Issues & Fixes

### Issue: Can't connect to API
```
❌ Error: "Request failed"
✅ Solution: Ensure API Gateway running on :8080
```

Check:
```bash
curl http://localhost:8080/products
# Should return empty array or products list
```

### Issue: Images not uploading
```
❌ Error: "Failed to upload image"
✅ Solution: Check GCP credentials & bucket
```

Verify GCP setup in `config-repo/product-service.yml`

### Issue: Login fails
```
❌ Error: "Invalid credentials"
✅ Solution: Check backend database connection
```

Make sure user-service has database configured.

### Issue: No products showing
```
❌ Error: Products grid empty
✅ Solution: Create products first or check API
```

Go to Products tab and create a product.

---

## API Endpoints Quick Reference

```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass"}'

# Get products
curl http://localhost:8080/products

# Create product
TOKEN="your-jwt-token"
curl -X POST http://localhost:8080/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Orange Juice","price":4.99}'

# Place order
curl -X POST http://localhost:8080/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":"p1","quantity":2}'

# Get user orders
curl http://localhost:8080/orders/user/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt + D | Go to Dashboard |
| Alt + S | Go to POS |
| Alt + P | Go to Products |
| Alt + O | Go to Orders |
| Escape | Close modals |
| Enter | Submit forms |

---

## File Structure

```
frontend/
├── new-index.html          ← USE THIS FILE
├── styles/
│   └── main.css
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   └── app.js
└── README_FRONTEND.md
```

---

## Browser DevTools Tips

### Check Authentication
```javascript
// In browser console
localStorage.getItem('pos_token')     // Check token
JSON.parse(localStorage.getItem('pos_user'))  // Check user
```

### Check App State
```javascript
products.allProducts  // Loaded products
orders.cart          // Shopping cart
orders.userOrders    // User's orders
api.token           // JWT token
```

### Network Debugging
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (login, create product, etc.)
4. Check request/response in Network tab
5. Look for 200/201 status for success
6. Look for 4xx/5xx status for errors

---

## Test Scenarios

### Scenario 1: Complete Flow (5 min)
1. Register new account
2. Create 3 different products
3. Add them to cart with different quantities
4. Place order
5. View dashboard & order history

### Scenario 2: Product Management (3 min)
1. Create product without image
2. Upload image for product
3. Search for product
4. Create chips product
5. Create water product

### Scenario 3: Error Handling (2 min)
1. Try login with wrong password
2. Try register with existing email
3. Try empty form submission
4. Try file upload > 5MB
5. Verify error messages display

---

## Performance Check

### Check Load Time
```javascript
// In console
performance.timing.loadEventEnd - performance.timing.navigationStart
// Should be < 2000ms
```

### Check Network Performance
1. DevTools → Network tab
2. Throttle to "Slow 3G"
3. Refresh page
4. Should load in < 5 seconds

### Check Image Loading
1. DevTools → Network tab
2. Filter by "img"
3. Check image sizes
4. Should be < 500KB each

---

## Data for Testing

### Test Accounts
```
Email: test@example.com
Password: password123

Email: admin@example.com
Password: admin123
```

### Test Products
```
Orange Juice - $4.99
Apple Juice - $5.49
Mango Juice - $6.99
Potato Chips - $2.99
Bottled Water - $1.99
```

### Test Cart
```
2x Orange Juice = $9.98
1x Potato Chips = $2.99
1x Water = $1.99
Total: $14.96
```

---

## Troubleshooting Checklist

- [ ] Backend running on :8080?
- [ ] Frontend loading in browser?
- [ ] Can register/login?
- [ ] Can create products?
- [ ] Can add to cart?
- [ ] Can place order?
- [ ] Dashboard showing stats?
- [ ] Order history visible?

If all checked ✅ - **System is working perfectly!**

---

## Next Steps

1. **Explore Dashboard** - Check statistics
2. **Create More Products** - Test with multiple products
3. **Test Features** - Use all tabs and buttons
4. **Check Mobile** - Test on mobile browser
5. **Read Full Docs** - See README_FRONTEND.md for details
6. **Deploy** - See SETUP_GUIDE.md for production

---

## Support Resources

| Resource | Purpose |
|----------|---------|
| README_FRONTEND.md | Complete feature guide |
| SETUP_GUIDE.md | Installation & deployment |
| API_REFERENCE.md | All API endpoints |
| IMPLEMENTATION_SUMMARY.md | Project overview |

---

## Success Indicators ✅

You'll know it's working when:
- ✅ Login page appears
- ✅ Dashboard loads after login
- ✅ Products appear in grid
- ✅ Cart updates in real-time
- ✅ Orders are saved and displayed
- ✅ Statistics update automatically
- ✅ No console errors

---

## Common Commands

```bash
# Build everything
bash scripts/build-all.sh

# Run everything
bash scripts/run-local.sh

# Kill process on port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Check if service running
curl http://localhost:8080/health
curl http://localhost:8761/eureka
curl http://localhost:8888/config/master

# View logs
tail -f /path/to/service/logs/application.log
```

---

## Tips & Tricks

💡 **Always clear localStorage if having auth issues**
```javascript
localStorage.clear()
location.reload()
```

💡 **Test API directly with cURL before debugging frontend**
```bash
curl http://localhost:8080/products
```

💡 **Use browser DevTools Network tab to diagnose API issues**
F12 → Network → Refresh → Check responses

💡 **Check all 3 status pages**
- Config: http://localhost:8888
- Eureka: http://localhost:8761
- Gateway: http://localhost:8080/health

---

**You're all set! 🎉**

Open your browser and start using Juice Bar POS System now!

---

**Time to Setup**: ⏱️ ~5 minutes
**Time to First Order**: ⏱️ ~15 minutes
**Difficulty Level**: ⭐ Easy

**Last Updated**: March 21, 2024

