const express = require("express");
const router = express.Router();

const horseController = require("../controllers/horseController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// PUBLIC
router.get("/", horseController.getHorseCatalogue);

// PROTECTED
router.get("/my", jwtMiddleware.verifyToken, horseController.getMyHorses);

router.put(
  "/my/:user_horse_id/train",
  jwtMiddleware.verifyToken,
  horseController.verifyHorseOwnership,
  horseController.checkTrainCoins,
  horseController.deductTrainCoins,
  horseController.trainUserHorse
);


router.delete(
  "/my/:user_horse_id",
  jwtMiddleware.verifyToken,
  horseController.verifyHorseOwnership,
  horseController.releaseHorse
);

module.exports = router;
