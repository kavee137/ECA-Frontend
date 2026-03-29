# 🍊 Juice Bar POS System - Frontend

Modern, responsive web application for a Point of Sale (POS) system built with vanilla HTML, CSS, and JavaScript. Connects to backend microservices via API Gateway.

## Features

✨ **Authentication**
- User registration and login
- JWT token-based authentication
- Secure password handling

🛒 **Point of Sale**
- Add/remove items from cart
- Real-time quantity management
- Instant order placement
- Cart persistence during session

📦 **Product Management**
- View all available products
- Create new products (Juice, Chips, Water)
- Upload product images to Google Cloud Storage
- Search and filter products

📊 **Dashboard**
- Real-time statistics (products, orders, revenue, items sold)
- Recent orders display
- Quick overview of system status

📋 **Order History**
- View all user orders
- Order details (product, quantity, amount, date)
- Complete order tracking

🎨 **Modern UI/UX**
- Glassmorphism design elements
- Soft shadows and rounded cards
- Smooth animations and transitions
- Responsive layout (mobile, tablet, desktop)
- Dark and light mode support

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern features (Flexbox, Grid, Gradients)
- **API**: Fetch API with JWT authentication
- **Storage**: LocalStorage for token and user data
- **Architecture**: Modular JavaScript (api, auth, products, orders, app)

## Project Structure

```
frontend/
├── index.html              # Main HTML file
├── new-index.html          # Updated version (use this)
├── styles/
│   └── main.css           # All styling
├── js/
│   ├── api.js             # API client and requests
│   ├── auth.js            # Authentication logic
│   ├── products.js        # Product management
│   ├── orders.js          # Shopping cart and orders
│   └── app.js             # Main app initialization
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Backend API running on `http://localhost:8080` (API Gateway)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Open the frontend**
   - Replace `/frontend/index.html` with contents of `/frontend/new-index.html`
   - Or simply open `new-index.html` in your browser

2. **Configure API endpoint** (if needed)
   - Edit `js/api.js` and change `API_BASE` if your backend is on a different URL

3. **Start using the app**
   - Register a new account
   - Login with your credentials
   - Start adding products and placing orders

## Configuration

### API Base URL

The frontend automatically detects the API endpoint:

```javascript
// In js/api.js
const API_BASE = (() => {
    const port = window.location.port;
    if (port === '3000' || port === '5173' || port === '8000') {
        return 'http://localhost:8080';
    }
    if (window.location.origin.includes('8080')) {
        return '';
    }
    return 'http://localhost:8080';
})();
```

To use a custom API URL, modify this in `js/api.js`.

## API Endpoints Used

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - List all products
- `POST /products` - Create product
- `POST /products/chips` - Create chips product
- `POST /products/water` - Create water product
- `POST /products/upload-image` - Upload product image to GCP

### Orders
- `POST /orders` - Place order
- `GET /orders/user/{id}` - Get user orders
- `POST /orders/different-quantity` - Place batch orders

### Users
- `GET /users/{id}` - Get user by ID

## Usage Guide

### Login & Register

1. Open the application
2. Click "Create one" to toggle to registration mode
3. Enter your details (name, email, password)
4. Submit to create account
5. Or login with existing credentials

### Adding Products (Admin)

1. Go to **Products** tab
2. Click **+ Add Product**
3. Enter product details:
   - Name (e.g., "Orange Juice")
   - Price (e.g., 4.99)
   - Type (Juice, Chips, Water)
4. Click "Create Product"
5. Click the 📸 icon to upload an image
6. Select image from your computer or drag & drop

### POS - Placing Orders

1. Go to **POS** tab
2. Use the search bar to find products
3. Click on a product card to add to cart
4. In the cart on the right:
   - Use +/- buttons to adjust quantities
   - Click ✕ to remove items
5. Click "Place Order" when ready
6. Order is automatically saved to your account

### Viewing Orders

1. Go to **Orders** tab
2. View all your previous orders with:
   - Order ID (truncated)
   - Product name
   - Quantity
   - Total amount
   - Order date

### Dashboard

1. Go to **Dashboard** tab
2. View quick statistics:
   - Total products
   - Total orders
   - Revenue
   - Items sold
3. See recent orders in table format

## Keyboard Shortcuts

- **Alt + D** - Go to Dashboard
- **Alt + S** - Go to POS
- **Alt + P** - Go to Products
- **Alt + O** - Go to Orders
- **Escape** - Close modals
- **Enter** - Submit forms (login/register)

## Authentication Flow

1. User enters credentials
2. Request sent to `/auth/login` or `/auth/register`
3. Backend returns JWT token
4. Token stored in localStorage
5. Token sent with every request in `Authorization` header
6. JWT decoded to extract user info (id, email)
7. User session maintained until logout

## Data Storage

### LocalStorage
- `pos_token` - JWT authentication token
- `pos_user` - User object (id, email, name)

### Session State
- `products.allProducts` - Cached product list
- `orders.cart` - Current shopping cart
- `orders.userOrders` - User's order history

## Error Handling

The app displays user-friendly error messages via toast notifications:

- **Success** (green) - Actions completed successfully
- **Error** (red) - Something went wrong
- **Info** (blue) - General information

## Responsive Breakpoints

- **Desktop**: 1024px+ (full layout)
- **Tablet**: 768px - 1023px (optimized grid)
- **Mobile**: < 768px (single column, full-width buttons)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations

- Lazy loading of images
- Efficient DOM updates
- Debounced search
- Cached API responses
- Minimal bundle size

## Security Features

- JWT token authentication
- Secure password storage (hashed on backend)
- CORS handling
- No sensitive data in localStorage
- Input validation and sanitization

## Troubleshooting

### Can't connect to API
- Ensure backend is running on correct port
- Check CORS settings on backend
- Verify API_BASE URL in `js/api.js`

### Login fails
- Check email/password are correct
- Ensure backend authentication endpoint works
- Check browser console for error details

### Images not loading
- Verify GCP bucket is accessible
- Check image upload permissions
- Ensure image URLs are correct

### Cart not saving
- Verify localStorage is enabled
- Check browser storage quota
- Try clearing browser cache

## Development Tips

### Adding New Features

1. **New API endpoint**: Add method to `api.js`
2. **New UI feature**: Create HTML, CSS, and JavaScript
3. **New page**: Add HTML in `new-index.html` and handler in `app.js`
4. **State management**: Use module pattern (like `products`, `orders`)

### Debugging

Enable debug mode by opening browser DevTools (F12):

```javascript
// In console
console.log(api.token);           // Check token
console.log(auth.currentUser);    // Check user
console.log(products.allProducts);// Check products
console.log(orders.cart);         // Check cart
```

## File Sizes

- `new-index.html` - ~25 KB
- `styles/main.css` - ~35 KB
- `js/api.js` - ~5 KB
- `js/auth.js` - ~7 KB
- `js/products.js` - ~10 KB
- `js/orders.js` - ~12 KB
- `js/app.js` - ~9 KB

**Total**: ~103 KB (minified)

## Future Enhancements

- [ ] Multi-user support with roles (admin, cashier, customer)
- [ ] Payment gateway integration
- [ ] Receipt printing
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Offline mode (PWA)
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Barcode scanning
- [ ] Discount codes

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Clear localStorage and try again
4. Check network tab for API responses

## License

This is a student project for Cloud Computing course.

---

**Made with ❤️ for Juice Bar POS System**

