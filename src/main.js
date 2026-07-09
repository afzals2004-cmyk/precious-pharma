import './style.css'
import { initLocalization } from './i18n.js';

const renderHeader = () => `
  <header>
    <nav class="container">
      <div class="logo">Precious Pharma</div>
      <div class="nav-links">
        <a href="/" data-i18n="nav_home">Home</a>
        <a href="/shop.html" data-i18n="nav_shop">Shop</a>
        <a href="/about.html" data-i18n="nav_about">About</a>
        <a href="/contact.html" data-i18n="nav_contact">Contact</a>
        <a href="/login.html" class="auth-link" data-i18n="nav_login">Login</a>
      </div>
      <div class="nav-actions">
        <button class="icon-btn">🔍</button>
        <button class="icon-btn" onclick="window.location.href='/cart.html'">🛒 <span class="cart-count">0</span></button>
      </div>
    </nav>
  </header>
`;

const renderFooter = () => `
  <footer>
    <div class="container footer-content" style="text-align: center;">
      <div style="margin-bottom: 2rem;">
        <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Subscribe to our Newsletter</h3>
        <p style="margin-bottom: 1rem;">Stay updated with the latest wellness tips and exclusive offers.</p>
        <form onsubmit="event.preventDefault(); alert('Subscribed!');" style="max-width: 400px; margin: 0 auto; display: flex; gap: 0.5rem;">
            <input type="email" placeholder="Enter your email" required style="flex-grow: 1; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" class="btn-primary" style="padding: 0.8rem 1.5rem;">Subscribe</button>
        </form>
      </div>
      <p data-i18n="footer_copy">&copy; 2025 Precious Pharma. All rights reserved.</p>
    </div>
  </footer>
`;

const app = document.querySelector('#app');
const shopPage = document.querySelector('#shop-page');

if (app) {
  // Home Page Layout
  app.innerHTML = `
    ${renderHeader()}
    <main>
      <section class="hero">
        <div class="hero-content container">
          <h1>Your Health, <br><span class="text-gold">Our Priority</span></h1>
          <p data-i18n="hero_desc">Experience the future of online pharmacy with premium care and swift delivery.</p>
          <button class="btn-primary" data-i18n="hero_btn" onclick="document.querySelector('.products').scrollIntoView({behavior: 'smooth'})">Shop Now</button>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="container" style="padding: 4rem 0; text-align: center; background: #fff;">
          <h2 style="color: var(--color-primary); margin-bottom: 2rem;">What Our Clients Say</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
              <div style="padding: 2rem; background: var(--color-bg-alt); border-radius: 8px;">
                  <p style="font-style: italic; margin-bottom: 1rem;">"Precious Pharma has transformed how I manage my family's health. The premium service is unmatched."</p>
                  <strong>- Sarah M.</strong>
              </div>
              <div style="padding: 2rem; background: var(--color-bg-alt); border-radius: 8px;">
                  <p style="font-style: italic; margin-bottom: 1rem;">"Fast delivery and genuine products. I feel safe shopping here."</p>
                  <strong>- Ahmed K.</strong>
              </div>
               <div style="padding: 2rem; background: var(--color-bg-alt); border-radius: 8px;">
                  <p style="font-style: italic; margin-bottom: 1rem;">"Excellent customer support. They truly care about your wellness."</p>
                  <strong>- John D.</strong>
              </div>
          </div>
      </section>

      <section class="products container">
        <div class="section-header">
          <h2 data-i18n="section_premium">Premium Selection</h2>
          <p data-i18n="section_desc">Curated healthcare essentials for you.</p>
        </div>
        <div id="product-grid" class="product-grid">
          <p class="text-center">Loading premium products...</p>
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;
} else if (shopPage) {
  // Shop Page Layout
  shopPage.innerHTML = `
    ${renderHeader()}
    <main>
      <div class="container" style="padding-top: 2rem;">
        <h1 style="margin-bottom: 2rem; color: var(--color-primary);">Shop All Products</h1>
        <div id="product-grid" class="product-grid">
          <p class="text-center">Loading products...</p>
        </div>
      </div>
    </main>
    ${renderFooter()}
  `;
}

// State
let products = [];
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
const saveCart = (c) => localStorage.setItem('cart', JSON.stringify(c));

// Fetch Information
const fetchProducts = async () => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch');
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error(error);
    document.getElementById('product-grid').innerHTML = '<p>Unable to load products. Ensure backend is running.</p>';
  }
};

// Render
const renderProducts = () => {
  const grid = document.getElementById('product-grid');
  if (products.length === 0) {
    grid.innerHTML = '<p>No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <a href="/product.html?id=${product.id}">
        <div class="product-image">
          <img src="${product.image_url}" alt="${product.name}" style="width:100%; height:200px; object-fit:cover; border-radius:4px;">
        </div>
      </a>
      <div class="product-info">
        <a href="/product.html?id=${product.id}">
          <h3 class="product-title">${product.name}</h3>
        </a>
        <p style="color:#888; font-size:0.9rem; margin-bottom:0.5rem;">${product.description || product.category || ''}</p>
        <span class="product-price">$${Number(product.price).toFixed(2)}</span>
        <button class="btn-secondary" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
};

// Cart Logic
window.addToCart = (id) => {
  const product = products.find(p => p.id === id);
  if (product) {
    const cart = getCart();
    cart.push(product);
    saveCart(cart);
    updateCartUI();

    const btn = event.target;
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = "Added!";
      btn.style.backgroundColor = "var(--color-primary)";
      btn.style.color = "white";
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
        btn.style.color = "";
      }, 1000);
    }
  }
};

const updateCartUI = () => {
  const countSpan = document.querySelector('.cart-count');
  if (countSpan) {
    countSpan.innerText = getCart().length;
    countSpan.style.transform = 'scale(1.2)';
    setTimeout(() => countSpan.style.transform = 'scale(1)', 200);
  }
};


document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initLocalization();
});

fetchProducts();
