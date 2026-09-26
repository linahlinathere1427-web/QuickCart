// ===================================================================
// QuickCart demo script - shared by BOTH index.html and checkout.html
//
// Every function checks whether its elements exist on the current page
// before wiring up listeners, so this one file safely runs on either
// page without throwing errors for elements that don't exist there.
// ===================================================================

// ---------- Step 1: Text-to-speech helper ----------
// Uses the browser's BUILT-IN Web Speech API. Works fully offline.

function speak(text) {
if (!("speechSynthesis" in window)) {
console.log("Speech synthesis not supported in this browser.");
return;
}
window.speechSynthesis.cancel();
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1;
utterance.pitch = 1;
utterance.volume = 1;
window.speechSynthesis.speak(utterance);
logActivity(text);
}

// Separate function so recaps don't get logged back into the log
function speakSummary(text) {
if (!("speechSynthesis" in window)) return;
window.speechSynthesis.cancel();
const utterance = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(utterance);
}

// ---------- Step 2: "What Did I Miss?" activity log ----------

const activityLog = [];
let lastCheckedIndex = 0;

function logActivity(text) {
const time = new Date().toLocaleTimeString();
activityLog.push({ text: text, time: time });
}

// ---------- Step 3: Cart storage (shared between pages via localStorage) ----------
// Page One saves to this whenever an item is added or a discount applied.
// Page Two reads from it to build the order summary. This keeps the
// demo working across separate HTML pages without a real backend.

const CART_STORAGE_KEY = "quickcart_cart_v1";
const DISCOUNT_AMOUNT = 30; // AED

function loadCart() {
try {
const raw = localStorage.getItem(CART_STORAGE_KEY);
if (!raw) return { items: [], discountApplied: false };
const parsed = JSON.parse(raw);
return {
items: Array.isArray(parsed.items) ? parsed.items : [],
discountApplied: !!parsed.discountApplied
};
} catch (e) {
return { items: [], discountApplied: false };
}
}

function saveCart(cart) {
try {
localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
} catch (e) {
console.log("Could not save cart:", e);
}
}

function calculateSubtotal(items) {
return items.reduce(function (sum, item) { return sum + item.price; }, 0);
}

function calculateTotal(cart) {
const subtotal = calculateSubtotal(cart.items);
return cart.discountApplied ? Math.max(subtotal - DISCOUNT_AMOUNT, 0) : subtotal;
}

// Shared state used when speaking recaps on either page
let itemsInCart = 0;
let currentTotal = 0;
let discountApplied = false;

function syncStateFromCart() {
const cart = loadCart();
itemsInCart = cart.items.length;
currentTotal = calculateTotal(cart);
discountApplied = cart.discountApplied;
return cart;
}

// ===================================================================
// PAGE ONE: Product grid, cart, discount
// ===================================================================

const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartMessage = document.getElementById("cartMessage");
const applyDiscountBtn = document.getElementById("applyDiscountBtn");

function renderCartSummary() {
if (!cartCount || !cartTotal) return;
cartCount.textContent = "Cart: " + itemsInCart + " item" + (itemsInCart === 1 ? "" : "s");
cartTotal.textContent = "Total: AED " + currentTotal;
}

// If we're on the shop page, load whatever is already in the cart
// (e.g. if the user came back from checkout) and show it.
if (cartCount) {
syncStateFromCart();
renderCartSummary();
}

// Add to Cart - works for any number of products via data attributes
const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
addToCartButtons.forEach(function (btn) {
btn.addEventListener("click", function () {
const productName = btn.getAttribute("data-product");
const price = parseInt(btn.getAttribute("data-price"), 10);

const cart = loadCart();
cart.items.push({ name: productName, price: price });
saveCart(cart);

syncStateFromCart();
renderCartSummary();

cartMessage.textContent = productName + " added to cart";
speak(productName + " added to cart");
});
});

// Apply Discount
if (applyDiscountBtn) {
applyDiscountBtn.addEventListener("click", function () {
const discountMessage = document.getElementById("discountMessage");
const cart = loadCart();

if (cart.discountApplied) {
discountMessage.textContent = "Discount already applied";
speak("Discount already applied");
return;
}
if (cart.items.length === 0) {
discountMessage.textContent = "Add an item to the cart first";
speak("Add an item to the cart first");
return;
}

cart.discountApplied = true;
saveCart(cart);
syncStateFromCart();
renderCartSummary();

discountMessage.textContent = "Discount applied: AED " + DISCOUNT_AMOUNT;
speak("Discount applied. AED " + DISCOUNT_AMOUNT + " off. New total AED " + currentTotal);
});
}

