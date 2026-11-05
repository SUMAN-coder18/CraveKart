const foods = [
 {id:1,name:"Margherita Pizza",category:"Pizza",price:249,rating:4.9,tag:"Bestseller",desc:"Classic mozzarella, basil & rich tomato.",image:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700&auto=format&fit=crop&q=80"},
 {id:2,name:"Smoky BBQ Burger",category:"Burgers",price:219,rating:4.8,tag:"Fan favourite",desc:"Grilled patty, smoky BBQ & crunchy lettuce.",image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80"},
 {id:3,name:"Creamy Alfredo Pasta",category:"Asian",price:279,rating:4.7,tag:"Chef's pick",desc:"Silky white sauce, herbs & parmesan.",image:"https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=700&auto=format&fit=crop&q=80"},
 {id:4,name:"Loaded Cheese Fries",category:"Sides",price:149,rating:4.8,tag:"Popular",desc:"Golden fries with cheese & a little spice.",image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700&auto=format&fit=crop&q=80"},
 {id:5,name:"Farmhouse Pizza",category:"Pizza",price:329,rating:4.9,tag:"Veg favourite",desc:"Fresh veggies, olives & mozzarella.",image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80"},
 {id:6,name:"Crispy Chicken Burger",category:"Burgers",price:239,rating:4.7,tag:"Crunchy",desc:"Crispy chicken, house sauce & pickles.",image:"https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=700&auto=format&fit=crop&q=80"},
 {id:7,name:"Veg Hakka Noodles",category:"Asian",price:189,rating:4.6,tag:"Street style",desc:"Wok-tossed noodles with garden vegetables.",image:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700&auto=format&fit=crop&q=80"},
 {id:8,name:"Chocolate Brownie",category:"Desserts",price:129,rating:4.9,tag:"Sweet treat",desc:"Warm, fudgy chocolate indulgence.",image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&auto=format&fit=crop&q=80"},
 {id:9,name:"Classic Pancakes",category:"Desserts",price:179,rating:4.7,tag:"New",desc:"Fluffy pancakes with maple-style syrup.",image:"https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=700&auto=format&fit=crop&q=80"},
 {id:10,name:"Mango Cooler",category:"Drinks",price:99,rating:4.6,tag:"Refreshing",desc:"A chilled tropical mango drink.",image:"https://images.unsplash.com/photo-1546173159-315724a31696?w=700&auto=format&fit=crop&q=80"},
 {id:11,name:"Garden Fresh Salad",category:"Sides",price:169,rating:4.5,tag:"Fresh pick",desc:"Crisp greens, cucumber & house dressing.",image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80"},
 {id:12,name:"Iced Coffee",category:"Drinks",price:119,rating:4.8,tag:"Chilled",desc:"Smooth coffee poured over ice.",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&auto=format&fit=crop&q=80"}
];

const $ = s => document.querySelector(s);
const grid = $("#foodGrid");
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("CraveKart-cart") || "{}");
let discountApplied = false;
let toastTimer;

function money(n){return "₹"+Math.round(n).toLocaleString("en-IN")}
function renderMenu(){
 let list = foods.filter(f => (activeCategory==="All" || f.category===activeCategory) && (f.name+" "+f.desc+" "+f.category).toLowerCase().includes($("#searchInput").value.toLowerCase()));
 const sort=$("#sortSelect").value;
 if(sort==="low") list.sort((a,b)=>a.price-b.price);
 if(sort==="high") list.sort((a,b)=>b.price-a.price);
 if(sort==="rating") list.sort((a,b)=>b.rating-a.rating);
 $("#resultCount").textContent=`Showing ${list.length} delicious ${list.length===1?"pick":"picks"}`;
 grid.innerHTML=list.map(f=>`<article class="food-card"><div class="food-photo"><img src="${f.image}" alt="${f.name}" loading="lazy"><span class="food-tag">${f.tag}</span></div><div class="food-info"><div class="food-title-row"><h3>${f.name}</h3><span class="rating">★ ${f.rating}</span></div><p class="food-desc">${f.desc}</p><div class="food-bottom"><span class="food-price">${money(f.price)}</span><button class="add-btn" data-add="${f.id}">＋ Add</button></div></div></article>`).join("");
 $("#emptyState").classList.toggle("hidden",list.length!==0);
 grid.classList.toggle("hidden",list.length===0);
}
function persist(){localStorage.setItem("CraveKart-cart",JSON.stringify(cart));renderCart()}
function count(){return Object.values(cart).reduce((n,q)=>n+q,0)}
function cartRows(){return Object.entries(cart).map(([id,qty])=>({food:foods.find(f=>f.id===Number(id)),qty})).filter(x=>x.food)}
function subtotal(){return cartRows().reduce((s,x)=>s+x.food.price*x.qty,0)}
function renderCart(){
 const rows=cartRows(), n=count(), sub=subtotal(), fee=n? (sub>=499?0:29):0, discount=discountApplied?Math.min(Math.round(sub*.1),100):0;
 $("#cartCount").textContent=n;$("#drawerCount").textContent=`(${n})`;
 $("#cartItems").innerHTML=rows.length?rows.map(({food,qty})=>`<div class="cart-item"><img src="${food.image}" alt="${food.name}"><div class="cart-item-main"><strong>${food.name}</strong><small>${money(food.price)} each</small><div class="qty-control"><button data-qty="${food.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-qty="${food.id}" data-change="1" aria-label="Increase quantity">+</button></div></div><div class="cart-item-price">${money(food.price*qty)}</div></div>`).join(""):`<div class="cart-empty"><span>🛍️</span><h3>Your cart is looking hungry</h3><p>Add something delicious from the menu.</p></div>`;
 $("#cartBottom").classList.toggle("hidden",!n);
 $("#subtotal").textContent=money(sub);$("#deliveryFee").textContent=fee?money(fee):"FREE";
 $("#discountLine").classList.toggle("hidden",!discount);$("#discount").textContent="−"+money(discount);$("#total").textContent=money(sub+fee-discount);
}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300)}
function openCart(){ $("#cartDrawer").classList.add("open");$("#overlay").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow=""}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=b.dataset.add;cart[id]=(cart[id]||0)+1;discountApplied=false;persist();showToast("Added to your order!")});
$("#cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;cart[id]=(cart[id]||0)+Number(b.dataset.change);if(cart[id]<=0)delete cart[id];persist()});
$("#categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===b));renderMenu()});
$("#searchInput").addEventListener("input",renderMenu);$("#sortSelect").addEventListener("change",renderMenu);
$("#resetFilters").addEventListener("click",()=>{activeCategory="All";$("#searchInput").value="";document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));renderMenu()});
$("#cartOpen").addEventListener("click",openCart);$("#cartClose").addEventListener("click",closeCart);$("#overlay").addEventListener("click",closeCart);
$("#applyCoupon").addEventListener("click",()=>{if($("#couponInput").value.trim().toUpperCase()==="YUM10" && count()){discountApplied=true;renderCart();$("#couponMessage").textContent="YUM10 applied — 10% off (up to ₹100)!";}else{$("#couponMessage").textContent="Enter YUM10 and add items to your cart.";discountApplied=false;renderCart()}});
$("#checkoutBtn").addEventListener("click",()=>{if(!count())return;closeCart();$("#checkoutModal").classList.remove("hidden")});
function closeModal(){$("#checkoutModal").classList.add("hidden")}
$("#modalClose").addEventListener("click",closeModal);$("#checkoutModal").addEventListener("click",e=>{if(e.target===$("#checkoutModal"))closeModal()});
$("#checkoutForm").addEventListener("submit",e=>{e.preventDefault();const data=new FormData(e.target);const orderId="CB"+Math.floor(100000+Math.random()*900000);$("#successMessage").textContent=`Thanks, ${data.get("name")}! Demo order ${orderId} has been recorded in this browser preview. No payment was collected and no restaurant was notified.`;$("#checkoutFormWrap").classList.add("hidden");$("#successState").classList.remove("hidden");cart={};discountApplied=false;persist()});
$("#doneBtn").addEventListener("click",()=>{closeModal();$("#checkoutFormWrap").classList.remove("hidden");$("#successState").classList.add("hidden");$("#checkoutForm").reset();showToast("Thanks for trying CraveKart!")});
$("#newsletterForm").addEventListener("submit",e=>{e.preventDefault();e.target.reset();showToast("Thanks for subscribing! (Demo)")});
$("#mobileMenu").addEventListener("click",()=>$(".desktop-nav").classList.toggle("show"));
document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>$(".desktop-nav").classList.remove("show")));
$("#year").textContent=new Date().getFullYear();
renderMenu();renderCart();