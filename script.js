"use strict";

/* =========================================================
   CraveKart — front-end demo
   Data lives in this browser only (localStorage).
   ========================================================= */

/* ---------- Menu data ---------- */
const foods = [
  { id: 1, name: "Margherita Pizza", category: "Pizza", veg: true, price: 249, rating: 4.9, tag: "Bestseller", desc: "Classic mozzarella, basil & rich tomato.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700&auto=format&fit=crop&q=80" },
  { id: 2, name: "Smoky BBQ Burger", category: "Burgers", veg: false, price: 219, rating: 4.8, tag: "Fan favourite", desc: "Grilled patty, smoky BBQ & crunchy lettuce.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80" },
  { id: 3, name: "Creamy Alfredo Pasta", category: "Pasta", veg: true, price: 279, rating: 4.7, tag: "Chef's pick", desc: "Silky white sauce, herbs & parmesan.", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=700&auto=format&fit=crop&q=80" },
  { id: 4, name: "Loaded Cheese Fries", category: "Sides", veg: true, price: 149, rating: 4.8, tag: "Popular", desc: "Golden fries with cheese & a little spice.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700&auto=format&fit=crop&q=80" },
  { id: 5, name: "Farmhouse Pizza", category: "Pizza", veg: true, price: 329, rating: 4.9, tag: "Veg favourite", desc: "Fresh veggies, olives & mozzarella.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80" },
  { id: 6, name: "Crispy Chicken Burger", category: "Burgers", veg: false, price: 239, rating: 4.7, tag: "Crunchy", desc: "Crispy chicken, house sauce & pickles.", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=700&auto=format&fit=crop&q=80" },
  { id: 7, name: "Veg Hakka Noodles", category: "Asian", veg: true, price: 189, rating: 4.6, tag: "Street style", desc: "Wok-tossed noodles with garden vegetables.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700&auto=format&fit=crop&q=80" },
  { id: 8, name: "Chocolate Brownie", category: "Desserts", veg: true, price: 129, rating: 4.9, tag: "Sweet treat", desc: "Warm, fudgy chocolate indulgence.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80" },
  { id: 9, name: "Classic Pancakes", category: "Desserts", veg: true, price: 179, rating: 4.7, tag: "New", desc: "Fluffy pancakes with maple-style syrup.", image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=700&auto=format&fit=crop&q=80" },
  { id: 10, name: "Mango Cooler", category: "Drinks", veg: true, price: 99, rating: 4.6, tag: "Refreshing", desc: "A chilled tropical mango drink.", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=700&auto=format&fit=crop&q=80" },
  { id: 11, name: "Garden Fresh Salad", category: "Sides", veg: true, price: 169, rating: 4.5, tag: "Fresh pick", desc: "Crisp greens, cucumber & house dressing.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80" },
  { id: 12, name: "Iced Coffee", category: "Drinks", veg: true, price: 119, rating: 4.8, tag: "Chilled", desc: "Smooth coffee poured over ice.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&auto=format&fit=crop&q=80" }
];

/* ---------- Config ---------- */
const STORE = { cart: "CraveKart-cart", orders: "CraveKart-orders", profile: "CraveKart-profile" };
const GST_RATE = 0.05;
const FREE_DELIVERY_MIN = 499;
const DELIVERY_FEE = 29;
const MAX_QTY = 20;
const ORDERS_PAGE_SIZE = 5;

const COUPONS = {
  YUM10: { label: "10% off, up to ₹100", min: 0, calc: s => Math.min(Math.round(s * 0.1), 100) },
  FIRST50: { label: "₹50 off your first order", min: 199, firstOrderOnly: true, calc: () => 50 }
};

/* Order tracking is simulated from the time an order was placed.
   `after` = seconds since placing. Change these to slow the demo down. */
const STAGES = [
  { key: "placed", label: "Order placed", note: "We've received your order.", after: 0 },
  { key: "preparing", label: "Preparing", note: "The kitchen is cooking your food.", after: 30 },
  { key: "out", label: "Out for delivery", note: "Your rider is on the way.", after: 120 },
  { key: "delivered", label: "Delivered", note: "Enjoy your meal!", after: 240 }
];

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtDate = t => new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const fmtTime = t => new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

let toastTimer;
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { showToast("Couldn't save to this browser (storage full or blocked)."); return false; }
}

/* ---------- State ---------- */
function sanitizeCart(raw) {
  const out = {};
  if (raw && typeof raw === "object") {
    for (const [id, q] of Object.entries(raw)) {
      const n = Math.floor(Number(q));
      if (foods.some(f => f.id === Number(id)) && n > 0) out[id] = Math.min(n, MAX_QTY);
    }
  }
  return out;
}
function sanitizeOrders(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(o => o && o.id && Array.isArray(o.items) && o.pricing && Number.isFinite(o.createdAt));
}

const grid = $("#foodGrid");
let activeCategory = "All";
let cart = sanitizeCart(load(STORE.cart, {}));
let orders = sanitizeOrders(load(STORE.orders, []));
let activeCoupon = null;
let orderFilter = "all";
let orderQuery = "";
let ordersShown = ORDERS_PAGE_SIZE;
let openOrderId = null;
let lastPlacedId = null;

/* ---------- Menu ---------- */
function renderMenu() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const vegOnly = $("#vegOnly").checked;
  let list = foods.filter(f =>
    (activeCategory === "All" || f.category === activeCategory) &&
    (!vegOnly || f.veg) &&
    (f.name + " " + f.desc + " " + f.category).toLowerCase().includes(q));
  const sort = $("#sortSelect").value;
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  $("#resultCount").textContent = `Showing ${list.length} delicious ${list.length === 1 ? "pick" : "picks"}`;
  grid.innerHTML = list.map(f => `
    <article class="food-card">
      <div class="food-photo"><img src="${f.image}" alt="${esc(f.name)}" loading="lazy"><span class="food-tag">${f.tag}</span></div>
      <div class="food-info">
        <div class="food-title-row"><h3><span class="diet ${f.veg ? "veg" : "nonveg"}" title="${f.veg ? "Vegetarian" : "Non-vegetarian"}"></span>${esc(f.name)}</h3><span class="rating">★ ${f.rating}</span></div>
        <p class="food-desc">${f.desc}</p>
        <div class="food-bottom"><span class="food-price">${money(f.price)}</span><button class="add-btn" data-add="${f.id}" aria-label="Add ${esc(f.name)} to order">＋ Add</button></div>
      </div>
    </article>`).join("");
  $("#emptyState").classList.toggle("hidden", list.length !== 0);
  grid.classList.toggle("hidden", list.length === 0);
}

/* ---------- Cart & pricing ---------- */
const count = () => Object.values(cart).reduce((n, q) => n + q, 0);
const cartRows = () => Object.entries(cart)
  .map(([id, qty]) => ({ food: foods.find(f => f.id === Number(id)), qty }))
  .filter(x => x.food);

function calcPricing(rows, code) {
  const subtotal = rows.reduce((s, x) => s + x.food.price * x.qty, 0);
  const fee = subtotal && subtotal < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
  const c = code && COUPONS[code];
  const discount = c && subtotal >= c.min ? Math.min(c.calc(subtotal), subtotal) : 0;
  const tax = Math.round((subtotal - discount) * GST_RATE);
  return { subtotal, fee, discount, tax, total: subtotal + fee - discount + tax, coupon: discount ? code : null };
}

function persistCart() {
  save(STORE.cart, cart);
  if (!count()) activeCoupon = null;
  renderCart();
}

function setCouponMessage(msg, isError) {
  const el = $("#couponMessage");
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
}

function renderCart() {
  const rows = cartRows(), n = count();
  const p = calcPricing(rows, activeCoupon);
  $("#cartCount").textContent = n;
  $("#drawerCount").textContent = `(${n})`;
  $("#cartItems").innerHTML = rows.length ? rows.map(({ food, qty }) => `
    <div class="cart-item">
      <img src="${food.image}" alt="${esc(food.name)}">
      <div class="cart-item-main"><strong>${esc(food.name)}</strong><small>${money(food.price)} each</small>
        <div class="qty-control">
          <button data-qty="${food.id}" data-change="-1" aria-label="Decrease quantity of ${esc(food.name)}">−</button>
          <span aria-live="polite">${qty}</span>
          <button data-qty="${food.id}" data-change="1" aria-label="Increase quantity of ${esc(food.name)}">+</button>
        </div></div>
      <div class="cart-item-price">${money(food.price * qty)}</div>
    </div>`).join("") : `<div class="cart-empty"><span>🛍️</span><h3>Your cart is looking hungry</h3><p>Add something delicious from the menu.</p></div>`;
  $("#cartBottom").classList.toggle("hidden", !n);

  $("#freeHint").textContent = !p.subtotal ? "" :
    p.subtotal >= FREE_DELIVERY_MIN ? "🎉 You've unlocked free delivery!" :
      `Add ${money(FREE_DELIVERY_MIN - p.subtotal)} more for free delivery.`;
  $("#subtotal").textContent = money(p.subtotal);
  $("#deliveryFee").textContent = p.fee ? money(p.fee) : "FREE";
  $("#discountLine").classList.toggle("hidden", !p.discount);
  $("#discount").textContent = "−" + money(p.discount);
  $("#tax").textContent = money(p.tax);
  $("#total").textContent = money(p.total);

  if (activeCoupon && !p.discount && p.subtotal) {
    setCouponMessage(`Add ${money(COUPONS[activeCoupon].min - p.subtotal)} more to use ${activeCoupon}.`, true);
  }
}

function addToCart(id, qty = 1) {
  const cur = cart[id] || 0;
  if (cur >= MAX_QTY) { showToast(`Maximum ${MAX_QTY} of one item per order.`); return false; }
  cart[id] = Math.min(cur + qty, MAX_QTY);
  return true;
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  syncScroll();
  $("#cartClose").focus();
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  syncScroll();
}
function syncScroll() {
  const anyOpen = $("#cartDrawer").classList.contains("open") ||
    !$("#checkoutModal").classList.contains("hidden") ||
    !$("#orderModal").classList.contains("hidden");
  document.body.style.overflow = anyOpen ? "hidden" : "";
}

/* ---------- Order status helpers ---------- */
function stageIndex(o) {
  const secs = (Date.now() - o.createdAt) / 1000;
  let idx = 0;
  STAGES.forEach((s, i) => { if (secs >= s.after) idx = i; });
  return idx;
}
function statusOf(o) {
  if (o.cancelledAt) return { key: "cancelled", label: "Cancelled" };
  const s = STAGES[stageIndex(o)];
  return { key: s.key, label: s.label };
}
const isActive = o => !o.cancelledAt && stageIndex(o) < STAGES.length - 1;
const canCancel = o => !o.cancelledAt && stageIndex(o) <= 1;
const unitsOf = o => o.items.reduce((n, i) => n + i.qty, 0);

/* Keep a record of the last status we told the person about, and announce changes. */
function syncStatuses(announce) {
  let dirty = false;
  orders.forEach(o => {
    const key = statusOf(o).key;
    if (o.notified !== key) {
      if (announce && o.notified && key !== "cancelled") showToast(`Order ${o.id}: ${statusOf(o).label.toLowerCase()}`);
      o.notified = key;
      dirty = true;
    }
  });
  if (dirty) save(STORE.orders, orders);
  return dirty;
}

function newOrderId() {
  let id;
  do { id = "CB" + Math.floor(100000 + Math.random() * 900000); } while (orders.some(o => o.id === id));
  return id;
}

/* ---------- Orders: list ---------- */
function filteredOrders() {
  const q = orderQuery.trim().toLowerCase();
  return orders.filter(o => {
    const key = statusOf(o).key;
    const ok = orderFilter === "all" ||
      (orderFilter === "active" && isActive(o)) ||
      (orderFilter === "delivered" && key === "delivered") ||
      (orderFilter === "cancelled" && key === "cancelled");
    if (!ok) return false;
    return !q || (o.id + " " + o.items.map(i => i.name).join(" ")).toLowerCase().includes(q);
  }).sort((a, b) => b.createdAt - a.createdAt);
}

function renderStats() {
  const real = orders.filter(o => !o.cancelledAt);
  const spent = real.reduce((s, o) => s + o.pricing.total, 0);
  const tally = {};
  real.forEach(o => o.items.forEach(i => { tally[i.name] = (tally[i.name] || 0) + i.qty; }));
  const fav = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  $("#statOrders").textContent = orders.length;
  $("#statSpent").textContent = money(spent);
  $("#statFav").textContent = fav ? fav[0] : "—";
  $("#clearOrders").classList.toggle("hidden", !orders.length);
}

function renderBadge() {
  const n = orders.filter(isActive).length;
  const b = $("#orderBadge");
  b.textContent = n;
  b.classList.toggle("hidden", !n);
}

function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

function orderCard(o) {
  const st = statusOf(o);
  const thumbs = o.items.slice(0, 4).map(i => `<img src="${esc(i.image)}" alt="" loading="lazy">`).join("") +
    (o.items.length > 4 ? `<span class="more-thumb">+${o.items.length - 4}</span>` : "");
  const summary = o.items.map(i => `${i.qty}× ${esc(i.name)}`).join(", ");
  const rateBtn = st.key === "delivered" && !o.rating ? `<button class="link-btn" data-action="view" data-id="${o.id}">Rate order</button>` : "";
  const rated = o.rating ? `<span class="rated" title="You rated this ${o.rating.stars} out of 5">${stars(o.rating.stars)}</span>` : "";
  return `
  <article class="order-card">
    <div class="order-top">
      <div><strong class="order-id">#${o.id}</strong><small>${fmtDate(o.createdAt)}</small></div>
      <span class="status-pill s-${st.key}">${st.label}</span>
    </div>
    <div class="order-body">
      <div class="thumbs">${thumbs}</div>
      <div class="order-summary">
        <p>${summary}</p>
        <small>${plural(unitsOf(o), "item")} · ${esc(o.payment)} ${rated}</small>
      </div>
      <div class="order-total"><small>Total</small><strong>${money(o.pricing.total)}</strong></div>
    </div>
    <div class="order-actions">
      <button class="btn btn-dark btn-sm" data-action="view" data-id="${o.id}">View details</button>
      <button class="btn btn-ghost btn-sm" data-action="reorder" data-id="${o.id}">Order again</button>
      ${canCancel(o) ? `<button class="link-btn danger" data-action="cancel" data-id="${o.id}">Cancel order</button>` : ""}
      ${rateBtn}
    </div>
  </article>`;
}

function renderOrders() {
  renderStats();
  renderBadge();
  const list = filteredOrders();
  const shown = list.slice(0, ordersShown);
  $("#orderList").innerHTML = shown.map(orderCard).join("");
  $("#orderList").classList.toggle("hidden", !shown.length);

  const empty = $("#ordersEmpty");
  if (!orders.length) {
    empty.innerHTML = `<span>🧾</span><h3>No orders yet</h3><p>Your orders will show up here so you can track them and order again.</p><a class="btn btn-dark" href="#menu">Browse the menu</a>`;
  } else if (!list.length) {
    empty.innerHTML = `<span>🔎</span><h3>No matching orders</h3><p>Try a different filter or search term.</p><button class="btn btn-dark" id="resetOrderFilters">Show all orders</button>`;
  }
  empty.classList.toggle("hidden", !!list.length);

  const more = $("#ordersMore");
  const remaining = list.length - shown.length;
  more.classList.toggle("hidden", remaining <= 0);
  more.textContent = `Show more orders (${remaining})`;
}

/* ---------- Orders: detail modal ---------- */
function timelineHTML(o) {
  if (o.cancelledAt) {
    return `<ol class="timeline">
      <li class="done"><b>Order placed</b><small>${fmtTime(o.createdAt)}</small></li>
      <li class="done cancelled"><b>Cancelled</b><small>${fmtTime(o.cancelledAt)}</small></li></ol>`;
  }
  const idx = stageIndex(o);
  return `<ol class="timeline">${STAGES.map((s, i) => {
    const cls = i < idx ? "done" : i === idx ? "done current" : "";
    const time = i <= idx ? fmtTime(o.createdAt + s.after * 1000) : "";
    return `<li class="${cls}"><b>${s.label}</b><small>${i <= idx ? s.note : ""}${time ? " · " + time : ""}</small></li>`;
  }).join("")}</ol>`;
}

function renderOrderModal() {
  const o = orders.find(x => x.id === openOrderId);
  if (!o) return closeOrderModal();
  const st = statusOf(o), p = o.pricing;
  const rating = st.key === "delivered" ? `
    <div class="rate-box">
      <strong>${o.rating ? "Your rating" : "How was your order?"}</strong>
      <div class="stars" role="group" aria-label="Rate this order">${[1, 2, 3, 4, 5].map(n =>
        `<button data-rate="${n}" class="${o.rating && n <= o.rating.stars ? "on" : ""}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div>
    </div>` : "";
  $("#orderModalBody").innerHTML = `
    <div class="eyebrow">ORDER DETAILS</div>
    <h2 id="orderModalTitle">#${o.id}</h2>
    <div class="order-meta"><span class="status-pill s-${st.key}">${st.label}</span><small>Placed ${fmtDate(o.createdAt)}</small></div>
    ${timelineHTML(o)}
    ${isActive(o) ? `<p class="sim-note">Live tracking is simulated in this demo.</p>` : ""}
    <h3 class="modal-h3">Items</h3>
    <div class="detail-items">${o.items.map(i => `
      <div class="detail-item"><img src="${esc(i.image)}" alt=""><div><strong>${esc(i.name)}</strong><small>${money(i.price)} × ${i.qty}</small></div><b>${money(i.price * i.qty)}</b></div>`).join("")}</div>
    <div class="detail-bill">
      <div class="bill-line"><span>Subtotal</span><b>${money(p.subtotal)}</b></div>
      <div class="bill-line"><span>Delivery fee</span><b>${p.fee ? money(p.fee) : "FREE"}</b></div>
      ${p.discount ? `<div class="bill-line discount-line"><span>Discount (${esc(p.coupon)})</span><b>−${money(p.discount)}</b></div>` : ""}
      <div class="bill-line"><span>GST (5%)</span><b>${money(p.tax)}</b></div>
      <div class="bill-line total-line"><span>Total</span><b>${money(p.total)}</b></div>
    </div>
    <h3 class="modal-h3">Delivery &amp; payment</h3>
    <dl class="detail-info">
      <dt>Name</dt><dd>${esc(o.customer.name)}</dd>
      <dt>Phone</dt><dd>${esc(o.customer.phone)}</dd>
      <dt>Address</dt><dd>${esc(o.customer.address)}</dd>
      ${o.customer.notes ? `<dt>Instructions</dt><dd>${esc(o.customer.notes)}</dd>` : ""}
      <dt>Payment</dt><dd>${esc(o.payment)}</dd>
    </dl>
    ${rating}
    <div class="modal-actions">
      <button class="btn btn-dark btn-sm" data-modal="reorder">Order again</button>
      <button class="btn btn-ghost btn-sm" data-modal="receipt">Download receipt</button>
      ${canCancel(o) ? `<button class="link-btn danger" data-modal="cancel">Cancel order</button>` : ""}
    </div>`;
}

function openOrderModal(id) {
  openOrderId = id;
  renderOrderModal();
  if (!openOrderId) return;
  $("#orderModal").classList.remove("hidden");
  syncScroll();
  $("#orderModalClose").focus();
}
function closeOrderModal() {
  openOrderId = null;
  $("#orderModal").classList.add("hidden");
  syncScroll();
}

/* ---------- Orders: actions ---------- */
function reorder(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  let added = 0, skipped = 0;
  o.items.forEach(i => {
    if (foods.some(f => f.id === i.id)) { if (addToCart(i.id, i.qty)) added += i.qty; } else skipped++;
  });
  if (!added) { showToast("Those dishes aren't on the menu right now."); return; }
  persistCart();
  closeOrderModal();
  openCart();
  showToast(skipped ? `Added ${plural(added, "item")} (${skipped} unavailable). Prices are today's menu prices.` : `Added ${plural(added, "item")} from #${id}`);
}

function cancelOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o || !canCancel(o)) { showToast("This order can no longer be cancelled."); return; }
  if (!confirm(`Cancel order #${id}?`)) return;
  o.cancelledAt = Date.now();
  o.notified = "cancelled";
  save(STORE.orders, orders);
  renderOrders();
  if (openOrderId === id) renderOrderModal();
  showToast(`Order #${id} cancelled.`);
}

