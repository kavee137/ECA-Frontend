/**
 * Authentication Module
 * Handles login and registration
 */

const auth = {
    isRegisterMode: false,
    currentUser: JSON.parse(localStorage.getItem('pos_user') || 'null'),

    /**
     * Toggle between login and register modes
     */
    toggleMode(event) {
        event.preventDefault();
        this.isRegisterMode = !this.isRegisterMode;

        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');

        if (this.isRegisterMode) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join our community today';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to your account';
        }
    },

    /**
     * Register new user
     */
    async register() {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        // Validation
        if (!name || !email || !password || !passwordConfirm) {
            app.showToast('Please fill all fields', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            app.showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            app.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            app.showToast('Please enter a valid email', 'error');
            return;
        }

        try {
            const response = await api.register(name, email, password);

            if (response.token) {
                api.setToken(response.token);
                
                // Decode JWT to get user info (same as login)
                const payload = this.decodeJWT(response.token);
                this.setCurrentUser(payload.sub, email, name);
                
                app.showToast('Account created successfully!', 'success');
                app.enterApp();
            }
        } catch (error) {
            app.showToast(error.message || 'Registration failed', 'error');
        }
    },

    /**
     * Login user
     */
    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validation
        if (!email || !password) {
            app.showToast('Please enter email and password', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            app.showToast('Please enter a valid email', 'error');
            return;
        }

        try {
            const response = await api.login(email, password);

            if (response.token) {
                api.setToken(response.token);

                // Decode JWT to get user info
                const payload = this.decodeJWT(response.token);
                this.setCurrentUser(payload.sub, email, payload.name || 'User');

                app.showToast('Login successful!', 'success');
                app.enterApp();
            }
        } catch (error) {
            app.showToast(error.message || 'Login failed', 'error');
        }
    },

    /**
     * Set current user info
     */
    setCurrentUser(id, email, name) {
        this.currentUser = { id, email, name };
        localStorage.setItem('pos_user', JSON.stringify(this.currentUser));
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!api.token && !!this.currentUser;
    },

    /**
     * Logout user
     */
    logout() {
        api.clearToken();
        this.currentUser = null;
        localStorage.removeItem('pos_user');
        app.showPage('auth');
        this.resetForms();
    },

    /**
     * Reset authentication forms
     */
    resetForms() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPasswordConfirm').value = '';

        // Reset to login mode
        if (this.isRegisterMode) {
            this.toggleMode({ preventDefault: () => {} });
        }
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Decode JWT token
     */
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return {};
        }
    },
};


