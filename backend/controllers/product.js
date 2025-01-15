const Product = require("../models/product.js");
const Cart = require("../models/cart");

// Getting all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json("Error fetching products.");
  }
};

// Getting limited products
const getLimitedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if limit is not provided
    const products = await Product.find().limit(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch limited products." });
  }
};

//Adding a new product.
const addNewProduct = async (req, res) => {
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
const getSingleProduct = async (req, res) => {
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
const updateProduct = async (req, res) => {
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
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json(`Successfully deleted product ${id}`);
  } catch (error) {
    res.status(500).json({ error: "Error while deleting product." });
  }
};

// Add a product to the cart
const addProductToCart = async (req, res) => {
  try {
    //EXTRACT
    const userId = req.cookies.storeSession;
    //IF THERE'S NO COOKIE RETURN ERROR WITH STATUS 401.
    if (!userId) {
      return res.status(401).json({ error: "Please log in first." });
    }

    const { products } = req.body; // Expect an array of products in the request body

    // Validate the request body
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: "Products must be an array with at least one product.",
      });
    }

    // Validate each product in the array
    for (const product of products) {
      const { title, category, price, quantity, description, image } = product;
      //VALIDATE FIELDS
      if (
        !title ||
        !category ||
        !price ||
        !quantity ||
        !description ||
        !image
      ) {
        return res.status(400).json({
          error:
            "Each product must include title, category, price, quantity, description, and image.",
        });
      }
    }

    // Find the cart for the current user (assumed based on the URL or other middleware)
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({ userId, products: [] });
    }

     // Iterate over the products array and add/update each product in the cart
     for (const product of products) {
      const { title, category, price, quantity, description, image } = product;

      // Check if the product is already in the cart
      const productIndex = cart.products.findIndex(
        (p) => p.title === title && p.category === category
      );

      if (productIndex > -1) {
        // If the product exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // Add a new product to the cart
        cart.products.push({
          title,
          category,
          quantity,
          price,
          description,
          image,
        });
      }
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while adding the product to the cart.",
    });
  }
};

module.exports = {
  addProductToCart,
  deleteProduct,
  updateProduct,
  getSingleProduct,
  addNewProduct,
  getLimitedProducts,
  getAllProducts,
};
