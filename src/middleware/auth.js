const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const validateUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(403).send("token missing");
  } else {
    const data = jwt.verify(token, process.env.JWT_SECRET);

    if (!data) {
      return res.status(403).send("Invalid token");
    } else {
      const { _id: userId } = data;
      let user = await User.findById(userId);
      if (!user) {
        return res.status(403).send("User not available");
      } else {
        req.user = user;
        next();
      }
    }
  }
};

module.exports = { validateUser };