// ===================================================================
// PAGE TWO: Order summary, delivery details, payment, checkout flow
// ===================================================================

const orderSummaryContent = document.getElementById("orderSummaryContent");

if (orderSummaryContent) {
const cart = syncStateFromCart();

if (cart.items.length === 0) {
orderSummaryContent.innerHTML =
'<p class="empty-cart-message">Your cart is empty. <a href="index.html">Go back to shop</a>.</p>';
} else {
let html = '<ul class="order-summary-list">';
cart.items.forEach(function (item) {
html += "<li><span>" + item.name + "</span><span>AED " + item.price + "</span></li>";
});
html += "</ul>";
if (cart.discountApplied) {
html += '<p class="order-summary-line">Discount: -AED ' + DISCOUNT_AMOUNT + "</p>";
}
html += '<p class="order-summary-total">Total: AED ' + currentTotal + "</p>";
orderSummaryContent.innerHTML = html;
}
}

// ---------- Delivery details: phone + dependent country/state dropdowns ----------

const phoneNumberInput = document.getElementById("phoneNumber");
const deliveryCountrySelect = document.getElementById("deliveryCountry");
const deliveryStateSelect = document.getElementById("deliveryState");

const COUNTRY_STATE_DATA = {
"United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
"Saudi Arabia": ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir"],
"Other": ["Not applicable"]
};

if (deliveryCountrySelect && deliveryStateSelect) {
// Fill the country dropdown from the data above
Object.keys(COUNTRY_STATE_DATA).forEach(function (country) {
const option = document.createElement("option");
option.value = country;
option.textContent = country;
deliveryCountrySelect.appendChild(option);
});

// Fill the state/emirate dropdown to match whichever country is selected
function populateStates(country) {
deliveryStateSelect.innerHTML = "";
const states = COUNTRY_STATE_DATA[country] || [];
states.forEach(function (state) {
const option = document.createElement("option");
option.value = state;
option.textContent = state;
deliveryStateSelect.appendChild(option);
});
}

populateStates(deliveryCountrySelect.value); // set it up for the default country

deliveryCountrySelect.addEventListener("change", function () {
populateStates(deliveryCountrySelect.value);
});

deliveryStateSelect.addEventListener("change", function () {
speak("Delivery location set to " + deliveryStateSelect.value + ", " + deliveryCountrySelect.value);
});
}

if (phoneNumberInput) {
phoneNumberInput.addEventListener("blur", function () {
if (phoneNumberInput.value.trim() !== "") {
speak("Phone number saved");
}
});
}

// ---------- Payment fields ----------

const cardholderNameInput = document.getElementById("cardholderName");
const cardNumberInput = document.getElementById("cardNumber");
const expiryDateInput = document.getElementById("expiryDate");
const cvvInput = document.getElementById("cvv");
const pinInput = document.getElementById("pin");

// Announce once (not per field) that card details have been entered -
// this never speaks or logs the actual numbers.
let cardDetailsAnnounced = false;
function announceCardDetailsIfComplete() {
if (cardDetailsAnnounced) return;
if (cardNumberInput && cvvInput && pinInput &&
cardNumberInput.value.trim() && cvvInput.value.trim() && pinInput.value.trim()) {
cardDetailsAnnounced = true;
speak("Payment card details entered");
}
}
if (cardNumberInput) cardNumberInput.addEventListener("blur", announceCardDetailsIfComplete);
if (cvvInput) cvvInput.addEventListener("blur", announceCardDetailsIfComplete);
if (pinInput) pinInput.addEventListener("blur", announceCardDetailsIfComplete);

// ---------- "Proceed to Payment" button ----------

const proceedToPaymentBtn = document.getElementById("proceedToPaymentBtn");
const statusMessage = document.getElementById("statusMessage");

if (proceedToPaymentBtn) {
proceedToPaymentBtn.addEventListener("click", function () {
statusMessage.className = "";

const rawCardNumber = cardNumberInput.value.replace(/\s+/g, "");
const last4 = rawCardNumber.length >= 4 ? rawCardNumber.slice(-4) : null;
const cardSuffix = last4 ? " with card ending " + last4 : "";

statusMessage.textContent = "Processing payment" + cardSuffix + "...";
statusMessage.classList.add("status-processing");
speak("Processing payment" + cardSuffix);

setTimeout(function () {
statusMessage.textContent = "Verifying payment...";
statusMessage.className = "";
statusMessage.classList.add("status-verifying");
speak("Verifying payment");

setTimeout(function () {
statusMessage.textContent = "Payment failed";
statusMessage.className = "";
statusMessage.classList.add("status-failed");
speak("Payment failed");
}, 1500);
}, 1500);
});
}

