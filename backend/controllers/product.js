import { Product } from "../models/product.js";

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

// export const getLimitedProducts = async (req, res) => {
//   try {
//     const limit = req.query.limit;
//     if (!limit) {
//       return res
//         .status(400)
//         .json({ error: "Please provide a limit query parameter." });
//     }

//     const response = await fetch(
//       `https://fakestoreapi.com/products?limit=${limit}`
//     );
//     const product = await response.json();
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ error: "Error occured while fetching products." });
//   }
// };
// Sort results
// export const sortProducts = async (req, res) => {
//   try {
//     const sort = req.query.sort || 'asc'; // Get sorting order from query parameter (default is 'asc')
//     const sortField = req.query.field || 'title'; // Get the field to sort by (default is 'title')

//     // Validate sort order
//     const sortOrder = sort === 'desc' ? -1 : 1;

//     // Fetch sorted products from MongoDB
//     const products = await Product.find().sort({ [sortField]: sortOrder });

//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ error: "Error while sorting products." });
//   }
// };
