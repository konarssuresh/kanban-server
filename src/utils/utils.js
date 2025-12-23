const validator = require("validator");

const validateRequest = (req, allowedKeys = []) => {
  const data = req.body;

  Object.keys(data).forEach((key) => {
    if (!allowedKeys.includes(key)) {
      throw new Error("Invalid key " + key + " in request");
    }
  });
};

const validateSignupRequest = (req) => {
  const KEYS = ["firstName", "lastName", "emailId", "password"];
  validateRequest(req, KEYS);

  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName) {
    throw new Error("firstName is required");
  }
  if (!lastName) {
    throw new Error("lastName is required");
  }
  if (!emailId) {
    throw new Error("emailId is required");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("not a valid email");
  }
  if (!password) {
    throw new Error("password is required");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password should contain atleast one capital letter,one small letter and one special character and minimum 8"
    );
  }
};

const validateLoginRequest = (req) => {
  const KEYS = ["emailId", "password"];
  validateRequest(req, KEYS);

  const { emailId, password } = req.body;

  if (!emailId) {
    throw new Error("emailId is required");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("not a valid email");
  }
  if (!password) {
    throw new Error("password is required");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password should contain atleast one capital letter,one small letter and one special character and minimum 8"
    );
  }
};

const validateAddBoardRequest = (req) => {
  const KEYS = ["name", "columns"];
  validateRequest(req, KEYS);
  const { name, columns } = req.body;
  if (!name) {
    throw new Error("name is required");
  }

  if (columns) {
    if (!Array.isArray(columns)) {
      throw new Error("columns should be of Array type");
    }
    const isValidValues = columns.every((val) => typeof val === "string");
    if (!isValidValues) {
      throw new Error("only string datatype is suppoeted in columns array");
    }
  }
};

const validateUpdateTaskRequest = (req) => {
  const KEYS = ["title", "description", "subtasks", "position"];
  validateRequest(req, KEYS);
};

module.exports = {
  validateSignupRequest,
  validateLoginRequest,
  validateAddBoardRequest,
  validateUpdateTaskRequest,
};
