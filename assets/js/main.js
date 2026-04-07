/**
 * FIS Online - Main JavaScript
 * First | Sartorials
 * Fashion • Lifestyle • Made to Measure
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get URL parameters
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// ========================================
// MOBILE NAVIGATION
// ========================================

const MobileNav = {
  init() {
    this.menuToggle = document.querySelector('.menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.closeBtn = document.querySelector('.mobile-nav__close');
    this.overlay = document.querySelector('.sidebar-overlay');
    
    if (!this.menuToggle || !this.mobileNav) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.menuToggle.addEventListener('click', () => this.toggle());
    
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // Handle submenu toggles
    const submenuToggles = document.querySelectorAll('.mobile-nav__link[data-submenu]');
    submenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const item = toggle.closest('.mobile-nav__item');
        item.classList.toggle('mobile-nav__item--active');
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },
  
  toggle() {
    const isActive = this.mobileNav.classList.contains('mobile-nav--active');
    isActive ? this.close() : this.open();
  },
  
  open() {
    this.mobileNav.classList.add('mobile-nav--active');
    this.menuToggle.classList.add('menu-toggle--active');
    if (this.overlay) this.overlay.classList.add('sidebar-overlay--active');
    document.body.style.overflow = 'hidden';
  },
  
  close() {
    this.mobileNav.classList.remove('mobile-nav--active');
    this.menuToggle.classList.remove('menu-toggle--active');
    if (this.overlay) this.overlay.classList.remove('sidebar-overlay--active');
    document.body.style.overflow = '';
  }
};

// ========================================
// SEARCH OVERLAY
// ========================================

const SearchOverlay = {
  init() {
    this.searchToggle = document.querySelector('[data-search-toggle]');
    this.searchOverlay = document.querySelector('.search-overlay');
    this.searchClose = document.querySelector('.search-overlay__close');
    this.searchInput = document.querySelector('.search-overlay__input');
    
    if (!this.searchToggle || !this.searchOverlay) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.searchToggle.addEventListener('click', () => this.open());
    
    if (this.searchClose) {
      this.searchClose.addEventListener('click', () => this.close());
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
    });
  },
  
  open() {
    this.searchOverlay.classList.add('search-overlay--active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (this.searchInput) this.searchInput.focus();
    }, 100);
  },
  
  close() {
    this.searchOverlay.classList.remove('search-overlay--active');
    document.body.style.overflow = '';
  }
};

// ========================================
// CART FUNCTIONALITY
// ========================================

const Cart = {
  items: [],
  
  init() {
    this.loadCart();
    this.updateCartCount();
    this.bindEvents();
    // Render cart items if on cart page
    if (document.querySelector('.cart-items')) {
      this.renderCartItems();
    }
  },
  
  bindEvents() {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        const productId = addBtn.dataset.addToCart;
        const productData = this.getProductData(addBtn);
        this.addItem(productData);
      }
    });
    
    // Remove from cart
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-from-cart]');
      if (removeBtn) {
        e.preventDefault();
        const itemId = removeBtn.dataset.removeFromCart;
        this.removeItem(itemId);
      }
    });
    
    // Update quantity
    document.addEventListener('click', (e) => {
      const qtyBtn = e.target.closest('[data-qty-update]');
      if (qtyBtn) {
        const itemId = qtyBtn.dataset.itemId;
        const action = qtyBtn.dataset.qtyUpdate;
        this.updateQuantity(itemId, action);
      }
    });
  },
  
  getProductData(button) {
    const card = button.closest('.product-card') || button.closest('.product-info');
    const titleEl = card?.querySelector('.product-card__title a') || card?.querySelector('.product-card__title') || card?.querySelector('.product-info__title');
    const imgEl = card?.querySelector('.product-card__image img') || card?.querySelector('.product-gallery__main img') || card?.querySelector('img');
    return {
      id: button.dataset.addToCart,
      name: titleEl?.textContent?.trim() || 'Product',
      price: parseFloat(button.dataset.price) || 0,
      image: imgEl?.src || '',
      size: (document.querySelector('.size-selector__item--active') || card?.querySelector('.size-selector__item--active'))?.textContent?.trim() || '',
      color: (document.querySelector('.color-selector__item--active') || card?.querySelector('.color-selector__item--active'))?.dataset?.color?.trim() || '',
      quantity: 1
    };
  },
  
  addItem(product) {
    const existingItem = this.items.find(item => 
      item.id === product.id && 
      item.size === product.size && 
      item.color === product.color
    );
    
    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.items.push({
        ...product,
        cartId: Date.now().toString()
      });
    }
    
    this.saveCart();
    this.updateCartCount();
    this.showNotification('Added to cart', 'success');
  },
  
  removeItem(cartId) {
    this.items = this.items.filter(item => item.cartId !== cartId);
    this.saveCart();
    this.updateCartCount();
    this.renderCartItems();
  },
  
  updateQuantity(cartId, action) {
    const item = this.items.find(item => item.cartId === cartId);
    if (!item) return;
    
    if (action === 'increase') {
      item.quantity++;
    } else if (action === 'decrease' && item.quantity > 1) {
      item.quantity--;
    }
    
    this.saveCart();
    this.renderCartItems();
  },
  
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  },
  
  saveCart() {
    localStorage.setItem('fis_cart', JSON.stringify(this.items));
  },
  
  loadCart() {
    const saved = localStorage.getItem('fis_cart');
    this.items = saved ? JSON.parse(saved) : [];
  },
  
  updateCartCount() {
    const countElements = document.querySelectorAll('.header__action-badge');
    const count = this.getItemCount();
    countElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
  
  renderCartItems() {
    const container = document.querySelector('.cart-items');
    if (!container) return;
    
    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <h3 class="empty-state__title">Your cart is empty</h3>
          <p class="empty-state__text">Looks like you haven't added anything to your cart yet.</p>
          <a href="shop/men.html" class="btn btn--primary">Start Shopping</a>
        </div>
      `;
      this.updateOrderSummary();
      this.updateCheckoutButton(false);
      return;
    }
    
    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-cart-id="${item.cartId}">
        <div class="cart-item__image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item__content">
          <h3 class="cart-item__title">${item.name}</h3>
          <p class="cart-item__variant">${item.size ? `Size: ${item.size}` : ''} ${item.color ? `| Color: ${item.color}` : ''}</p>
          <p class="cart-item__price">${formatCurrency(item.price)}</p>
          <div class="cart-item__actions">
            <div class="quantity-selector">
              <button class="quantity-selector__btn" data-item-id="${item.cartId}" data-qty-update="decrease">-</button>
              <input type="text" class="quantity-selector__input" value="${item.quantity}" readonly>
              <button class="quantity-selector__btn" data-item-id="${item.cartId}" data-qty-update="increase">+</button>
            </div>
            <button type="button" class="cart-item__remove" data-remove-from-cart="${item.cartId}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
    
    this.updateOrderSummary();
    this.updateCheckoutButton(true);
  },
  
  updateCheckoutButton(enabled) {
    const checkoutBtn = document.querySelector('.order-summary__checkout');
    if (!checkoutBtn) return;
    if (enabled && this.items.length > 0) {
      checkoutBtn.removeAttribute('disabled');
      checkoutBtn.classList.remove('btn--disabled');
      checkoutBtn.setAttribute('href', checkoutBtn.getAttribute('data-checkout-href') || 'checkout.html');
    } else {
      checkoutBtn.setAttribute('disabled', 'disabled');
      checkoutBtn.classList.add('btn--disabled');
      checkoutBtn.setAttribute('href', '#');
    }
  },
  
  updateOrderSummary() {
    const subtotal = this.getTotal();
    const isEmpty = this.items.length === 0;
    const shipping = isEmpty ? 0 : (subtotal > 2000 ? 0 : 99);
    const total = subtotal + shipping;
    
    const summarySubtotal = document.querySelector('[data-summary-subtotal]');
    const summaryShipping = document.querySelector('[data-summary-shipping]');
    const summaryTotal = document.querySelector('[data-summary-total]');
    
    if (summarySubtotal) summarySubtotal.textContent = formatCurrency(subtotal);
    if (summaryShipping) summaryShipping.textContent = isEmpty ? '—' : (shipping === 0 ? 'FREE' : formatCurrency(shipping));
    if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
  },
  
  showNotification(message, type = 'success') {
    Toast.show(message, type);
  }
};

// ========================================
// WISHLIST FUNCTIONALITY
// ========================================

const Wishlist = {
  items: [],
  
  init() {
    this.loadWishlist();
    this.updateWishlistButtons();
    this.bindEvents();
  },
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      const wishlistBtn = e.target.closest('[data-wishlist]');
      if (wishlistBtn) {
        e.preventDefault();
        const productId = wishlistBtn.dataset.wishlist;
        this.toggle(productId);
      }
    });
  },
  
  toggle(productId) {
    const index = this.items.indexOf(productId);
    if (index > -1) {
      this.items.splice(index, 1);
      Toast.show('Removed from wishlist', 'info');
    } else {
      this.items.push(productId);
      Toast.show('Added to wishlist', 'success');
    }
    this.saveWishlist();
    this.updateWishlistButtons();
  },
  
  isInWishlist(productId) {
    return this.items.includes(productId);
  },
  
  saveWishlist() {
    localStorage.setItem('fis_wishlist', JSON.stringify(this.items));
  },
  
  loadWishlist() {
    const saved = localStorage.getItem('fis_wishlist');
    this.items = saved ? JSON.parse(saved) : [];
  },
  
  updateWishlistButtons() {
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
      const productId = btn.dataset.wishlist;
      if (this.isInWishlist(productId)) {
        btn.classList.add('product-card__wishlist--active');
      } else {
        btn.classList.remove('product-card__wishlist--active');
      }
    });
  }
};

// ========================================
// TOAST NOTIFICATIONS
// ========================================

const Toast = {
  container: null,
  
  init() {
    this.createContainer();
  },
  
  createContainer() {
    if (document.querySelector('.toast-container')) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  
  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.createContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <div class="toast__icon">
        ${this.getIcon(type)}
      </div>
      <div class="toast__content">
        <p class="toast__message">${message}</p>
      </div>
      <button class="toast__close">&times;</button>
    `;
    
    this.container.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => {
      this.dismiss(toast);
    });
    
    // Auto dismiss
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  },
  
  dismiss(toast) {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  },
  
  getIcon(type) {
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="#17a2b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    return icons[type] || icons.info;
  }
};

// ========================================
// MODALS
// ========================================

const Modal = {
  init() {
    this.bindEvents();
  },
  
  bindEvents() {
    // Open modal triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-open]');
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.dataset.modalOpen;
        this.open(modalId);
      }
    });
    
    // Close modal triggers
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        const modal = closeBtn.closest('.modal');
        this.close(modal);
      }
    });
    
    // Close on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay--active')) {
        const modal = document.querySelector('.modal--active');
        this.close(modal);
      }
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal--active');
        if (modal) this.close(modal);
      }
    });
  },
  
  open(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay');
    
    if (!modal) return;
    
    if (overlay) overlay.classList.add('modal-overlay--active');
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const focusable = modal.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  },
  
  close(modal) {
    if (!modal) return;
    
    const overlay = document.querySelector('.modal-overlay');
    
    modal.classList.remove('modal--active');
    if (overlay) overlay.classList.remove('modal-overlay--active');
    document.body.style.overflow = '';
  }
};

// ========================================
// TABS
// ========================================

const Tabs = {
  init() {
    const tabsContainers = document.querySelectorAll('.tabs');
    tabsContainers.forEach(container => {
      this.setupTabs(container);
    });
  },
  
  setupTabs(container) {
    const tabs = container.querySelectorAll('.tabs__item');
    const contents = container.parentElement.querySelectorAll('.tabs__content');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active from all
        tabs.forEach(t => t.classList.remove('tabs__item--active'));
        contents.forEach(c => c.classList.remove('tabs__content--active'));
        
        // Add active to clicked
        tab.classList.add('tabs__item--active');
        if (contents[index]) {
          contents[index].classList.add('tabs__content--active');
        }
      });
    });
  }
};

// ========================================
// ACCORDION
// ========================================

const Accordion = {
  init() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
      this.setupAccordion(accordion);
    });
  },
  
  setupAccordion(accordion) {
    const headers = accordion.querySelectorAll('.accordion__header');
    
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('accordion__item--active');
        
        // Close all items
        accordion.querySelectorAll('.accordion__item').forEach(i => {
          i.classList.remove('accordion__item--active');
        });
        
        // Toggle clicked item
        if (!isActive) {
          item.classList.add('accordion__item--active');
        }
      });
    });
  }
};

// ========================================
// PRODUCT GALLERY
// ========================================

const ProductGallery = {
  init() {
    this.mainImage = document.querySelector('.product-gallery__main img');
    this.thumbs = document.querySelectorAll('.product-gallery__thumb');
    
    if (!this.mainImage || !this.thumbs.length) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        // Update main image
        const newSrc = thumb.querySelector('img').src;
        this.mainImage.src = newSrc;
        
        // Update active state
        this.thumbs.forEach(t => t.classList.remove('product-gallery__thumb--active'));
        thumb.classList.add('product-gallery__thumb--active');
      });
    });
  }
};

// ========================================
// SIZE & COLOR SELECTORS
// ========================================

const ProductOptions = {
  init() {
    this.setupSizeSelector();
    this.setupColorSelector();
    this.setupQuantitySelector();
  },
  
  setupSizeSelector() {
    document.addEventListener('click', (e) => {
      const sizeItem = e.target.closest('.size-selector__item:not(.size-selector__item--disabled)');
      if (sizeItem) {
        const selector = sizeItem.closest('.size-selector');
        selector.querySelectorAll('.size-selector__item').forEach(item => {
          item.classList.remove('size-selector__item--active');
        });
        sizeItem.classList.add('size-selector__item--active');
      }
    });
  },
  
  setupColorSelector() {
    document.addEventListener('click', (e) => {
      const colorItem = e.target.closest('.color-selector__item');
      if (colorItem) {
        const selector = colorItem.closest('.color-selector');
        selector.querySelectorAll('.color-selector__item').forEach(item => {
          item.classList.remove('color-selector__item--active');
        });
        colorItem.classList.add('color-selector__item--active');
      }
    });
  },
  
  setupQuantitySelector() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.quantity-selector__btn');
      if (!btn) return;
      
      const selector = btn.closest('.quantity-selector');
      const input = selector.querySelector('.quantity-selector__input');
      let value = parseInt(input.value) || 1;
      
      if (btn.textContent === '+') {
        value++;
      } else if (btn.textContent === '-' && value > 1) {
        value--;
      }
      
      input.value = value;
    });
  }
};

// ========================================
// FILTERS (SHOP PAGE)
// ========================================

const Filters = {
  init() {
    this.sidebar = document.querySelector('.sidebar');
    this.filterToggle = document.querySelector('.filter-toggle');
    this.filterClose = document.querySelector('.sidebar__close');
    this.overlay = document.querySelector('.sidebar-overlay');
    
    this.bindEvents();
    
    if (this.filterToggle && this.sidebar) {
      this.filterToggle.addEventListener('click', () => this.openFilters());
    }
    if (this.filterClose) {
      this.filterClose.addEventListener('click', () => this.closeFilters());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeFilters());
    }
    
    // Filter group toggles (collapse/expand)
    document.querySelectorAll('.filters__title').forEach(title => {
      title.addEventListener('click', () => {
        const group = title.closest('.filters__group');
        if (group) group.classList.toggle('filters__group--collapsed');
      });
    });
  },
  
  bindEvents() {
    // Color filter buttons: toggle active state
    document.addEventListener('click', (e) => {
      const colorBtn = e.target.closest('.filters__color');
      if (colorBtn) {
        e.preventDefault();
        colorBtn.classList.toggle('filters__color--active');
        Toast.show('Filter updated', 'info');
      }
    });
    
    // Clear all filters
    document.addEventListener('click', (e) => {
      const clearBtn = e.target.closest('[data-clear-filters]');
      if (clearBtn) {
        e.preventDefault();
        this.clearAll();
      }
    });
    
    // Sort select: on change
    document.addEventListener('change', (e) => {
      const sortSelect = e.target.closest('.sort__select');
      if (sortSelect) {
        const option = sortSelect.options[sortSelect.selectedIndex];
        Toast.show(`Sorted by: ${option?.textContent || 'Selected'}`, 'info');
      }
    });
    
    // Pagination: page number and prev/next
    document.addEventListener('click', (e) => {
      const pageItem = e.target.closest('.pagination__item');
      if (!pageItem || pageItem.classList.contains('pagination__item--disabled')) return;
      
      const pagination = pageItem.closest('.pagination');
      if (!pagination) return;
      
      const items = pagination.querySelectorAll('.pagination__item');
      const isPrev = pageItem.getAttribute('aria-label') === 'Previous';
      const isNext = pageItem.getAttribute('aria-label') === 'Next';
      
      let activeIndex = -1;
      items.forEach((el, i) => {
        if (el.classList.contains('pagination__item--active')) activeIndex = i;
      });
      
      if (isPrev && activeIndex > 1) {
        items.forEach(el => el.classList.remove('pagination__item--active'));
        items[activeIndex - 1].classList.add('pagination__item--active');
        Toast.show('Previous page', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isNext && activeIndex >= 0 && activeIndex < items.length - 2) {
        items.forEach(el => el.classList.remove('pagination__item--active'));
        items[activeIndex + 1].classList.add('pagination__item--active');
        Toast.show('Next page', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!isPrev && !isNext && !pageItem.querySelector('svg')) {
        items.forEach(el => el.classList.remove('pagination__item--active'));
        pageItem.classList.add('pagination__item--active');
        Toast.show(`Page ${pageItem.textContent}`, 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  },
  
  clearAll() {
    document.querySelectorAll('.filters__color').forEach(el => el.classList.remove('filters__color--active'));
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    const sizeContainer = document.querySelector('.filters .size-selector');
    if (sizeContainer) {
      sizeContainer.querySelectorAll('.size-selector__item').forEach(el => el.classList.remove('size-selector__item--active'));
    }
    Toast.show('Filters cleared', 'info');
    this.closeFilters();
  },
  
  openFilters() {
    if (this.sidebar) {
      this.sidebar.classList.add('sidebar--active');
      if (this.overlay) this.overlay.classList.add('sidebar-overlay--active');
      document.body.style.overflow = 'hidden';
    }
  },
  
  closeFilters() {
    if (this.sidebar) {
      this.sidebar.classList.remove('sidebar--active');
      if (this.overlay) this.overlay.classList.remove('sidebar-overlay--active');
      document.body.style.overflow = '';
    }
  }
};

// ========================================
// FORM VALIDATION
// ========================================

const FormValidation = {
  init() {
    const forms = document.querySelectorAll('[data-validate]');
    forms.forEach(form => {
      this.setupForm(form);
    });
  },
  
  setupForm(form) {
    form.addEventListener('submit', (e) => {
      const isValid = this.validateForm(form);
      if (!isValid) {
        e.preventDefault();
      }
    });
    
    // Real-time validation
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        this.validateField(field);
      });
    });
  },
  
  validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('[required]');
    
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  },
  
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let message = '';
    
    // Required check
    if (field.required && !value) {
      isValid = false;
      message = 'This field is required';
    }
    
    // Email validation
    if (type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (type === 'tel' && value && !this.isValidPhone(value)) {
      isValid = false;
      message = 'Please enter a valid phone number';
    }
    
    // Min length
    if (field.minLength && value.length < field.minLength) {
      isValid = false;
      message = `Minimum ${field.minLength} characters required`;
    }
    
    this.showFieldError(field, isValid, message);
    return isValid;
  },
  
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  isValidPhone(phone) {
    return /^[\d\s\-+()]{10,}$/.test(phone);
  },
  
  showFieldError(field, isValid, message) {
    const group = field.closest('.form-group');
    if (!group) return;
    
    const existingError = group.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    field.classList.remove('form-input--error', 'form-input--success');
    
    if (!isValid) {
      field.classList.add('form-input--error');
      const error = document.createElement('span');
      error.className = 'form-error';
      error.textContent = message;
      group.appendChild(error);
    } else if (field.value) {
      field.classList.add('form-input--success');
    }
  }
};

// ========================================
// BACK TO TOP
// ========================================

const BackToTop = {
  init() {
    this.button = document.querySelector('.back-to-top');
    if (!this.button) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    window.addEventListener('scroll', debounce(() => {
      if (window.scrollY > 500) {
        this.button.classList.add('back-to-top--visible');
      } else {
        this.button.classList.remove('back-to-top--visible');
      }
    }, 100));
    
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

// ========================================
// LAZY LOADING IMAGES
// ========================================

const LazyLoad = {
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            this.observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        this.observer.observe(img);
      });
    } else {
      // Fallback for older browsers
      document.querySelectorAll('img[data-src]').forEach(img => {
        this.loadImage(img);
      });
    }
  },
  
  loadImage(img) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  }
};

// ========================================
// WHATSAPP INTEGRATION
// ========================================

const WhatsApp = {
  phone: '9000682654', // Replace with actual phone number
  
  init() {
    this.bindEvents();
  },
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-whatsapp]');
      if (btn) {
        e.preventDefault();
        const message = btn.dataset.whatsapp || '';
        this.openChat(message);
      }
    });
  },
  
  openChat(message = '') {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${this.phone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }
};

// ========================================
// CART PAGE ACTIONS (Coupon, Checkout)
// ========================================

const CartPageActions = {
  init() {
    document.addEventListener('click', (e) => {
      const applyBtn = e.target.closest('.order-summary__coupon-form button');
      if (applyBtn && applyBtn.closest('.order-summary__coupon-form')) {
        e.preventDefault();
        const input = applyBtn.previousElementSibling;
        const code = input?.value?.trim();
        if (!code) {
          Toast.show('Enter a coupon code', 'warning');
          return;
        }
        Toast.show('Coupon applied: ' + code, 'success');
        if (input) input.value = '';
      }
    });
  }
};

// ========================================
// MEASUREMENT FORM
// ========================================

const MeasurementForm = {
  init() {
    this.form = document.querySelector('.measurement-form');
    if (!this.form) return;
    
    this.setupUnitToggle();
    this.loadSavedData();
    this.setupAutoSave();
  },
  
  setupUnitToggle() {
    const toggleBtns = document.querySelectorAll('.measurement-form__unit-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('measurement-form__unit-btn--active'));
        btn.classList.add('measurement-form__unit-btn--active');
        this.convertUnits(btn.dataset.unit);
      });
    });
  },
  
  convertUnits(unit) {
    const inputs = this.form.querySelectorAll('[data-measurement]');
    inputs.forEach(input => {
      let value = parseFloat(input.value);
      if (isNaN(value)) return;
      
      if (unit === 'inch') {
        // Convert cm to inches
        input.value = (value / 2.54).toFixed(1);
      } else {
        // Convert inches to cm
        input.value = (value * 2.54).toFixed(1);
      }
    });
  },
  
  loadSavedData() {
    const saved = localStorage.getItem('fis_measurements');
    if (!saved) return;
    
    const data = JSON.parse(saved);
    Object.keys(data).forEach(key => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input) input.value = data[key];
    });
  },
  
  setupAutoSave() {
    this.form.addEventListener('input', debounce(() => {
      const data = {};
      const inputs = this.form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.name) {
          data[input.name] = input.value;
        }
      });
      localStorage.setItem('fis_measurements', JSON.stringify(data));
    }, 500));
  }
};

// ========================================
// INITIALIZE ALL MODULES
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Core functionality
  MobileNav.init();
  SearchOverlay.init();
  Cart.init();
  Wishlist.init();
  Toast.init();
  Modal.init();
  
  // UI Components
  Tabs.init();
  Accordion.init();
  ProductGallery.init();
  ProductOptions.init();
  Filters.init();
  
  // Forms
  FormValidation.init();
  MeasurementForm.init();
  
  // Utilities
  BackToTop.init();
  LazyLoad.init();
  WhatsApp.init();
  CartPageActions.init();
  
  console.log('FIS Online initialized');
});

// CSS for toast animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
