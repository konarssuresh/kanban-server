const express = require("express");
const { User } = require("../models/user");
const {
  validateSignupRequest,
  validateLoginRequest,
} = require("../utils/utils");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupRequest(req);

    const { firstName, lastName, emailId, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
    });
    await user.hashPassword();
    await user.save();
    res.send("user created successfully");
  } catch (e) {
    res.status(403).json({
      message: e?.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginRequest(req);
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    const isProd = process.env.NODE_ENV === "production";
    if (!user) {
      throw new Error("Userid and password does not match");
    }
    const passwordMatch = await user.validatePassword(password);
    if (!passwordMatch) {
      throw new Error("Userid and password does not match");
    }

    const token = user.generateAuthToken();
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: isProd, // true in prod (HTTPS), false locally (HTTP)
      sameSite: isProd ? "none" : "lax", // cross-site cookies require none+secure
      path: "/",
    };

    if (isProd && process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN; // e.g. ".example.com"
    }
    res.cookie("token", token, cookieOptions);

    res.json({
      message: "login successful",
    });
  } catch (e) {
    res.status(403).json({
      message: e?.message,
    });
  }
});

module.exports = authRouter;
