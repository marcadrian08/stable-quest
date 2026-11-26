const express = require("express");
const router = express.Router();

const controller = require("../controllers/trainerBadgeController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// public
router.get("/badges", controller.readAllBadges);

// protected
router.get(
  "/badges/me",
  jwtMiddleware.verifyToken,
  controller.getMyTotalExp,
  controller.getMyBadge
);

module.exports = router;
