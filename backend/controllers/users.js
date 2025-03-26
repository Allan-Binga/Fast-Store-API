const User = require("../models/users")

//GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error getting all users." });
  }
};

//GET SINGLE USER
const getSingleUser = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error occured while getting users." });
  }
};

//UPDATE USER
const updatedUser = async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const userUpdated = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(userUpdated);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(401).json("You can only update your account.");
  }
};


module.exports = {getUsers, getSingleUser, updatedUser}