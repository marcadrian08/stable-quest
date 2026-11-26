const model = require("../models/shopModel");

const GACHA_PRICE = 75;

// 1) check if user has enough coins
module.exports.checkGachaCoins = (req, res, next) => {
  const data = {
    user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const coins = results[0].coins;

    if (coins < GACHA_PRICE) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    res.locals.gachaPrice = GACHA_PRICE;
    return next();
  };

  model.getUserCoins(data, callback);
};

// 2) deduct coins
module.exports.deductGachaCoins = (req, res, next) => {
  const data = {
    user_id: res.locals.userId,
    amount: res.locals.gachaPrice
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.affectedRows === 0) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    return next();
  };

  model.deductCoins(data, callback);
};

// 3) roll horse 
// 3) roll horse (includes all 6 seeded horses)
module.exports.rollGachaHorse = (req, res, next) => {
  const roll = Math.random(); // 0.000.. to 0.999..
  let pool;

  // 50% common -> horse 1
  if (roll <= 0.50) {
    pool = [1];
  }
  // 30% rare -> horses 2,5
  else if (roll <= 0.80) {
    pool = [2, 5];
  }
  // 15% epic -> horses 3,6
  else if (roll <= 0.95) {
    pool = [3, 6];
  }
  // 5% legendary -> horse 4
  else {
    pool = [4];
  }

  const pickedIndex = Math.floor(Math.random() * pool.length);
  res.locals.horseId = pool[pickedIndex];

  return next();
};


// 4) insert horse
module.exports.insertGachaHorse = (req, res, next) => {
  if (!res.locals.horseId) {
  return res.status(500).json({ message: "Gacha roll failed" });
  }

  const data = {
    user_id: res.locals.userId,
    horse_id: res.locals.horseId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return next();
  };

  model.insertUserHorse(data, callback);
};

// 5) get horse details
module.exports.getGachaHorseDetails = (req, res, next) => {
  const data = {
    horse_id: res.locals.horseId
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Horse not found" });
    }

    res.locals.horse = results[0];
    return next();
  };

  model.getHorseById(data, callback);
};

// 6) send result
module.exports.sendGachaResult = (req, res) => {
  return res.status(201).json({
    message: "Gacha successful!",
    coins_spent: res.locals.gachaPrice,
    horse: res.locals.horse
  });
};


