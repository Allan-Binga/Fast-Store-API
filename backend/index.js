import express from "express";
import productRoute from "./routes/product.js";
import usersRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import checkoutRoute from "./routes/checkout.js";
import cartRoute from "./routes/cart.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(express.json());

//COOKIE PARSER
app.use(cookieParser());

//CORS IMPLEMENTATION
app.use(
  cors({
    origin: "http://localhost:3000", //Frontend Port
    credentials: true,
  })
);

main().catch((err) => console.log(err));
//DB CONNECTION
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected successfully.");
}

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
