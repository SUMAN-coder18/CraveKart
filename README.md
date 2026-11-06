# CraveKart — Food ordering website

A responsive front-end food ordering app built with plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it
1. Open `index.html` in a browser, or
2. Open the folder in VS Code and start the **Live Server** extension.

## Features
**Menu**
- Category filters (Pizza, Burgers, Pasta, Asian, Sides, Desserts, Drinks), live search, sorting
- Veg / non-veg markers and a "Veg only" filter

**Cart & checkout**
- Add to cart, quantity controls (max 20 per item), cart saved in `localStorage`
- Price breakdown: subtotal, delivery fee (free over ₹499), discount, 5% GST, total
- "Add ₹X more for free delivery" hint
- Promo codes: `YUM10` (10% off, up to ₹100) and `FIRST50` (₹50 off a first order, min ₹199)
- Checkout form with validation, optional delivery instructions, payment choice (demo), and "remember my details"

**Order history (new)**
- Every placed order is saved with a snapshot of items, prices, customer details, payment and price breakdown
- "Your orders" section: totals (orders placed, total spent, most ordered dish), filters (All / In progress / Delivered / Cancelled), search by order ID or dish, "Show more" paging
- Order details: status timeline, itemised bill, delivery and payment info
- Order again (adds the items back to the cart), cancel (while placed or preparing), rate delivered orders (1–5 stars)
- Download a text receipt, clear history
- Live order badge in the header, status toasts, and cross-tab sync

**Quality**
- All user-entered text is HTML-escaped before display
- Stored data is validated on load, so corrupted `localStorage` can't break the page
- Keyboard support (Esc closes dialogs, visible focus), ARIA labels, reduced-motion support
- Responsive down to small phones

## How order tracking works (demo)
There is no server, so status is simulated from the time an order was placed. Edit `STAGES` in `script.js` to change the timing:

| Status | After |
|---|---|
| Order placed | 0 s |
| Preparing | 30 s |
| Out for delivery | 2 min |
| Delivered | 4 min |

## Data storage
Everything is stored in your browser under these keys, and is not shared between devices or browsers:
`CraveKart-cart`, `CraveKart-orders`, `CraveKart-profile`.

## Project structure
```
CraveKart/
├── index.html   markup, cart drawer, checkout and order dialogs
├── style.css    styles (original design + order history additions)
├── script.js    menu, cart, checkout, order history and tracking
└── README.md
```

## Important
This is a front-end demonstration only. Checkout does not send orders to a restaurant, process payments, validate delivery addresses, or store data on a server. A production system needs a backend/API, database, authentication, a secure payment gateway, order management and delivery integration. Product photos load from Unsplash and fonts from Google Fonts, so an internet connection is needed for those.

## Ideas for next steps
- Node/Express (or similar) API with a database for users, orders and menu items
- User accounts so order history follows the customer across devices
- Real payment gateway (e.g. Razorpay) and real-time tracking via WebSockets
- Saved addresses, favourites, restaurant admin dashboard