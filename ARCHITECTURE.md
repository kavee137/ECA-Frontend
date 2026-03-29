# System Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Juice Bar POS                            │   │
│  │                   Frontend Application                        │   │
│  │                                                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │  Auth Page │  │ Dashboard  │  │  Products  │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  │                                                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │ POS/Cart   │  │  Orders    │  │  Modals    │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  │                                                              │   │
│  │           ┌─────────────────────────────┐                   │   │
│  │           │    JavaScript Modules       │                   │   │
│  │           ├─────────────────────────────┤                   │   │
│  │           │ • api.js (HTTP client)      │                   │   │
│  │           │ • auth.js (Login/Register)  │                   │   │
│  │           │ • products.js (Management)  │                   │   │
│  │           │ • orders.js (Cart/Orders)   │                   │   │
│  │           │ • app.js (Router/Init)      │                   │   │
│  │           └─────────────────────────────┘                   │   │
│  │                                                              │   │
│  │           ┌─────────────────────────────┐                   │   │
│  │           │      CSS Styling            │                   │   │
│  │           ├─────────────────────────────┤                   │   │
│  │           │ • Modern design             │                   │   │
│  │           │ • Responsive layout         │                   │   │
│  │           │ • Animations & transitions  │                   │   │
│  │           └─────────────────────────────┘                   │   │
│  │                                                              │   │
│  │           ┌─────────────────────────────┐                   │   │
│  │           │    Local Storage            │                   │   │
│  │           ├─────────────────────────────┤                   │   │
│  │           │ • JWT Token                 │                   │   │
│  │           │ • User Info                 │                   │   │
│  │           └─────────────────────────────┘                   │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ▼▼▼                                        │
│                   HTTP / Fetch API                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API Calls
                              │ (with JWT Token)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (8080)                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Route: /auth/* → User Service (8081)                        │   │
│  │ Route: /users/* → User Service (8081)                       │   │
│  │ Route: /products/* → Product Service (8082)                 │   │
│  │ Route: /orders/* → Order Service (8083)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
       │                 │                │
       ▼                 ▼                ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  USER SVC   │   │ PRODUCT SVC │   │  ORDER SVC  │
│   (8081)    │   │   (8082)    │   │   (8083)    │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ • Register  │   │ • Create    │   │ • Place     │
│ • Login     │   │ • List      │   │ • Retrieve  │
│ • Get User  │   │ • Upload    │   │ • Track     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                │
       ▼                 ▼                ▼
   ┌────────┐      ┌────────┐       ┌────────┐
   │ MySQL  │      │MongoDB │       │MongoDB │
   │Database│      │Database│       │Database│
   └────────┘      └────────┘       └────────┘
                         │
                         ▼
                  ┌─────────────────┐
                  │ GCP Cloud Store │
                  │ (Product Images)│
                  └─────────────────┘
```

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      new-index.html                          │
│              (Main entry point - 450+ lines)                 │
└─────────────────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────┐
            │                                      │
            ▼                                      ▼
    ┌──────────────────┐            ┌──────────────────┐
    │  styles/main.css │            │  js/ (5 modules) │
    │   (540+ lines)   │            └──────────────────┘
    ├──────────────────┤                    │
    │ • Variables      │                    ├─────────────┐
    │ • Layout         │                    │             │
    │ • Components     │                    ▼             ▼
    │ • Animations     │           ┌──────────────┐  ┌─────────────┐
    │ • Responsive     │           │  api.js      │  │  auth.js    │
    │ • Dark/Light     │           │  (200 lines) │  │  (220 lines)│
    └──────────────────┘           ├──────────────┤  ├─────────────┤
                                   │ HTTP Requests│  │ Login/Reg   │
                                   │ JWT Tokens   │  │ Validation  │
                                   │ Error Handle │  │ User State  │
                                   └──────────────┘  └─────────────┘
                                           │              │
                                    ┌──────┴──────┐      │
                                    │             │      │
                                    ▼             ▼      ▼
                           ┌─────────────────────────────────────┐
                           │   products.js         orders.js     │
                           │   (220 lines)         (280 lines)   │
                           ├─────────────────────────────────────┤
                           │ • Load products    • Cart manage    │
                           │ • Render grids     • Order creation │
                           │ • Upload images    • Statistics     │
                           │ • Search/Filter    • History view   │
                           └─────────────────────────────────────┘
                                    │              │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌─────────────────┐
                                    │   app.js        │
                                    │   (240 lines)   │
                                    ├─────────────────┤
                                    │ • Page routing  │
                                    │ • Navigation    │
                                    │ • Modals        │
                                    │ • Notifications │
                                    │ • Init app      │
                                    └─────────────────┘
```

---

## State Management

```
┌────────────────────────────────────────────────────────────────┐
│                    Application State                            │
└────────────────────────────────────────────────────────────────┘
              │
              ├─────────────────────────────────────────┐
              │                                         │
              ▼                                         ▼
        ┌─────────────┐                         ┌──────────────┐
        │ auth Module │                         │ products Mod │
        ├─────────────┤                         ├──────────────┤
        │ token       │                         │ allProducts  │
        │ currentUser │                         │ filteredProd │
        │ isRegister  │                         │ selectedId   │
        └─────────────┘                         └──────────────┘
              │                                         │
              ▼                                         ▼
        [LocalStorage]                          [Module State]
        pos_token                               Cached in memory
        pos_user                                Updated on load
              │                                         │
              └─────────────────────────────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ orders Module│
                        ├──────────────┤
                        │ cart []      │
                        │ userOrders[]│
                        └──────────────┘
                              │
                              ▼
                        [Module State]
                        Cleared on logout
```

---

## User Journey - Complete Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                      │
└─────────────────────────────────────────────────────────────────────┘

1. LANDING
   ┌─────────────────────┐
   │ Browser opens app   │
   │ Load index.html     │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │ Check localStorage  │
   │ Token exists?       │
   └──────────┬──────────┘
              │
         ┌────┴─────┐
         │           │
         NO          YES
         │           │
         ▼           ▼
      [AUTH]     [DASHBOARD]
      Page       (if valid)
      

2. AUTHENTICATION
   ┌──────────────────┐
   │ Register/Login   │
   ├──────────────────┤
   │ Enter credentials│
   │ Validate input   │
   │ Send API request │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Backend response │
   ├──────────────────┤
   │ Success? Token?  │
   └────────┬─────────┘
            │
         ┌──┴──┐
         │     │
       YES    NO
         │     │
         ▼     ▼
      [SAVE] [ERROR]
      Token  Toast
      Store  Retry
      User
         │
         ▼
      [ENTER APP]


3. MAIN APP
   ┌──────────────────────┐
   │ Dashboard Page       │
   ├──────────────────────┤
   │ • Load products      │
   │ • Load user orders   │
   │ • Calculate stats    │
   │ • Display dashboard  │
   └────────┬─────────────┘
            │
      ┌─────┴─────┬─────────┬──────────┐
      │           │         │          │
      ▼           ▼         ▼          ▼
   [POS]      [Products] [Orders]  [Dashboard]
    Tab         Tab        Tab        Active


4. POS WORKFLOW
   ┌──────────────────┐
   │ Browse Products  │
   ├──────────────────┤
   │ • Search bar     │
   │ • Product grid   │
   │ • Click to add   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Shopping Cart    │
   ├──────────────────┤
   │ • Cart items     │
   │ • Qty controls   │
   │ • Total price    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Place Order      │
   ├──────────────────┤
   │ • Validate cart  │
   │ • API request    │
   │ • Success msg    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Order Confirmed  │
   ├──────────────────┤
   │ • Cart cleared   │
   │ • Stats updated  │
   │ • Go dashboard   │
   └──────────────────┘


5. PRODUCT MANAGEMENT
   ┌──────────────────────┐
   │ Products Tab         │
   ├──────────────────────┤
   │ • Click Add Product  │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Modal: Add Product   │
   ├──────────────────────┤
   │ • Name input         │
   │ • Price input        │
   │ • Type dropdown      │
   │ • Submit button      │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Create via API       │
   ├──────────────────────┤
   │ • POST /products     │
   │ • Get product ID     │
   │ • Close modal        │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Upload Image         │
   ├──────────────────────┤
   │ • Click photo icon   │
   │ • Select file        │
   │ • Upload to GCP      │
   │ • Show image         │
   └──────────────────────┘


6. ORDER HISTORY
   ┌──────────────────────┐
   │ Orders Tab           │
   ├──────────────────────┤
   │ • Load user orders   │
   │ • Display table      │
   │ • Order ID truncated │
   │ • Product name       │
   │ • Quantity           │
   │ • Amount calculated  │
   │ • Date formatted     │
   └──────────────────────┘
```

---

## Data Flow - Auth Example

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────┘

STEP 1: User Input
┌──────────────────┐
│ Email form field │  ──────────────┐
└──────────────────┘                │
┌──────────────────┐                │
│ Pwd form field   │  ──────────────┤──→ [Collect Input]
└──────────────────┘                │
┌──────────────────┐                │
│ Click Login btn  │  ──────────────┘


STEP 2: Validation
┌──────────────────┐
│ auth.login()     │  
│ Called           │
└────────┬─────────┘
         │
         ├─ Get email value
         ├─ Get password value
         ├─ Check not empty
         ├─ Validate email format
         │
         └─→ All valid? ──NO──→ Show error toast → Stop


STEP 3: API Request
         │
         YES
         │
         ▼
    ┌──────────────────────┐
    │ api.login(email, pwd)│
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ api.request()        │
    ├──────────────────────┤
    │ method: POST         │
    │ endpoint: /auth/login│
    │ body: {email, pwd}   │
    │ headers: {Content..} │
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ fetch() call         │
    │ HTTP POST            │
    │ To Gateway :8080     │
    └─────────┬────────────┘


STEP 4: Backend Processing
              │
              ▼
    ┌──────────────────────┐
    │ API Gateway          │
    ├──────────────────────┤
    │ Route to user-svc    │
    └─────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ User Service (8081)  │
    ├──────────────────────┤
    │ • Validate input     │
    │ • Hash password      │
    │ • Query database     │
    │ • Compare hash       │
    │ • Create JWT token   │
    │ • Return token+user  │
    └─────────┬────────────┘


STEP 5: Response Handling
              │
              ▼
    ┌──────────────────────┐
    │ Response received    │
    │ Status: 200          │
    │ Body: {token, user}  │
    └─────────┬────────────┘
              │
              ├─ Check status
              │
              YES (200)
              │
              ▼
    ┌──────────────────────┐
    │ api.setToken(token)  │
    └─────────┬────────────┘
              │
              ├─ Store in api.token
              ├─ Save to localStorage
              │
              ▼
    ┌──────────────────────┐
    │ Decode JWT           │
    │ Extract user info    │
    └─────────┬────────────┘
              │
              ├─ sub (ID)
              ├─ email
              ├─ name
              │
              ▼
    ┌──────────────────────┐
    │ auth.setCurrentUser()│
    └─────────┬────────────┘
              │
              ├─ Store user object
              ├─ Save to localStorage
              │
              ▼
    ┌──────────────────────┐
    │ app.enterApp()       │
    └─────────┬────────────┘
              │
              ├─ Hide auth page
              ├─ Show navbar
              ├─ Load products
              ├─ Load orders
              ├─ Show dashboard
              │
              ▼
    ┌──────────────────────┐
    │ Show success toast   │
    │ "Welcome!"           │
    └──────────────────────┘
```

---

## API Request Lifecycle

```
Frontend Code
    │
    ▼
[auth.login(email, pwd)]
    │
    ▼
[api.request('/auth/login', {method, body})]
    │
    ├─ Create headers object
    ├─ Add Auth header (Bearer token - if exists)
    ├─ Convert body to JSON
    │
    ▼
[fetch(API_BASE + endpoint, options)]
    │
    ├─ Resolve API_BASE URL
    ├─ Build full URL
    ├─ Make HTTP request
    │
    ▼
[HTTP POST to http://localhost:8080/auth/login]
    │
    ├─ Network transmission
    ├─ Server receives request
    ├─ Gateway routes to user-service
    │
    ▼
[Server processing]
    │
    ▼
[HTTP Response]
    │
    ├─ Status code (200, 400, 500, etc)
    ├─ Response headers
    ├─ Response body (JSON)
    │
    ▼
[response.json()]
    │
    ├─ Parse JSON
    │
    ▼
[Check response.ok]
    │
    ├─ 200-299? → Parse and return data
    ├─ 4xx/5xx? → Throw error
    │
    ▼
[Promise resolves/rejects]
    │
    ▼
[catch error in function]
    │
    ▼
[Handle error / Display to user]
    │
    ▼
[Show toast notification]
```

---

## Component Interaction Map

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                          │
└────────────────────────────────────────────────────────────────┘

              app.js (Main)
                  │
                  ├────────────────────────────────┐
                  │                                │
                  ▼                                ▼
            HTML Pages                      JavaScript Modules
                  │                                │
    ┌─────┬──────┼──────┬──────┐           ┌─────┼──────┬────┐
    │     │      │      │      │           │     │      │    │
    ▼     ▼      ▼      ▼      ▼           ▼     ▼      ▼    ▼
  Auth  Dash  Products POS  Orders        api  auth  prod  ord
  Page  Page   Page     Page  Page
    │     │      │       │      │
    │     │      ├──────┬┴──────┤
    │     │      │      │       │
    │     └──────┼──────┼───────┤
    │            │      │       │
    └────────────┼──────┼───────┤
                 │      │       │
                 ▼      ▼       ▼
              Use data from modules
                 │      │       │
                 └──────┼───────┤
                        │       │
                    Render HTML
                        │       │
                 Apply CSS styling


Data Flow:
  Module State ──→ Render Function ──→ HTML Update ──→ CSS Styling
  ↓ (on event)
  API Call
    ↓ (on response)
  Update Module State
    ↓
  Re-render Component
    ↓
  User sees update


Example: Adding to cart
  [products.js]
    ↓
  Click event → addToCart(productId)
    ↓
  [orders.js]
    ↓
  orders.cart.push(item)
    ↓
  [orders.js]
    ↓
  orders.renderCart()
    ↓
  Update #cartItems HTML
    ↓
  [main.css]
    ↓
  Apply cart-item styles
    ↓
  User sees item in cart
```

---

## Database Schema (Backend Reference)

```
┌──────────────────────────────────────────────────────────────┐
│              USER SERVICE (MySQL)                              │
├──────────────────────────────────────────────────────────────┤
│ Users Table                                                   │
├─────────────┬──────────┬─────────────────────────────────────┤
│ id (PK)     │ INT      │ Primary key                         │
│ name        │ VARCHAR  │ User full name                      │
│ email (UQ)  │ VARCHAR  │ Unique email address                │
│ password    │ VARCHAR  │ Hashed password                     │
│ createdAt   │ DATETIME │ Registration timestamp              │
│ updatedAt   │ DATETIME │ Last update timestamp               │
└─────────────┴──────────┴─────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│           PRODUCT SERVICE (MongoDB)                            │
├──────────────────────────────────────────────────────────────┤
│ Products Collection                                           │
├─────────────┬─────────────────────────────────────────────────┤
│ _id         │ ObjectId - Unique product ID                    │
│ name        │ String - Product name (e.g., Orange Juice)      │
│ price       │ Double - Product price                          │
│ imageUrl    │ String - GCP image URL (nullable)               │
│ type        │ String - JUICE, CHIPS, or WATER                 │
│ createdAt   │ Date - Product creation date                    │
│ updatedAt   │ Date - Last update date                         │
└─────────────┴─────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│              ORDER SERVICE (MongoDB)                           │
├──────────────────────────────────────────────────────────────┤
│ Orders Collection                                             │
├─────────────┬─────────────────────────────────────────────────┤
│ _id         │ ObjectId - Unique order ID                      │
│ userId      │ Number - Reference to User                      │
│ productId   │ String - Reference to Product                   │
│ quantity    │ Integer - Quantity ordered                      │
│ totalPrice  │ Double - quantity × product.price               │
│ status      │ String - COMPLETED, PENDING, etc.               │
│ createdAt   │ Date - Order creation date                      │
└─────────────┴─────────────────────────────────────────────────┘
```

---

## Frontend Technology Stack

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                           │
└────────────────────────────────────────────────────────────┘

LAYER          │ TECHNOLOGY           │ PURPOSE
───────────────┼──────────────────────┼─────────────────────
Markup         │ HTML5                │ Structure & content
               │ • Semantic tags      │ • Main layout
               │ • Form elements      │ • Page structure
               │ • Accessibility      │ • Modals
───────────────┼──────────────────────┼─────────────────────
Styling        │ CSS3                 │ Visual design
               │ • Flexbox/Grid       │ • Responsive layout
               │ • Gradients          │ • Modern effects
               │ • Animations         │ • Smooth transitions
               │ • Variables          │ • Theme management
───────────────┼──────────────────────┼─────────────────────
JavaScript     │ ES6+                 │ Functionality
               │ • Async/Await        │ • API calls
               │ • Modules            │ • State management
               │ • Arrow functions    │ • Event handling
               │ • Destructuring      │ • DOM manipulation
───────────────┼──────────────────────┼─────────────────────
APIs           │ Fetch API            │ HTTP communication
               │ • Promise-based      │ • API requests
               │ • Error handling     │ • Response parsing
               │ • FormData support   │ • File uploads
───────────────┼──────────────────────┼─────────────────────
Storage        │ LocalStorage         │ Persistent data
               │ • String keys        │ • JWT tokens
               │ • JSON stringify     │ • User info
               │ • JSON parse         │ • Session data
───────────────┼──────────────────────┼─────────────────────
Authentication │ JWT Tokens           │ User verification
               │ • Bearer token       │ • Secure requests
               │ • Token parsing      │ • User identity
───────────────┼──────────────────────┼─────────────────────
No Frameworks  │ Vanilla JS           │ No dependencies
               │ • Lightweight        │ • Fast loading
               │ • No build step      │ • Easy debugging
               │ • Direct access      │ • Pure JavaScript
───────────────┴──────────────────────┴─────────────────────

File Sizes:
  new-index.html    ~22 KB (Unminified: 25 KB)
  styles/main.css   ~35 KB (Unminified: 42 KB)
  js/api.js         ~8 KB
  js/auth.js        ~10 KB
  js/products.js    ~11 KB
  js/orders.js      ~14 KB
  js/app.js         ~12 KB
  ─────────────────────
  TOTAL             ~112 KB (Production optimized)
  
Network:
  Uncompressed:     ~112 KB
  With Gzip:        ~35 KB (70% reduction)
  Load Time:        < 1 second (on 3G)
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING                              │
└─────────────────────────────────────────────────────────────┘

Error Types:

1. USER INPUT ERRORS
   ├─ Empty fields
   ├─ Invalid email format
   ├─ Password mismatch
   ├─ Passwords too short
   └─ File too large
        │
        └──→ Show validation error toast
            Stay on page
            Highlight problem


2. API ERRORS
   ├─ Network failure
   ├─ 4xx Client errors
   │  ├─ 400 Bad Request
   │  ├─ 401 Unauthorized
   │  └─ 404 Not Found
   │
   ├─ 5xx Server errors
   │  ├─ 500 Internal Error
   │  └─ 503 Service Unavailable
   │
   └──→ Parse error response
       Extract error message
       Show error toast
       Log to console


3. NETWORK ERRORS
   ├─ No internet connection
   ├─ API Gateway down
   ├─ Service unavailable
   └─ Timeout
        │
        └──→ Show generic error
            "Connection failed"
            Suggest retry


4. STATE ERRORS
   ├─ User not found
   ├─ Product not found
   ├─ Order failed
   ├─ Session expired
   └─ Token invalid
        │
        └──→ Logout user
            Show error message
            Redirect to login


5. UI ERRORS
   ├─ Modal not found
   ├─ Element not found
   ├─ Invalid page
   └─ Missing data
        │
        └──→ Log error
            Show generic message
            Recover gracefully
```

---

**Architecture Summary**: Modular frontend with clean separation of concerns, connecting to scalable microservices backend via API Gateway.


