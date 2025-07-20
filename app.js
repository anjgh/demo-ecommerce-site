// An array of product objects
// Each product has a name, price, and image
const products = [
{
    name: "Product 1",
    price: 25.00,
    image: 'product1.jpg'
},
{
    name: "Product 2",
    price: 40.00,
    image: "product2.jpg"
},
{
    name: "Product 3",
    price: 60.00,
    image: "product3.jpg"
},
{
    name: "Product 4",
    price: 75.00,
    image: "product4.jpg"
}
];


// productGrid grabs HTML element with id "featured-products"
// cart is an array to hold items added to the cart
// total keeps track of the total price of items in the cart
const productGrid = document.getElementById("featured-products");
const cart = [];
let total = 0;


// Loops through each product in the products array
// Creates a new div element for each product named col to use Bootstrap's grid system
function loadProducts() {
  products.forEach(product => {
    const col = document.createElement("div");

    // Sets the class name for the column div
    col.className = "col";

    // col.innerHTML injects HTML content into the column
    // It includes an image, product name, price, and an "Add to Cart" button
    col.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">$${product.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart" data-name="${product.name}" data-price="${product.price}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    // Appends the column div to the productGrid element
    productGrid.appendChild(col);
  });
    // After loading products, the function attachCartListerners is called to make the buttons functional
   attachCartListeners();
}  


// For each buttons with class "add-to-cart", an event listener is added
// When clicked, it retrieves the product name and price from the button's data attributes  
// Adds the product to the cart array and updates the total price
function attachCartListeners() {
    // Selects all buttons with the class "add-to-cart"
  document.querySelectorAll(".add-to-cart").forEach(button => {

    // Adds a click event listener to each button
    // When clicked, it retrieves the product name and price from the button's data attributes
    button.addEventListener("click", function () {
        const name = this.getAttribute("data-name");
        const price = parseFloat(this.getAttribute("data-price"));
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

      // Updates the total price and the cart display   
      total += price;
      updateCartDisplay();

      // Show the cart panel after adding item
      const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById("cartPanel"));
      cartOffcanvas.show();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Attach event listener to the checkout button
  // When clicked, it calls the handleCheckout function to initiate the Stripe checkout process
  document.getElementById("checkout-button").addEventListener("click", handleCheckout);

  // Initial cart display
  updateCartDisplay();
});

// Finds element with id "cart-summary"
function updateCartDisplay() {
  const cartSummary = document.getElementById("cart-summary");
    if (cart.length === 0) {
        cartSummary.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    // Build cart items HTML
    let html = "<ul>";
    cart.forEach(item => {
        html += `<li>${item.name} - $${item.price} x ${item.quantity}</li>`;
    });
    html += "</ul>";

    // Add total price
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    html += `<p>Total: $${total.toFixed(2)}</p>`;

    cartSummary.innerHTML = html;
}

// Calls the loadProducts function to populate the featured products section
loadProducts();


async function handleCheckout() {
  try {
    const response = await fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cartItems: cart })
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout failed. Please try again.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Error connecting to server.");
  }
}
