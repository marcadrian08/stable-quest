const express = require("express");
const router = express.Router();

const controller = require("../controllers/wellnessChallengeController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

// 1) Read all challenges 
router.get(
  "/challenges",
  jwtMiddleware.verifyToken,
  controller.readAllChallenges
);


// 2) Create challenge (protected)
router.post(
  "/challenges",
  jwtMiddleware.verifyToken,
  controller.validateCreateChallenge,
  controller.createChallenge
);

// 3) Complete challenge (protected)
router.post(
  "/challenges/:challenge_id/complete",
  jwtMiddleware.verifyToken,
  controller.validateChallengeId,
  controller.blockDuplicateCompletion,
  controller.validateCompleteChallenge,
  controller.getChallengeReward,
  controller.insertCompletion,
  controller.rewardAndRespond
);



// 4) Delete own challenge (protected)
router.delete(
  "/challenges/:challenge_id",
  jwtMiddleware.verifyToken,
  controller.validateChallengeId,
  controller.blockDeleteIfCompleted,
  controller.deleteChallenge
);

router.get(
  "/completions",
  jwtMiddleware.verifyToken,
  controller.readMyCompletions
);

module.exports = router;
