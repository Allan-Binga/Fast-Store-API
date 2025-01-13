const express = require("express");
const productRoute = require("./routes/product.js");
const usersRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const checkoutRoute = require("./routes/checkout.js");
const cartRoute = require("./routes/cart.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
app.use(express.json());

//COOKIE PARSER
app.use(cookieParser());

//CORS IMPLEMENTATION
app.use(
  cors({
    origin: "https://e401-102-0-13-198.ngrok-free.app", //Frontend Port
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

//Cart Route
app.use("/api/cart", cartRoute);

//Users Route
app.use("/api/users", usersRoute);

//Stripe Checkout Route
app.use("/api/checkout", checkoutRoute);

app.listen("5500", () => {
  console.log("Backend up and running.");
});
