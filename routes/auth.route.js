const express = require("express");
const { createUser } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", createUser);

module.exports = router;