function rateOrder(stars_) {
  const o = orders.find(x => x.id === openOrderId);
  if (!o || statusOf(o).key !== "delivered") return;
  o.rating = { stars: stars_, at: Date.now() };
  save(STORE.orders, orders);
  renderOrders();
  renderOrderModal();
  showToast("Thanks for rating your order!");
}

function downloadReceipt(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  const p = o.pricing, line = "-".repeat(44);
  const rows = o.items.map(i => `${(i.qty + " x " + i.name).padEnd(30)}${money(i.price * i.qty).padStart(14)}`);
  const txt = [
    "CRAVEKART — RECEIPT (DEMO)", line,
    `Order:   #${o.id}`, `Placed:  ${fmtDate(o.createdAt)}`, `Status:  ${statusOf(o).label}`, line,
    ...rows, line,
    `${"Subtotal".padEnd(30)}${money(p.subtotal).padStart(14)}`,
    `${"Delivery fee".padEnd(30)}${(p.fee ? money(p.fee) : "FREE").padStart(14)}`,
    ...(p.discount ? [`${("Discount (" + p.coupon + ")").padEnd(30)}${("-" + money(p.discount)).padStart(14)}`] : []),
    `${"GST (5%)".padEnd(30)}${money(p.tax).padStart(14)}`,
    `${"TOTAL".padEnd(30)}${money(p.total).padStart(14)}`, line,
    `Payment: ${o.payment}`, `Deliver to: ${o.customer.name}, ${o.customer.phone}`, o.customer.address,
    ...(o.customer.notes ? [`Note: ${o.customer.notes}`] : []),
    "", "This is a demo receipt. No payment was collected."
  ].join("\n");
  const url = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `CraveKart-${o.id}.txt` });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Checkout ---------- */
