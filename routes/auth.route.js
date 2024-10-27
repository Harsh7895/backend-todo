const express = require("express");
const {
  createUser,
  loginUser,
  logout,
} = require("../controllers/auth.controller");
const verifyUser = require("../utils/verifyuser");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logout);

module.exports = router;
