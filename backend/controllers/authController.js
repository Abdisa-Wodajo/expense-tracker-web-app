const User = require('../models/User');
const jwt = require("jsonwebtoken");

//Generate JWT token
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1h"});

};

// Register User (add small debug log after create)
exports.registerUser = async (req, res) => {
  let { fullName, email, password, profileImageUrl } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  email = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });

    console.log("User created:", { email: user.email, pwdPreview: user.password ? user.password.slice(0, 10) + "..." : "no-pwd" });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Error registration user", error: err.message });
  }
};

// Login User (debug)
exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  email = email.trim().toLowerCase();
  // don't log full password in production
  const passwordPreview = password.length > 0 ? (password.length <= 4 ? password : password.slice(0, 2) + "...") : "(empty)";
  password = password.trim();

  try {
    console.log("Login attempt for:", email, "pwdPreview:", passwordPreview);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Stored password preview:", user.password ? user.password.slice(0, 10) + "..." : "no-password");
    const match = await user.comparePassword(password);
    console.log("Password match:", match);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging user", error: err.message });
  }
};

//Get User Info
exports.getUserInfo = async (req, res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user) {
            return res.status(404).json({message: "User is not found"});
        }
        res.status(200).json(user);
    }catch (err) {

        res
        .status(500)
        .json({message: "Error registering user", error: err.message});
    }
};