function openCheckout() {
  const rows = cartRows();
  const p = calcPricing(rows, activeCoupon);
  $("#checkoutSummary").innerHTML =
    rows.map(({ food, qty }) => `<div><span>${qty}× ${esc(food.name)}</span><b>${money(food.price * qty)}</b></div>`).join("") +
    `<div class="sum-total"><span>Total (incl. GST${p.discount ? ", " + p.coupon + " applied" : ""}${p.fee ? "" : ", free delivery"})</span><b>${money(p.total)}</b></div>`;
  const prof = load(STORE.profile, null);
  const f = $("#checkoutForm");
  if (prof) { f.name.value = prof.name || ""; f.phone.value = prof.phone || ""; f.address.value = prof.address || ""; }
  $("#formError").textContent = "";
  $("#checkoutModal").classList.remove("hidden");
  syncScroll();
  f.name.focus();
}
function closeCheckout() {
  $("#checkoutModal").classList.add("hidden");
  syncScroll();
}
function resetCheckoutView() {
  $("#checkoutFormWrap").classList.remove("hidden");
  $("#successState").classList.add("hidden");
  $("#checkoutForm").reset();
}

function validateCheckout(d) {
  if (d.name.length < 2) return "Enter your full name.";
  const digits = d.phone.replace(/\D/g, "");
  if (!/^[0-9+() -]+$/.test(d.phone) || digits.length < 10 || digits.length > 13) return "Enter a valid phone number (10 digits).";
  if (d.address.length < 10) return "Enter a complete delivery address (house, street, area, city).";
  return "";
}

