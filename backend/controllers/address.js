const Address = require("../models/address");

// ADD ADDRESS
const addAddress = async (req, res) => {
  try {
    // Extract address details from request body
    const {
      firstName,
      lastName,
      street,
      email,
      city,
      state,
      postalCode,
      phone,
      isDefault,
    } = req.body;

    // Get the authenticated user's ID
    const userId = req.cookies.storeSession;

    if (!userId) {
      return res.status(400).json({ error: "Please login to add an address." });
    }

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !phone
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // If isDefault is true, update other addresses to false
    if (isDefault) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    // Create new address
    const newAddress = new Address({
      user: userId,
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      postalCode,
      phone,
      isDefault: isDefault || false, // Default to false if not provided
    });

    // Save to DB
    await newAddress.save();

    return res
      .status(201)
      .json({ message: "Address added successfully.", address: newAddress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

//GET ADDRESSES
const getAddress = async (req, res) => {
  try {
    const addresses = await Address.find();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch addresses." });
  }
};

// UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    const userId = req.cookies.storeSession; // Get authenticated user's ID

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Please login to update an address." });
    }

    // Extract updated address details from request body
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      postalCode,
      phone,
      isDefault,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !phone
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the user's address
    const address = await Address.findOne({ user: userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }

    // If isDefault is true, update other addresses to false
    if (isDefault) {
      await Address.updateMany(
        { user: userId },
        { $set: { isDefault: false } }
      );
    }

    // Update the user's address
    const updatedAddress = await Address.findOneAndUpdate(
      { user: userId }, // Find by user ID
      {
        firstName,
        lastName,
        email,
        street,
        city,
        state,
        postalCode,
        phone,
        isDefault: isDefault || false, // Default to false if not provided
      },
      { new: true } // Return the updated document
    );

    return res
      .status(200)
      .json({
        message: "Address updated successfully.",
        address: updatedAddress,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

//DELETE ADDRESS
const deleteAddress = async (req, res) => {
    try {
      const userId = req.cookies.storeSession; // Get authenticated user's ID
  
      if (!userId) {
        return res.status(400).json({ error: "Please login to delete an address." });
      }
  
      // Find the user's address to delete
      const address = await Address.findOne({ user: userId });
  
      if (!address) {
        return res.status(404).json({ message: "Address not found." });
      }
  
      // Delete the address
      await Address.findOneAndDelete({ user: userId });
  
      return res.status(200).json({ message: "Address deleted successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error." });
    }
  };

module.exports = { addAddress, getAddress, updateAddress , deleteAddress};
