const {sendPasswordResetEmail} = require("./emailService")

//Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    await sendPasswordResetEmail(email);
    res.json({ message: "Password reset email sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
    console.log(error)
  }
};

module.exports = { resetPassword };