function placeOrder(form) {
  const fd = new FormData(form);
  const d = {
    name: String(fd.get("name") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    address: String(fd.get("address") || "").trim(),
    notes: String(fd.get("notes") || "").trim()
  };
  const err = validateCheckout(d);
  $("#formError").textContent = err;
  if (err) return;
  const rows = cartRows();
  if (!rows.length) { closeCheckout(); return; }

  const pricing = calcPricing(rows, activeCoupon);
  const order = {
    id: newOrderId(),
    createdAt: Date.now(),
    items: rows.map(({ food, qty }) => ({ id: food.id, name: food.name, price: food.price, qty, image: food.image, veg: food.veg })),
    customer: d,
    payment: String(fd.get("payment") || "Cash on delivery"),
    pricing,
    notified: "placed",
    rating: null
  };
  orders.unshift(order);
  if (!save(STORE.orders, orders)) { orders.shift(); return; }
  if (fd.get("remember")) save(STORE.profile, { name: d.name, phone: d.phone, address: d.address });
  else try { localStorage.removeItem(STORE.profile); } catch { /* ignore */ }

  lastPlacedId = order.id;
  cart = {};
  activeCoupon = null;
  $("#couponInput").value = "";
  setCouponMessage("");
  persistCart();
  orderFilter = "all"; orderQuery = ""; ordersShown = ORDERS_PAGE_SIZE;
  $("#orderSearch").value = "";
  document.querySelectorAll("#orderFilters .category").forEach(x => x.classList.toggle("active", x.dataset.filter === "all"));
  renderOrders();

  $("#successMessage").textContent =
    `Thanks, ${d.name}! Order #${order.id} (${money(pricing.total)}) is saved in your order history. No payment was collected and no restaurant was notified — this is a demo.`;
  $("#checkoutFormWrap").classList.add("hidden");
  $("#successState").classList.remove("hidden");
}

/* ---------- Events ---------- */
grid.addEventListener("click", e => {
  const b = e.target.closest("[data-add]");
  if (!b) return;
  if (addToCart(b.dataset.add)) { persistCart(); showToast("Added to your order!"); }
});
$("#cartItems").addEventListener("click", e => {
  const b = e.target.closest("[data-qty]");
  if (!b) return;
  const id = b.dataset.qty, change = Number(b.dataset.change);
  if (change > 0) { if (!addToCart(id)) return; }
  else { cart[id] = (cart[id] || 0) - 1; if (cart[id] <= 0) delete cart[id]; }
  persistCart();
});
$("#categories").addEventListener("click", e => {
  const b = e.target.closest("[data-category]");
  if (!b) return;
  activeCategory = b.dataset.category;
  document.querySelectorAll("#categories .category").forEach(x => x.classList.toggle("active", x === b));
  renderMenu();
});
$("#searchInput").addEventListener("input", renderMenu);
$("#sortSelect").addEventListener("change", renderMenu);
$("#vegOnly").addEventListener("change", renderMenu);
$("#resetFilters").addEventListener("click", () => {
  activeCategory = "All";
  $("#searchInput").value = "";
  $("#vegOnly").checked = false;
  $("#sortSelect").value = "popular";
  document.querySelectorAll("#categories .category").forEach(x => x.classList.toggle("active", x.dataset.category === "All"));
  renderMenu();
});
$("#searchToggle").addEventListener("click", () => {
  $("#menu").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#searchInput").focus({ preventScroll: true }), 400);
});

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#applyCoupon").addEventListener("click", () => {
  const code = $("#couponInput").value.trim().toUpperCase();
  const c = COUPONS[code];
  const sub = calcPricing(cartRows(), null).subtotal;
  if (!sub) return setCouponMessage("Add items to your cart first.", true);
  if (!code) return setCouponMessage("Enter a promo code, e.g. YUM10.", true);
  if (!c) { activeCoupon = null; renderCart(); return setCouponMessage(`"${code}" isn't a valid code. Try YUM10 or FIRST50.`, true); }
  if (c.firstOrderOnly && orders.length) { activeCoupon = null; renderCart(); return setCouponMessage(`${code} is only for your first order.`, true); }
  if (sub < c.min) { activeCoupon = null; renderCart(); return setCouponMessage(`Add ${money(c.min - sub)} more to use ${code}.`, true); }
  activeCoupon = code;
  renderCart();
  setCouponMessage(`${code} applied — ${c.label}.`);
});
$("#couponInput").addEventListener("keydown", e => { if (e.key === "Enter") $("#applyCoupon").click(); });

