/**
 * API Configuration and Methods
 * Handles all HTTP requests to the backend
 */

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

const api = {
    // Storage for authentication token
    token: localStorage.getItem('pos_token') || null,

    /**
     * Make an API request
     * @param {string} endpoint - The API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Handle FormData (for file uploads)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        } else if (options.body && typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const error = new Error(data?.message || data?.error || response.statusText);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('pos_token', token);
    },

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('pos_token');
    },

    // ===== AUTH ENDPOINTS =====

    /**
     * Register a new user
     */
    register(name, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { name, email, password },
        });
    },

    /**
     * Login user
     */
    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    },

    // ===== USER ENDPOINTS =====

    /**
     * Get user by ID
     */
    getUser(id) {
        return this.request(`/users/${id}`, {
            method: 'GET',
        });
    },

    // ===== PRODUCT ENDPOINTS =====

    /**
     * Get all products
     */
    getProducts() {
        return this.request('/products', {
            method: 'GET',
        });
    },

    /**
     * Create a product
     */
    createProduct(name, price, type = 'juice', imageUrl = null) {
        let endpoint = '/products';

        if (type === 'chips') {
            endpoint = '/products/chips';
        } else if (type === 'water') {
            endpoint = '/products/water';
        }

        const body = { name, price };
        if (imageUrl) {
            body.imageUrl = imageUrl;
        }

        return this.request(endpoint, {
            method: 'POST',
            body,
        });
    },

    /**
     * Upload product image
     */
    uploadImage(productId, file) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request(`/products/${productId}/image`, {
            method: 'POST',
            body: formData,
        });
    },

    /**
     * Update a product
     */
    updateProduct(productId, name, price, imageUrl = null) {
        const body = { name, price };
        if (imageUrl) {
            body.imageUrl = imageUrl;
        }

        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body,
        });
    },

    /**
     * Delete a product
     */
    deleteProduct(productId) {
        return this.request(`/products/${productId}`, {
            method: 'DELETE',
        });
    },

    // ===== ORDER ENDPOINTS =====

    /**
     * Get orders by user ID
     */
    getOrdersByUser(userId) {
        return this.request(`/orders/user/${userId}`, {
            method: 'GET',
        });
    },

    /**
     * Place a single order
     */
    createOrder(userId, productId, quantity) {
        return this.request('/orders', {
            method: 'POST',
            body: { userId, productId, quantity },
        });
    },

    /**
     * Place order with different quantities
     */
    createOrderBatch(userId, items) {
        return this.request('/orders/different-quantity', {
            method: 'POST',
            body: { userId, items },
        });
    },
};

