import { Product } from "../models/product.js";
import {Cart} from "../models/cart.js"

// Getting all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

// Getting limited products
export const getLimitedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if limit is not provided
    const products = await Product.find().limit(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch limited products." });
  }
};

//Adding a new product.
export const addNewProduct = async (req, res) => {
  try {
    const { title, price, category, description, image, rating } = req.body;

    if (!title || !price || !category || !description || !image || !rating) {
      console.log("Validation failed: Missing fields.");
      return res.status(400).json({ error: "All fields are required." });
    }
    const newProduct = new Product(req.body);

    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    console.error("Error occurred while adding product:", error);
    res.status(500).json({ error: "Error occurred while adding product." });
  }
};

// Getting a single product
export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json();
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Product not found." });
  }
};

//Update a product.
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, image, category } = req.body;

    if (!title || !price || !description || !image || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { title, price, description, image, category },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({ error: "Failed to update product" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error occured while updating the product." });
  }
};

//Delete a product
export const deleteProduct = async (req, res) => {
  try {
     const { id } = req.params;
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json(`Successfully deleted product ${id}`);
  } catch (error) {
    res.status(500).json({ error: "Error while deleting product." });
  }
};

// Add a product to the cart
export const addProductToCart = async (req, res) => {
  try {
    const {userId} = req.params
    const { name, category, quantity, price, description } = req.body;

    // Validate required fields
    if (!name || !category || !quantity || !price || !description) {
      return res.status(400).json({ error: "All fields (name, category, quantity, price, description) are required." });
    }

    // Find the cart for the current user (assumed based on the URL or other middleware)
    let cart = await Cart.findOne(); // Adjust if you have a specific method to identify the user's cart

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({ products: [] });
    }

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(p => p.name === name && p.category === category);

    if (productIndex > -1) {
      // If the product exists, update the quantity
      cart.products[productIndex].quantity += quantity;
    } else {
      // Add a new product to the cart
      cart.products.push({ name, category, quantity, price, description });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart successfully.", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the product to the cart." });
  }
};
