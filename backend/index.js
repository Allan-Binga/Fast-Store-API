const express = require("express");
const productRoute = require("./routes/product.js");
const usersRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const brandRoute = require("./routes/brand.js");
const wishlistRoute = require("./routes/wishlist.js");
const checkoutRoute = require("./routes/checkout.js");
const cartRoute = require("./routes/cart.js");
const flashSaleRoute = require("./routes/flashsales.js");
const addressRoute = require("./routes/address.js");
const webhookRoute = require("./routes/webhook.js");
const orderRoute = require("./routes/orders.js");
const categoryRoute = require("./routes/category.js");
const mailRoute = require("./routes/emailService.js");
const phoneRoute = require("./routes/phoneService.js");
const passwordRoute = require("./routes/password.js");
const promoRoute = require("./routes/promo.js");
const notificationRoute = require("./routes/notification.js")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const path = require("path")

dotenv.config();
const app = express();

//Webhook Route
app.use("/api/webhook", webhookRoute);

app.use(express.json());

//Cookie parser
app.use(cookieParser());

//CORS IMPLEMENTATION
app.use(
  cors({
    origin: "http://localhost:3100", //Frontend Port
    credentials: true,
  })
);

// Serve static files from the "imageUploads" directory
// app.use("/imageUploads", express.static(path.join(__dirname, "imageUploads")));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected successfully.");
}

main().catch((err) => console.log(err));

//Auth Route
app.use("/api/auth", authRoute);

//Mail Route
app.use("/api/verify", mailRoute);

//PhoneRoute
app.use("/api/phone", phoneRoute);

//Product Route
app.use("/api/products", productRoute);

//Category Route
app.use("/api/categories", categoryRoute);

//Flashsale Route
app.use("/api/flashsale", flashSaleRoute);

//Promo Route
app.use("/api/promo", promoRoute);

//Brand Route
app.use("/api/brands", brandRoute);

//Wishlist Route
app.use("/api/wishlist", wishlistRoute);

//Cart Route
app.use("/api/cart", cartRoute);

//Users Route
app.use("/api/users", usersRoute);

//Stripe Checkout Route
app.use("/api/checkout", checkoutRoute);

//Orders Route
app.use("/api/orders", orderRoute);

//Address Route
app.use("/api/address", addressRoute);

//Password Route
app.use("/api/password", passwordRoute);

//Notifications
app.use("/api/notifications", notificationRoute)

app.listen("5500", () => {
  console.log("Backend up and running.");
});
