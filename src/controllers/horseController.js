const model = require("../models/horseModel");

// 1) Get all horses (PUBLIC)
module.exports.getHorseCatalogue = (req, res) => {
  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(results);
  };

  model.getHorseCatalogue(callback);
};

// 2) Get horses owned by logged-in user (PROTECTED)
module.exports.getMyHorses = (req, res) => {
  const data = {
    user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(results);
  };

  model.getMyHorses(data, callback);
};

// 3a) Verify user owns the horse (middleware)
module.exports.verifyHorseOwnership = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    user_horse_id: req.params.user_horse_id
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.length === 0) {
      return res.status(403).json({ message: "User does not own this horse" });
    }

    return next();
  };

  model.checkUserHorseExists(data, callback);
};
const TRAIN_COST = 3;

// check if user has enough coins
module.exports.checkTrainCoins = (req, res, next) => {
  const data = { user_id: res.locals.userId };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (results[0].coins < TRAIN_COST) {
      return res.status(400).json({ message: "Not enough coins to train" });
    }

    res.locals.trainCost = TRAIN_COST;
    return next();
  };

  model.getUserCoins(data, callback);
};

// deduct coins for training
module.exports.deductTrainCoins = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    amount: res.locals.trainCost
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    if (!results || results.affectedRows === 0) {
      return res.status(400).json({ message: "Not enough coins to train" });
    }

    return next();
  };

  model.deductUserCoins(data, callback);
};

// 3b) Train horse (PROTECTED)// 3b) Train horse (PROTECTED)
module.exports.trainUserHorse = (req, res) => {
  const data = {
    user_id: res.locals.userId,
    user_horse_id: req.params.user_horse_id
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    return res.status(200).json({
      message: "Horse trained successfully",
      coins_spent: res.locals.trainCost
    });
  };

  model.levelUpUserHorse(data, callback);
};



// 4) Release horse (DELETE ONLY, PROTECTED)
module.exports.releaseHorse = (req, res) => {
  const data = {
    user_id: res.locals.userId,
    user_horse_id: req.params.user_horse_id
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    return res.status(200).json({
      message: "Horse released successfully",
      user_horse_id: data.user_horse_id
    });
  };

  model.deleteUserHorse(data, callback);
};