$("#checkoutBtn").addEventListener("click", () => { if (!count()) return; closeCart(); openCheckout(); });
$("#modalClose").addEventListener("click", closeCheckout);
$("#checkoutModal").addEventListener("click", e => { if (e.target === $("#checkoutModal")) closeCheckout(); });
$("#checkoutForm").addEventListener("submit", e => { e.preventDefault(); placeOrder(e.target); });
$("#doneBtn").addEventListener("click", () => { closeCheckout(); resetCheckoutView(); showToast("Thanks for trying CraveKart!"); });
$("#viewOrdersBtn").addEventListener("click", () => {
  closeCheckout(); resetCheckoutView();
  $("#orders").scrollIntoView({ behavior: "smooth" });
  if (lastPlacedId) setTimeout(() => openOrderModal(lastPlacedId), 450);
});

/* Order history */
$("#orderFilters").addEventListener("click", e => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  orderFilter = b.dataset.filter; ordersShown = ORDERS_PAGE_SIZE;
  document.querySelectorAll("#orderFilters .category").forEach(x => x.classList.toggle("active", x === b));
  renderOrders();
});
$("#orderSearch").addEventListener("input", e => { orderQuery = e.target.value; ordersShown = ORDERS_PAGE_SIZE; renderOrders(); });
$("#ordersMore").addEventListener("click", () => { ordersShown += ORDERS_PAGE_SIZE; renderOrders(); });
$("#ordersEmpty").addEventListener("click", e => {
  if (!e.target.closest("#resetOrderFilters")) return;
  orderFilter = "all"; orderQuery = ""; ordersShown = ORDERS_PAGE_SIZE;
  $("#orderSearch").value = "";
  document.querySelectorAll("#orderFilters .category").forEach(x => x.classList.toggle("active", x.dataset.filter === "all"));
  renderOrders();
});
$("#orderList").addEventListener("click", e => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = b.dataset.id;
  if (b.dataset.action === "view") openOrderModal(id);
  if (b.dataset.action === "reorder") reorder(id);
  if (b.dataset.action === "cancel") cancelOrder(id);
});
$("#clearOrders").addEventListener("click", () => {
  if (!orders.length || !confirm("Delete your entire order history from this browser? This can't be undone.")) return;
  orders = [];
  save(STORE.orders, orders);
  renderOrders();
  showToast("Order history cleared.");
});