// ===================================================================
// FINGERPRINT-GATED SENSITIVE READOUT (checkout page only)
//
// NOTE: this is a SIMULATED fingerprint check for demo purposes.
// A website cannot verify a real fingerprint by itself - genuine
// biometric verification happens at the OS/device level (e.g. via
// the WebAuthn API, which can trigger the real fingerprint/Face ID
// prompt on a supported device). This mock demonstrates the
// interaction pattern - gating sensitive data behind a biometric
// check - without claiming to be production-grade security.
// ===================================================================

const fingerprintModal = document.getElementById("fingerprintModal");
const scanFingerprintBtn = document.getElementById("scanFingerprintBtn");
const cancelFingerprintBtn = document.getElementById("cancelFingerprintBtn");
const fingerprintStatus = document.getElementById("fingerprintStatus");

function openFingerprintModal() {
fingerprintModal.classList.remove("hidden", "scanning", "success");
fingerprintStatus.textContent = "Tap the fingerprint to scan";
scanFingerprintBtn.focus();
}

function closeFingerprintModal() {
fingerprintModal.classList.add("hidden");
fingerprintModal.classList.remove("scanning", "success");
}

if (scanFingerprintBtn) {
scanFingerprintBtn.addEventListener("click", function () {
fingerprintModal.classList.add("scanning");
fingerprintStatus.textContent = "Scanning...";
speakSummary("Scanning fingerprint");

setTimeout(function () {
fingerprintModal.classList.remove("scanning");
fingerprintModal.classList.add("success");
fingerprintStatus.textContent = "Fingerprint verified";

setTimeout(function () {
speakSensitivePaymentDetails();
closeFingerprintModal();
logActivity("Card details read after fingerprint verification");
}, 900);
}, 1800);
});
}

if (cancelFingerprintBtn) {
cancelFingerprintBtn.addEventListener("click", function () {
closeFingerprintModal();
speakSummary("Okay, card details were not read.");
logActivity("Card detail readout cancelled");
});
}

// Reads card number, CVV, and PIN digit by digit so speech is clear
function speakSensitivePaymentDetails() {
const cardNumber = cardNumberInput.value.trim();
const cvv = cvvInput.value.trim();
const pin = pinInput.value.trim();

const parts = [];
if (cardNumber) {
parts.push("Card number: " + spaceOutDigits(cardNumber));
} else {
parts.push("No card number has been entered");
}
if (cvv) parts.push("C V V: " + spaceOutDigits(cvv));
if (pin) parts.push("Transaction pin: " + spaceOutDigits(pin));

speak(parts.join(". ") + ".");
}

function spaceOutDigits(value) {
return value.replace(/\s+/g, "").split("").join(" ");
}

// ===================================================================
// "WHAT DID I MISS?" (both pages)
//
// On checkout.html, if card details have been entered, this button
// now ALSO opens the fingerprint modal after the recap, so the bank
// details themselves stay gated behind a fingerprint check.
// ===================================================================

const whatDidIMissBtn = document.getElementById("whatDidIMissBtn");
const missedSummaryPanel = document.getElementById("missedSummaryPanel");
const missedSummaryText = document.getElementById("missedSummaryText");
const closeMissedPanelBtn = document.getElementById("closeMissedPanelBtn");

if (whatDidIMissBtn) {
whatDidIMissBtn.addEventListener("click", function () {
const newItems = activityLog.slice(lastCheckedIndex);
let summary;

if (newItems.length === 0) {
summary = "You're all caught up. Nothing has changed.";
} else {
const spokenParts = newItems.map(function (item) {
return "At " + item.time + ", " + item.text + ".";
});
summary =
"You missed " + newItems.length + " change" + (newItems.length > 1 ? "s" : "") +
". " + spokenParts.join(" ");
}

missedSummaryText.textContent = summary;
missedSummaryPanel.classList.remove("hidden");
speakSummary(summary);
lastCheckedIndex = activityLog.length;

// Only relevant on the checkout page, and only if card details exist
const onCheckoutPage = !!fingerprintModal;
const hasCardDetails = cardNumberInput && cardNumberInput.value.trim() !== "";

if (onCheckoutPage && hasCardDetails) {
setTimeout(openFingerprintModal, 700);
}
});
}

if (closeMissedPanelBtn) {
closeMissedPanelBtn.addEventListener("click", function () {
missedSummaryPanel.classList.add("hidden");
});
}