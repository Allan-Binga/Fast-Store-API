import express from "express";
import productRoute from "./routes/product.js";
import cartRoute from "./routes/cart.js";
import usersRoute from "./routes/users.js";
import authRoute from "./routes/auth.js"
import checkoutRoute from "./routes/checkout.js"
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"

dotenv.config();

const app = express();
app.use(express.json());

//CORS IMPLEMENTATION
app.use(cors({
  origin: "http://localhost:3000" //Frontend Port
}))


main().catch((err) => console.log(err))
//DB CONNECTION
async function main() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log("Database connected successfully.")
}

//Auth Route
app.use("/api/auth", authRoute)

//Product Route
app.use("/api/products", productRoute);

//Cart Route
app.use("/api/carts", cartRoute);

//Users Route
app.use("/api/users", usersRoute);

//Stripe Checkout Route
app.use("/api/checkout", checkoutRoute)

app.listen("5500", () => {
  console.log("Backend up and running.");
});
