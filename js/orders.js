/**
 * Orders Module
 * Handles shopping cart and order management
 */

const orders = {
    cart: [],
    userOrders: [],

    /**
     * Add item to cart
     */
    addItemToCart(product) {
        const existingItem = this.cart.find((item) => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
            });
        }

        this.renderCart();
        this.updatePlaceOrderButton();
    },

    /**
     * Remove item from cart
     */
    removeFromCart(productId) {
        this.cart = this.cart.filter((item) => item.productId !== productId);
        this.renderCart();
        this.updatePlaceOrderButton();
    },

    /**
     * Update item quantity
     */
    updateQuantity(productId, delta) {
        const item = this.cart.find((item) => item.productId === productId);

        if (item) {
            item.quantity += delta;

            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.renderCart();
                this.updatePlaceOrderButton();
            }
        }
    },

    /**
     * Clear entire cart
     */
    clearCart() {
        if (this.cart.length === 0) {
            app.showToast('Cart is already empty', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.renderCart();
            this.updatePlaceOrderButton();
            app.showToast('Cart cleared', 'info');
        }
    },

    /**
     * Render cart items
     */
    renderCart() {
        const container = document.getElementById('cartItems');

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <p>Cart is empty</p>
                </div>
            `;
            document.getElementById('cartTotal').textContent = 'Rs 0.00';
            return;
        }

        let total = 0;

        container.innerHTML = this.cart
            .map((item) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;

                return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rs ${item.price.toFixed(2)} each</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="qty-control">
                        <button onclick="orders.updateQuantity('${item.productId}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="orders.updateQuantity('${item.productId}', 1)">+</button>
                    </div>
                    <div style="font-weight: 700; color: var(--primary); min-width: 60px; text-align: right;">
                        Rs ${subtotal.toFixed(2)}
                    </div>
                    <button class="btn btn-icon" style="width: 28px; height: 28px; padding: 0;" 
                        onclick="orders.removeFromCart('${item.productId}')">
                        ✕
                    </button>
                </div>
            </div>
        `;
            })
            .join('');

        document.getElementById('cartTotal').textContent = `Rs ${total.toFixed(2)}`;
    },

    /**
     * Update place order button state
     */
    updatePlaceOrderButton() {
        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = this.cart.length === 0;
    },

    /**
     * Place order
     */
    async placeOrder() {
        if (this.cart.length === 0) {
            app.showToast('Cart is empty', 'error');
            return;
        }

        const user = auth.getCurrentUser();
        if (!user) {
            app.showToast('User not found', 'error');
            return;
        }

        const btn = document.getElementById('placeOrderBtn');
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = '⏳ Processing...';

            console.log('User id: ', user.id);
            console.log('Cart items: ', this.cart);

            // Prepare items for batch order
            const items = this.cart.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));

            // Create batch order with all items at once
            await api.createOrderBatch(user.id, items);

            app.showToast('✅ Order placed successfully!', 'success');

            // Clear cart and reload orders
            this.cart = [];
            this.renderCart();
            this.updatePlaceOrderButton();

            // Reload user orders
            await this.loadUserOrders();
            this.renderOrdersTable();
            this.renderDashboardOrders();
            this.updateStats();

            // Show dashboard
            app.showPage('dashboard');
        } catch (error) {
            console.error('Order placement error:', error);
            app.showToast(error.message || 'Failed to place order', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    /**
     * Load user's orders from API
     */
    async loadUserOrders() {
        const user = auth.getCurrentUser();

        if (!user) {
            this.userOrders = [];
            return;
        }

        try {
            this.userOrders = await api.getOrdersByUser(user.id);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.userOrders = [];
        }
    },

    /**
     * Render orders in dashboard
     */
    renderDashboardOrders() {
        const tbody = document.getElementById('recentOrdersTable');

        if (this.userOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        No orders yet
                    </td>
                </tr>
            `;
            return;
        }

        // Show last 5 orders
        const recent = this.userOrders.slice(-5).reverse();

        tbody.innerHTML = recent
            .map((order) => {
                const product = products.getProduct(order.productId);
                const amount = product ? (product.price * order.quantity).toFixed(2) : '0.00';

                return `
            <tr>
                <td style="font-family: monospace; font-size: 12px;">
                    ${order.id.substring(0, 12)}...
                </td>
                <td>${product ? product.name : 'Unknown'}</td>
                <td>${order.quantity}</td>
                <td style="color: var(--primary); font-weight: 600;">Rs ${amount}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
        `;
            })
            .join('');
    },

    /**
     * Render orders in orders page
     */
    renderOrdersTable() {
        const tbody = document.getElementById('ordersTable');

        if (this.userOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        <div class="empty-state-icon">📋</div>
                        <p>No orders yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.userOrders
            .slice()
            .reverse()
            .map((order) => {
                const product = products.getProduct(order.productId);
                const amount = product ? (product.price * order.quantity).toFixed(2) : '0.00';
                const date = new Date(order.createdAt).toLocaleString();

                return `
            <tr>
                <td style="font-family: monospace; font-size: 12px;">
                    ${order.id.substring(0, 12)}...
                </td>
                <td>${product ? product.name : 'Unknown'}</td>
                <td>${order.quantity}</td>
                <td style="color: var(--primary); font-weight: 600;">Rs ${amount}</td>
                <td>${date}</td>
            </tr>
        `;
            })
            .join('');
    },

    /**
     * Update dashboard statistics
     */
    updateStats() {
        // Total products
        document.getElementById('statProducts').textContent = products.allProducts.length;

        // Total orders
        document.getElementById('statOrders').textContent = this.userOrders.length;

        // Calculate revenue and items sold
        let revenue = 0;
        let itemsSold = 0;

        this.userOrders.forEach((order) => {
            const product = products.getProduct(order.productId);
            if (product) {
                revenue += product.price * order.quantity;
                itemsSold += order.quantity;
            }
        });

        document.getElementById('statRevenue').textContent = `Rs ${revenue.toFixed(2)}`;
        document.getElementById('statItems').textContent = itemsSold;
    },
};

