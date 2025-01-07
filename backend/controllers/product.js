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

//Add a product to cart
export const addProductToCart = async (req, res) => {
  try {
      const { userId, productId, quantity, price } = req.body;

      if (!userId || !productId || !quantity || !price) {
          return res.status(400).json({ error: "All fields are required." });
      }

      // Find the user's cart or create a new one
      let cart = await Cart.findOne({ userId });

      if (!cart) {
          cart = new Cart({ userId, products: [] });
      }

      // Add product to the cart
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

      if (productIndex > -1) {
          // If product already exists in cart, update quantity
          cart.products[productIndex].quantity += quantity;
      } else {
          // Add new product to the cart
          cart.products.push({ productId, quantity, price });
      }

      await cart.save();
      res.status(200).json({ message: "Product added to cart.", cart });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while adding the product to the cart." });
  }
};