const User = require("../models/user.schema");
const ErrorHandler = require("../utils/error");
const bcryptjs = require("bcryptjs");

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(ErrorHandler(400, "Credentials is required!"));
    }

    const user = await User.findOne({ email });
    if (user) return next(ErrorHandler(400, "User is already Exist"));
    const hashPassword = bcryptjs.hashSync(password, 10);

    await User.create({ name, email, password: hashPassword });

    res.status(200).json({
      success: true,
      message: "User created successfully, Login Now!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser };
