const model = require("../models/wellnessChallengeModel.js");

// 1) get all challenges 
module.exports.readAllChallenges = (req, res) => {
  const data = {
    user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(results);
  };

  model.selectChallengesForUser(data, callback);
};


// 2a) middleware for create challenge (protected)
module.exports.validateCreateChallenge = (req, res, next) => {
  const { description, coins_reward } = req.body;

  if (description === undefined) {
    return res.status(400).json({ message: "Description is required" });
  }

  const desc = String(description).trim();
  if (!desc) {
    return res.status(400).json({ message: "Description cannot be empty" });
  }

  if (coins_reward === undefined) {
    return res.status(400).json({ message: "coins_reward is required" });
  }

  const reward = Number(coins_reward);
  if (Number.isNaN(reward)) {
    return res.status(400).json({ message: "coins_reward must be a number" });
  }

  if (reward < 1 || reward > 50) {
    return res.status(400).json({ message: "coins_reward must be between 1 and 50" });
  }

  // pass clean data forward
  res.locals.description = desc;
  res.locals.coinsReward = reward;

  return next();
};

// 2b) create challenge (protected) 
module.exports.createChallenge = (req, res) => {
  const data = {
    description: res.locals.description,
    coins_reward: res.locals.coinsReward,
    created_by_user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    return res.status(201).json({
      message: "Challenge created successfully",
      challenge_id: results.insertId
    });
  };

  model.createChallenge(data, callback);
};

// 3a) check challengeid for complete challenge (protected)
module.exports.validateChallengeId = (req, res, next) => {
  const challengeId = Number(req.params.challenge_id);

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return res.status(400).json({ message: "Invalid challenge ID" });
  }

  res.locals.challengeId = challengeId;
  return next();
};


// 3b) get the amount of coins from challenge (protected) 
module.exports.getChallengeReward = (req, res, next) => {
  const data = {
    challenge_id: res.locals.challengeId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.locals.coinsReward = results[0].coins_reward;
    return next();
  };

  model.selectChallengeById(data, callback);
};
module.exports.blockDuplicateCompletion = (req, res, next) => {
  const data = { user_id: res.locals.userId, challenge_id: res.locals.challengeId };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    if (results && results.length > 0) {
      return res.status(409).json({ message: "Challenge already completed" });
    }
    return next();
  };

  model.checkCompletionExists(data, callback);
};

module.exports.validateCompleteChallenge = (req, res, next) => {
  const details = req.body.details;

  // optional field: allow empty / missing
  if (details === undefined || details === null || details === "") {
    res.locals.details = null;
    return next();
  }

  if (typeof details !== "string") {
    return res.status(400).json({ message: "details must be a string" });
  }

  res.locals.details = details.trim();
  return next();
};

// 3c) complte challenge (protected) 
module.exports.insertCompletion = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    challenge_id: res.locals.challengeId,
    details: res.locals.details
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json({ message: error.sqlMessage || "DB error" });
    return next();
  };

  model.insertChallengeCompletion(data, callback);
};


// 3d) add coins from challenge (protected) + send response
module.exports.rewardAndRespond = (req, res) => {
  const data = {
    user_id: res.locals.userId,
    coins_reward: res.locals.coinsReward
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    return res.status(201).json({
      message: "Challenge completed successfully",
      coins_earned: res.locals.coinsReward,
      challenge_id: res.locals.challengeId,
      details: res.locals.details
    });
  };

  model.addCoinsToUser(data, callback);
};


// 4) delete own challenge (protected)
module.exports.deleteChallenge = (req, res) => {
  const data = {
    challenge_id: res.locals.challengeId,
    user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.affectedRows === 0) {
      return res.status(403).json({ message: "Not allowed or challenge not found" });
    }

    return res.status(200).json({ message: "Challenge deleted successfully" });
  };

  model.deleteChallenge(data, callback);
};

module.exports.readMyCompletions = (req, res) => {
  const data = { user_id: res.locals.userId };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(results);
  };

  model.selectUserCompletions(data, callback);
};

module.exports.blockDeleteIfCompleted = (req, res, next) => {
  const data = { challenge_id: res.locals.challengeId };

  model.checkAnyCompletionForChallenge(data, function (error, results) {
    if (error) return res.status(500).json(error);
    if (results && results.length > 0) {
      return res.status(409).json({ message: "Cannot delete: challenge has completions" });
    }
    return next();
  });
};
