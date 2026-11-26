// userRoutes.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const bcryptMiddleware = require("../middlewares/bcryptMiddleware");

// auth
router.post("/register", userController.checkUserName, bcryptMiddleware.hashPassword, userController.register, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post("/login", userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);

// me (protected)
router.get("/me", jwtMiddleware.verifyToken, userController.getMe);

// update me (protected)
router.put(
  "/me",
  jwtMiddleware.verifyToken,
  userController.checkUsernameForUpdateMe,
  userController.updateMe
);

module.exports = router;
