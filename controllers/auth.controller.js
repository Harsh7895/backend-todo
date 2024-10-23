const User = require("../models/user.schema");
const ErrorHandler = require("../utils/error");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(ErrorHandler(401, "Wrong Username or Password"));
    }

    const validPass = bcryptjs.compareSync(password, validUser.password);
    if (!validPass) {
      return next(ErrorHandler(401, "Wrong Username or Password"));
    }

    const { password: pass, ...rest } = validUser._doc;
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      success: true,
      message: "Logged In Successfully",
      rest,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, loginUser };
