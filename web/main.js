const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CART_STORAGE_KEY = 'shreck_cart_v3';

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);
revealElements.forEach((item) => revealObserver.observe(item));

const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-[-8px]');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-8px]');
  }, 1800);
};

const countdownElement = document.getElementById('deal-countdown');
const setupCountdown = () => {
  if (!countdownElement) return;

  const now = new Date();
  const deadline = new Date(now.getTime() + 5 * 60 * 60 * 1000 + 23 * 60 * 1000);

  const tick = () => {
    const diff = Math.max(0, deadline.getTime() - Date.now());
    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
  };

  tick();
  setInterval(tick, 1000);
};
setupCountdown();

const cartState = new Map();

const cartCount = document.getElementById('cart-count');
const cartItemsPreview = document.getElementById('cart-items-preview');
const cartSubtotalPreview = document.getElementById('cart-subtotal-preview');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartItemsList = document.getElementById('cart-items-list');
const cartEmpty = document.getElementById('cart-empty');

const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartClearBtn = document.getElementById('cart-clear-btn');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

const productSearch = document.getElementById('product-search');
const sortSelect = document.getElementById('sort-select');
const visibleCount = document.getElementById('visible-count');
const productGrid = document.getElementById('product-grid');
const categoryFilters = document.querySelectorAll('.category-filter');
let activeCategory = 'all';

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const saveCart = () => {
  const serialized = Array.from(cartState.values());
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serialized));
};

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    parsed.forEach((item) => {
      if (!item?.id || !item?.name || typeof item?.price !== 'number' || typeof item?.quantity !== 'number') return;
      if (item.quantity <= 0) return;
      cartState.set(item.id, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    });
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
};

const getCartTotals = () => {
  let items = 0;
  let subtotal = 0;

  cartState.forEach((item) => {
    items += item.quantity;
    subtotal += item.quantity * item.price;
  });

  return { items, subtotal };
};

const renderCartItems = () => {
  if (!cartItemsList || !cartEmpty) return;

  cartItemsList.querySelectorAll('[data-cart-item]').forEach((node) => node.remove());

  if (cartState.size === 0) {
    cartEmpty.classList.remove('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');

  cartState.forEach((item) => {
    const row = document.createElement('article');
    row.dataset.cartItem = item.id;
    row.className = 'rounded-xl border border-white/10 bg-white/[.03] p-3';
    row.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-semibold text-sm">${item.name}</p>
          <p class="text-xs text-ink/55">${currencyFormatter.format(item.price)} · ud</p>
        </div>
        <button class="remove-item btn-small rounded-md border border-white/12 px-2 py-1 text-xs text-ink/70" data-item-id="${item.id}">Quitar</button>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button class="decrease-item btn-small h-7 w-7 rounded-md border border-white/12" data-item-id="${item.id}">-</button>
          <span class="w-6 text-center text-sm">${item.quantity}</span>
          <button class="increase-item btn-small h-7 w-7 rounded-md border border-white/12" data-item-id="${item.id}">+</button>
        </div>
        <strong class="text-sm text-mint">${currencyFormatter.format(item.quantity * item.price)}</strong>
      </div>
    `;
    cartItemsList.appendChild(row);
  });
};

const syncCartUI = () => {
  const { items, subtotal } = getCartTotals();
  const subtotalText = currencyFormatter.format(subtotal);

  if (cartCount) cartCount.textContent = String(items);
  if (cartItemsPreview) cartItemsPreview.textContent = String(items);
  if (cartSubtotalPreview) cartSubtotalPreview.textContent = subtotalText;
  if (cartSubtotal) cartSubtotal.textContent = subtotalText;

  renderCartItems();
  saveCart();
};

const openCart = () => {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove('translate-x-full');
  cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
};

const closeCart = () => {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.add('translate-x-full');
  cartOverlay.classList.add('opacity-0', 'pointer-events-none');
};

const addProductToCart = (product) => {
  const existing = cartState.get(product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartState.set(product.id, { ...product, quantity: 1 });
  }
  syncCartUI();
  openCart();
  showToast(`Añadido: ${product.name}`);
};

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const product = {
      id: button.dataset.productId,
      name: button.dataset.productName,
      price: Number(button.dataset.productPrice),
    };
    addProductToCart(product);
  });
});

cartItemsList?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const itemId = target.dataset.itemId;
  if (!itemId) return;

  const item = cartState.get(itemId);
  if (!item) return;

  if (target.classList.contains('increase-item')) {
    item.quantity += 1;
  }

  if (target.classList.contains('decrease-item')) {
    item.quantity -= 1;
    if (item.quantity <= 0) cartState.delete(itemId);
  }

  if (target.classList.contains('remove-item')) {
    cartState.delete(itemId);
  }

  syncCartUI();
});

cartToggleBtn?.addEventListener('click', openCart);
cartCloseBtn?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
cartClearBtn?.addEventListener('click', () => {
  cartState.clear();
  syncCartUI();
});

cartCheckoutBtn?.addEventListener('click', () => {
  closeCart();
  document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCart();
});

const productCards = Array.from(document.querySelectorAll('.product-card'));

const applyProductFilters = () => {
  const searchTerm = (productSearch?.value || '').trim().toLowerCase();
  const sortType = sortSelect?.value || 'popular';

  const filtered = productCards.filter((card) => {
    const name = card.dataset.name || '';
    const category = card.dataset.category || '';
    const categoryMatch = activeCategory === 'all' || category === activeCategory;
    const searchMatch = name.includes(searchTerm);
    return categoryMatch && searchMatch;
  });

  filtered.sort((a, b) => {
    const aPrice = Number(a.dataset.price);
    const bPrice = Number(b.dataset.price);
    const aPopularity = Number(a.dataset.popularity);
    const bPopularity = Number(b.dataset.popularity);
    const aName = a.dataset.name || '';
    const bName = b.dataset.name || '';

    if (sortType === 'price-asc') return aPrice - bPrice;
    if (sortType === 'price-desc') return bPrice - aPrice;
    if (sortType === 'name') return aName.localeCompare(bName, 'es');
    return bPopularity - aPopularity;
  });

  productCards.forEach((card) => card.classList.add('hidden'));
  filtered.forEach((card) => {
    card.classList.remove('hidden');
    productGrid?.appendChild(card);
  });

  if (visibleCount) visibleCount.textContent = String(filtered.length);
};

productSearch?.addEventListener('input', applyProductFilters);
sortSelect?.addEventListener('change', applyProductFilters);

categoryFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.filter || 'all';

    categoryFilters.forEach((item) => {
      item.classList.remove('bg-mint/10', 'border-mint/35', 'text-mint');
      item.classList.add('border-white/15');
    });

    button.classList.add('bg-mint/10', 'border-mint/35', 'text-mint');
    button.classList.remove('border-white/15');

    applyProductFilters();
  });
});

document.querySelectorAll('.wishlist-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const active = button.dataset.active === '1';
    if (active) {
      button.dataset.active = '0';
      button.textContent = '♡';
      button.classList.remove('text-mint', 'border-mint/35', 'bg-mint/10');
    } else {
      button.dataset.active = '1';
      button.textContent = '♥';
      button.classList.add('text-mint', 'border-mint/35', 'bg-mint/10');
    }
  });
});

const magneticLarge = document.querySelectorAll('.magnetic-large');
magneticLarge.forEach((element) => {
  if (prefersReducedMotion) return;

  element.addEventListener('mousemove', (event) => {
    const rect = element.getBoundingClientRect();
    const deltaX = event.clientX - (rect.left + rect.width / 2);
    const deltaY = event.clientY - (rect.top + rect.height / 2);
    element.style.transform = `translate(${deltaX * 0.08}px, ${deltaY * 0.08}px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'translate(0px, 0px)';
  });
});

const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / rect.width;
    const pointerY = (event.clientY - rect.top) / rect.height;

    const rotateY = (pointerX - 0.5) * 8;
    const rotateX = (0.5 - pointerY) * 6;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.borderColor = 'rgba(156,255,46,.40)';
    card.style.boxShadow = '0 20px 50px rgba(2,4,9,.55)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.borderColor = '';
    card.style.boxShadow = '';
  });
});

const canvas = document.getElementById('bg-canvas');
const context = canvas?.getContext('2d');

if (canvas && context) {
  const particles = [];
  const particleCount = Math.min(140, Math.floor(window.innerWidth * 0.09));

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const createParticles = () => {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.5,
      });
    }
  };

  resizeCanvas();
  createParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i += 1) {
      const point = particles[i];
      point.x += prefersReducedMotion ? point.vx * 0.3 : point.vx;
      point.y += prefersReducedMotion ? point.vy * 0.3 : point.vy;

      if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
      if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

      context.beginPath();
      context.fillStyle = 'rgba(156,255,46,.33)';
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const target = particles[j];
        const dx = point.x - target.x;
        const dy = point.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 95) {
          context.strokeStyle = `rgba(156,255,46,${0.11 - distance / 900})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(target.x, target.y);
          context.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
}

loadCart();
syncCartUI();
applyProductFilters();
