const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      maxLength: 50,
      required: true,
    },
    firstName: {
      type: String,
      maxLength: 50,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("not a valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.hashPassword = async function () {
  let user = this;
  let passwordHash = await bcrypt.hash(user.password, 10);
  user.password = passwordHash;
};

UserSchema.methods.validatePassword = async function (inputPassoword) {
  let user = this;
  let passwordHash = user.password;
  return await bcrypt.compare(inputPassoword, passwordHash);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

const User = mongoose.model("User", UserSchema, "User");

module.exports = { User };
