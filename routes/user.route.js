const express = require("express");
const verifyUser = require("../utils/verifyuser");
const {
  updateUser,
  getUserName,
  getUserAnalytics,
} = require("../controllers/user.controller");

const router = express.Router();

router.patch("/update-user", verifyUser, updateUser);
router.get("/username", verifyUser, getUserName);
router.get("/get-analytics", verifyUser, getUserAnalytics);

module.exports = router;
