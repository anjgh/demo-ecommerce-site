require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

const path = require("path");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());


app.use(express.static(path.join(__dirname, "public")));
app.get("/",(req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});  

app.post("/create-checkout-session", async (req, res) => {
  try {
    const items = req.body.cartItems;

    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100), // Convert to cents
        product_data: {
          name: item.name,
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