/* Order detail modal */
$("#orderModalClose").addEventListener("click", closeOrderModal);
$("#orderModal").addEventListener("click", e => { if (e.target === $("#orderModal")) closeOrderModal(); });
$("#orderModalBody").addEventListener("click", e => {
  const rate = e.target.closest("[data-rate]");
  if (rate) return rateOrder(Number(rate.dataset.rate));
  const act = e.target.closest("[data-modal]");
  if (!act) return;
  if (act.dataset.modal === "reorder") reorder(openOrderId);
  if (act.dataset.modal === "receipt") downloadReceipt(openOrderId);
  if (act.dataset.modal === "cancel") cancelOrder(openOrderId);
});

/* Misc */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!$("#orderModal").classList.contains("hidden")) closeOrderModal();
  else if (!$("#checkoutModal").classList.contains("hidden")) closeCheckout();
  else if ($("#cartDrawer").classList.contains("open")) closeCart();
});
$("#newsletterForm").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); showToast("Thanks for subscribing! (Demo)"); });
$("#mobileMenu").addEventListener("click", () => {
  const nav = $(".desktop-nav");
  nav.classList.toggle("show");
  $("#mobileMenu").setAttribute("aria-expanded", nav.classList.contains("show"));
});
document.querySelectorAll(".desktop-nav a").forEach(a => a.addEventListener("click", () => {
  $(".desktop-nav").classList.remove("show");
  $("#mobileMenu").setAttribute("aria-expanded", "false");
}));

/* Highlight the current section in the nav */
(() => {
  const links = [...document.querySelectorAll(".desktop-nav a")];
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(a => { const s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
})();

/* Keep order statuses moving, and keep other tabs in sync */
setInterval(() => {
  if (!orders.some(isActive) && !orders.some(o => o.notified !== statusOf(o).key)) return;
  syncStatuses(true);
  renderOrders();
  if (openOrderId) renderOrderModal();
}, 5000);
window.addEventListener("storage", e => {
  if (e.key === STORE.orders) { orders = sanitizeOrders(load(STORE.orders, [])); renderOrders(); if (openOrderId) renderOrderModal(); }
  if (e.key === STORE.cart) { cart = sanitizeCart(load(STORE.cart, {})); renderCart(); }
});

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
syncStatuses(false);
renderMenu();
renderCart();
renderOrders();