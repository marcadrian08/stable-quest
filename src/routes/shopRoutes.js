const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// ---------------------------
// PROTECTED
// ---------------------------

router.post(
  "/gacha",
  jwtMiddleware.verifyToken,
  shopController.checkGachaCoins,
  shopController.deductGachaCoins,
  shopController.rollGachaHorse,
  shopController.insertGachaHorse,
  shopController.getGachaHorseDetails,
  shopController.sendGachaResult
);

module.exports = router;
