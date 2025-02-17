const express = require("express");
const productRoute = require("./routes/product.js");
const usersRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const brandRoute = require("./routes/brand.js")
const wishlistRoute = require("./routes/wishlist.js")
const checkoutRoute = require("./routes/checkout.js");
const cartRoute = require("./routes/cart.js");
const flashSaleRoute = require("./routes/flashsales.js")
const addressRoute = require("./routes/address.js")
const webhookRoute = require("./routes/webhook.js")
const orderRoute = require("./routes/orders.js")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

//Webhook Route [Place the webhook route first to avoid `express.json()` parsing]
app.use("/api/webhook", webhookRoute)


app.use(express.json());

//COOKIE PARSER
app.use(cookieParser());

//CORS IMPLEMENTATION
app.use(
  cors({
    origin: "http://localhost:3100", //Frontend Port
    credentials: true,
  })
);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected successfully.");
}

main().catch((err) => console.log(err));

//Auth Route
app.use("/api/auth", authRoute);

//Product Route
app.use("/api/products", productRoute);

//Flashsale Route
app.use("/api/flashsale", flashSaleRoute)

//Brand Route
app.use("/api/brands", brandRoute)

//Wishlist Route
app.use("/api/wishlist", wishlistRoute)

//Cart Route
app.use("/api/cart", cartRoute);

//Users Route
app.use("/api/users", usersRoute);

//Stripe Checkout Route
app.use("/api/checkout", checkoutRoute);

//Orders Route
app.use("/api/orders", orderRoute)

//Address ROute
app.use("/api/address", addressRoute)

app.listen("5500", () => {
  console.log("Backend up and running.");
});
