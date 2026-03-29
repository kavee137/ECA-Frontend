/**
 * Main Application Module
 * Handles routing, initialization, and UI management
 */

const app = {
    currentPage: 'auth',

    /**
     * Initialize the application
     */
    init() {
        console.log('🍊 Juice Bar POS System Initializing...');

        // Check if user is already logged in
        if (auth.isLoggedIn()) {
            this.enterApp();
        }

        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
    },

    /**
     * Enter main app after authentication
     */
    async enterApp() {
        // Hide auth page and show navigation
        document.getElementById('authPage').classList.remove('active');
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('userInfo').style.display = 'flex';

        // Update user info
        const user = auth.getCurrentUser();
        document.getElementById('userEmail').textContent = user.email;

        // Load initial data
        await products.loadProducts();
        await orders.loadUserOrders();

        // Show dashboard
        this.showPage('dashboard');

        this.showToast('Welcome to Juice Bar POS!', 'success');
    },

    /**
     * Show a specific page
     */
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach((page) => {
            page.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById(pageId + 'Page');
        if (page) {
            page.classList.add('active');
            this.currentPage = pageId;
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });

        // Render page-specific content
        this.renderPageContent(pageId);
    },

    /**
     * Render content for specific page
     */
    renderPageContent(pageId) {
        switch (pageId) {
            case 'dashboard':
                orders.updateStats();
                orders.renderDashboardOrders();
                break;

            case 'pos':
                products.renderPosProductsGrid();
                orders.renderCart();
                break;

            case 'products':
                products.renderProductsGrid();
                break;

            case 'orders':
                orders.renderOrdersTable();
                break;
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');

        const iconMap = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${iconMap[type]}</div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Logout user
     */
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
            orders.cart = [];
            orders.userOrders = [];
            products.allProducts = [];
            products.filteredProducts = [];

            document.getElementById('navbar').style.display = 'none';
            document.getElementById('userInfo').style.display = 'none';

            this.showToast('Logged out successfully', 'info');
        }
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + D: Dashboard
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.showPage('dashboard');
            }

            // Alt + S: POS
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.showPage('pos');
            }

            // Alt + P: Products
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                this.showPage('products');
            }

            // Alt + O: Orders
            if (e.altKey && e.key === 'o') {
                e.preventDefault();
                this.showPage('orders');
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                document.getElementById('addProductModal').classList.remove('show');
                document.getElementById('uploadImageModal').classList.remove('show');
            }
        });
    },

    /**
     * Show page (for navigation)
     */
    showPageFromNav(pageId) {
        if (auth.isLoggedIn()) {
            this.showPage(pageId);
        } else {
            this.showToast('Please login first', 'error');
        }
    },
};

/**
 * Setup modal backdrop clicks
 */
document.addEventListener('DOMContentLoaded', () => {
    // Handle modal backdrop clicks
    document.getElementById('addProductModal').addEventListener('click', (e) => {
        if (e.target.id === 'addProductModal') {
            products.closeModals();
        }
    });

    document.getElementById('uploadImageModal').addEventListener('click', (e) => {
        if (e.target.id === 'uploadImageModal') {
            products.closeModals();
        }
    });

    // Handle upload zone drag and drop
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.addEventListener('click', () => {
            document.getElementById('imageFile').click();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('imageFile').files = files;
                products.handleFileSelect({ target: { files } });
            }
        });
    }

    // Initialize app
    app.init();
});

/**
 * Handle Enter key in forms
 */
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const target = e.target;

        // Login form
        if (
            target.id === 'loginEmail' ||
            target.id === 'loginPassword'
        ) {
            if (!auth.isRegisterMode) {
                auth.login();
            }
        }

        // Register form
        if (
            target.id === 'regName' ||
            target.id === 'regEmail' ||
            target.id === 'regPassword' ||
            target.id === 'regPasswordConfirm'
        ) {
            if (auth.isRegisterMode) {
                auth.register();
            }
        }
    }
});

