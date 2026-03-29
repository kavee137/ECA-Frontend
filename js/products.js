/**
 * Products Module
 * Handles product management and display
 */

const products = {
    allProducts: [],
    filteredProducts: [],
    selectedProductId: null,

    /**
     * Load all products from API
     */
    async loadProducts() {
        try {
            this.allProducts = await api.getProducts();
            this.filteredProducts = [...this.allProducts];
        } catch (error) {
            console.error('Error loading products:', error);
            app.showToast('Failed to load products', 'error');
        }
    },

    /**
     * Render products in products page grid
     */
    renderProductsGrid() {
        const grid = document.getElementById('productsGrid');

        if (this.allProducts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <div class="empty-state-icon">📦</div>
                    <p style="color: var(--text-muted); margin-bottom: 24px;">No products yet. Create your first product!</p>
                    <button class="btn btn-primary" onclick="products.openAddModal()">+ Add Product</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.allProducts
            .map(
                (product) => `
            <div class="product-card">
                <div class="product-image ${!product.imageUrl ? 'placeholder' : ''}">
                    ${
                        product.imageUrl
                            ? `<img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`
                            : '🥤'
                    }
                </div>
                <div class="product-content">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">Rs ${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn btn-outline btn-sm" onclick="products.openEditModal('${product.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="products.addToCartFromGrid('${product.id}')">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Render products in POS view
     */
    renderPosProductsGrid() {
        const grid = document.getElementById('posProductsGrid');

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                    <div class="empty-state-icon">🔍</div>
                    <p style="color: var(--text-muted);">No products found</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredProducts
            .map(
                (product) => `
            <div class="product-card" style="cursor: pointer;" onclick="products.addToCart('${product.id}')">
                <div class="product-image ${!product.imageUrl ? 'placeholder' : ''}">
                    ${
                        product.imageUrl
                            ? `<img src="${product.imageUrl}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`
                            : '🥤'
                    }
                </div>
                <div class="product-content">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">Rs ${product.price.toFixed(2)}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: auto;">Click to add</div>
                </div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Filter products based on search query
     */
    filterPosProducts() {
        const query = document.getElementById('posSearch').value.toLowerCase();

        this.filteredProducts = this.allProducts.filter((product) =>
            product.name.toLowerCase().includes(query)
        );

        this.renderPosProductsGrid();
    },

    /**
     * Add product to cart from grid
     */
    addToCartFromGrid(productId) {
        event.stopPropagation();
        this.addToCart(productId);
    },

    /**
     * Add product to cart
     */
    addToCart(productId) {
        const product = this.allProducts.find((p) => p.id === productId);

        if (!product) {
            app.showToast('Product not found', 'error');
            return;
        }

        orders.addItemToCart(product);
        app.showToast(`${product.name} added to cart`, 'success');
    },

    /**
     * Open add product modal
     */
    openAddModal() {
        document.getElementById('addProductModal').classList.add('show');
        this.clearAddForm();
        // Disable create button until image is selected
        const createBtn = document.querySelector('#addProductModal .modal-footer .btn-primary');
        if (createBtn) {
            createBtn.disabled = true;
        }
    },

    /**
     * Open edit product modal
     */
    openEditModal(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            app.showToast('Product not found', 'error');
            return;
        }

        // Populate form with existing data
        document.getElementById('editProductId').value = productId;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;

        // Show image preview if exists
        const preview = document.getElementById('editProductImagePreview');
        const placeholder = document.getElementById('editProductImagePlaceholder');
        const previewImg = document.getElementById('editProductImagePreviewImg');
        const imageInfo = document.getElementById('editProductImageInfo');

        if (product.imageUrl) {
            previewImg.src = product.imageUrl;
            preview.style.display = 'flex';
            placeholder.style.display = 'none';
            imageInfo.textContent = '✅ Image: Uploaded';
        } else {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            imageInfo.textContent = '⚠️ No image uploaded yet';
        }

        document.getElementById('editProductImage').value = '';

        // Show modal
        document.getElementById('editProductModal').classList.add('show');
    },

    /**
     * Handle edit product image selection
     */
    handleEditProductImageSelect(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('editProductImagePreview');
        const placeholder = document.getElementById('editProductImagePlaceholder');
        const previewImg = document.getElementById('editProductImagePreviewImg');
        const imageInfo = document.getElementById('editProductImageInfo');

        if (!file) {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            imageInfo.textContent = '';
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            app.showToast('❌ File size must be less than 5MB', 'error');
            document.getElementById('editProductImage').value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            imageInfo.textContent = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            app.showToast('❌ Please select a valid image file', 'error');
            document.getElementById('editProductImage').value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            imageInfo.textContent = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'flex';
            placeholder.style.display = 'none';
            imageInfo.textContent = `📸 New image selected: ${file.name}`;
            app.showToast(`✅ Image ready: ${file.name}`, 'success');
        };
        reader.readAsDataURL(file);
    },

    /**
     * Update existing product
     */
    async updateProduct() {
        const productId = document.getElementById('editProductId').value;
        const name = document.getElementById('editProductName').value.trim();
        const price = parseFloat(document.getElementById('editProductPrice').value);
        const imageFile = document.getElementById('editProductImage').files[0];

        // Validation
        if (!name || !price || price <= 0) {
            app.showToast('Please fill all fields correctly', 'error');
            return;
        }

        try {
            const updateBtn = document.querySelector('#editProductModal .modal-footer .btn-primary');
            const originalText = updateBtn.innerHTML;
            updateBtn.disabled = true;

            // Update basic product info
            updateBtn.innerHTML = '⏳ Updating...';
            await api.updateProduct(productId, name, price);

            // Upload new image if selected
            if (imageFile) {
                updateBtn.innerHTML = '📸 Uploading image...';
                await api.uploadImage(productId, imageFile);
            }

            app.showToast('✅ Product updated successfully!', 'success');
            this.closeModals();
            await this.loadProducts();
            this.renderProductsGrid();
            this.renderPosProductsGrid();

            updateBtn.disabled = false;
            updateBtn.innerHTML = originalText;
        } catch (error) {
            console.error('Error updating product:', error);
            app.showToast(error.message || 'Failed to update product', 'error');
            const updateBtn = document.querySelector('#editProductModal .modal-footer .btn-primary');
            updateBtn.disabled = false;
            updateBtn.innerHTML = 'Update';
        }
    },

    /**
     * Delete product
     */
    async deleteProduct() {
        const productId = document.getElementById('editProductId').value;
        if (!productId) {
            app.showToast('Product ID not found', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const deleteBtn = document.querySelector('#editProductModal .modal-footer .btn-danger');
            const originalText = deleteBtn.innerHTML;
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '⏳ Deleting...';

            await api.deleteProduct(productId);

            app.showToast('✅ Product deleted successfully!', 'success');
            this.closeModals();
            await this.loadProducts();
            this.renderProductsGrid();
            this.renderPosProductsGrid();

            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        } catch (error) {
            console.error('Error deleting product:', error);
            app.showToast(error.message || 'Failed to delete product', 'error');
            const deleteBtn = document.querySelector('#editProductModal .modal-footer .btn-danger');
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = 'Delete';
        }
    },

    /**
     * Open upload image modal
     */
    openUploadModal(productId) {
        this.selectedProductId = productId;
        const modal = document.getElementById('uploadImageModal');
        const fileInput = document.getElementById('imageFile');
        const uploadBtn = document.getElementById('uploadBtn');
        const productIdInput = document.getElementById('uploadProductId');
        
        // Reset form
        fileInput.value = '';
        uploadBtn.disabled = true;
        productIdInput.value = productId;
        
        // Show modal
        modal.classList.add('show');
        
        // Trigger file input click after a short delay to ensure it works
        setTimeout(() => {
            fileInput.click();
        }, 100);
    },

    /**
     * Close all modals
     */
    closeModals() {
        document.getElementById('addProductModal').classList.remove('show');
        document.getElementById('uploadImageModal').classList.remove('show');
        document.getElementById('editProductModal').classList.remove('show');
        this.clearAddForm();
    },

    /**
     * Add new product with mandatory image
     */
    async addProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const imageFile = document.getElementById('productImage').files[0];

        // Validation
        if (!name || !price || price <= 0) {
            app.showToast('Please fill all fields correctly', 'error');
            return;
        }

        // Validate image is required
        if (!imageFile) {
            app.showToast('⚠️ Product image is mandatory. Please select an image.', 'error');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            app.showToast('❌ File size must be less than 5MB', 'error');
            document.getElementById('productImage').value = '';
            return;
        }

        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
            app.showToast('❌ Please select a valid image file', 'error');
            document.getElementById('productImage').value = '';
            return;
        }

        try {
            const createBtn = document.querySelector('#addProductModal .modal-footer .btn-primary');
            const originalText = createBtn.innerHTML;
            createBtn.disabled = true;

            // Step 1: Create product first
            createBtn.innerHTML = '⏳ Creating product...';
            console.log('Creating product:', name);

            const productResponse = await api.createProduct(name, price, 'juice');
            const productId = productResponse.id;
            console.log('Product created with ID:', productId);

            // Step 2: Upload image
            createBtn.innerHTML = '📸 Uploading image...';
            console.log('Uploading image for product:', productId, 'File:', imageFile.name);

            await api.uploadImage(productId, imageFile);
            console.log('Image uploaded successfully');

            app.showToast('✅ Product and image created successfully!', 'success');

            this.closeModals();
            await this.loadProducts();
            this.renderProductsGrid();
            this.renderPosProductsGrid();

            createBtn.disabled = false;
            createBtn.innerHTML = originalText;
        } catch (error) {
            console.error('Error creating product:', error);
            app.showToast(error.message || 'Failed to create product', 'error');
            const createBtn = document.querySelector('#addProductModal .modal-footer .btn-primary');
            createBtn.disabled = false;
            createBtn.innerHTML = 'Create Product';
        }
    },

    /**
     * Handle product image selection with preview
     */
    handleProductImageSelect(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('productImagePreview');
        const placeholder = document.getElementById('productImagePlaceholder');
        const previewImg = document.getElementById('productImagePreviewImg');
        const createBtn = document.querySelector('#addProductModal .modal-footer .btn-primary');

        if (!file) {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            createBtn.disabled = true;
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            app.showToast('❌ File size must be less than 5MB', 'error');
            document.getElementById('productImage').value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            createBtn.disabled = true;
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            app.showToast('❌ Please select a valid image file', 'error');
            document.getElementById('productImage').value = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            createBtn.disabled = true;
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.style.display = 'flex';
            placeholder.style.display = 'none';
            createBtn.disabled = false;
            app.showToast(`✅ Image ready: ${file.name}`, 'success');
        };
        reader.readAsDataURL(file);
    },

    /**
     * Handle file selection for image upload
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        const uploadBtn = document.getElementById('uploadBtn');

        if (!file) {
            uploadBtn.disabled = true;
            return;
        }

        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            app.showToast('File size must be less than 5MB', 'error');
            document.getElementById('imageFile').value = '';
            uploadBtn.disabled = true;
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            app.showToast('Please select a valid image file', 'error');
            document.getElementById('imageFile').value = '';
            uploadBtn.disabled = true;
            return;
        }

        // Show feedback
        app.showToast(`📸 Ready to upload: ${file.name}`, 'info');
        uploadBtn.disabled = false;
    },

    /**
     * Upload image to product
     */
    async uploadImage() {
        const file = document.getElementById('imageFile').files[0];
        const productId = document.getElementById('uploadProductId').value;
        const uploadBtn = document.getElementById('uploadBtn');

        if (!file || !productId) {
            app.showToast('Please select a file', 'error');
            return;
        }

        try {
            uploadBtn.disabled = true;
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '⏳ Uploading...';

            console.log('Uploading image for product:', productId, 'File:', file.name);

            await api.uploadImage(productId, file);

            app.showToast('✅ Image uploaded successfully!', 'success');
            
            // Wait a moment for backend to process
            await new Promise(resolve => setTimeout(resolve, 500));

            // Reload products to show new image
            await this.loadProducts();
            this.renderProductsGrid();
            this.renderPosProductsGrid();

            // Close modal
            this.closeModals();
            
        } catch (error) {
            console.error('Upload error:', error);
            app.showToast(error.message || 'Failed to upload image', 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalText || 'Upload Image';
        }
    },

    /**
     * Clear add product form
     */
    clearAddForm() {
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productImage').value = '';
        
        // Reset image preview
        const preview = document.getElementById('productImagePreview');
        const placeholder = document.getElementById('productImagePlaceholder');
        if (preview && placeholder) {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    },

    /**
     * Get product by ID
     */
    getProduct(productId) {
        return this.allProducts.find((p) => p.id === productId);
    },
};




