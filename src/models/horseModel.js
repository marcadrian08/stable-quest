const pool = require("../services/db");

// 1) Get horse catalogue (PUBLIC)
module.exports.getHorseCatalogue = (callback) => {
  const SQLSTATEMENT = `
    SELECT horse_id, name, rarity, speed, stamina, strength
    FROM Horse
    ORDER BY
      FIELD(rarity,'legendary','epic','rare','common'),
      name ASC;
  `;

  pool.query(SQLSTATEMENT, callback);
};

// 2) Get my horses (PROTECTED)
module.exports.getMyHorses = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT
      uh.user_horse_id,
      uh.exp,
      uh.bonus_speed,
      uh.bonus_stamina,
      uh.bonus_strength,
      h.horse_id,
      h.name,
      h.rarity,
      h.speed,
      h.stamina,
      h.strength
    FROM UserHorse uh
    JOIN Horse h ON uh.horse_id = h.horse_id
    WHERE uh.user_id = ?;
  `;

  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3a) Check user owns horse (for middleware)
module.exports.checkUserHorseExists = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_horse_id
    FROM UserHorse
    WHERE user_horse_id = ? AND user_id = ?;
  `;

  const VALUES = [data.user_horse_id, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
// get user coins
module.exports.getUserCoins = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT coins
    FROM User
    WHERE user_id = ?
    LIMIT 1;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// deduct coins (only if enough)
module.exports.deductUserCoins = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE User
    SET coins = coins - ?
    WHERE user_id = ? AND coins >= ?;
  `;
  const VALUES = [data.amount, data.user_id, data.amount];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3b) Train horse: exp +10, bonuses +1
// 3b) Train horse: exp +10, bonuses +1 AND add lifetime exp to User.total_exp (ONE query)
module.exports.levelUpUserHorse = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserHorse uh
    JOIN User u ON u.user_id = uh.user_id
    SET
      uh.exp = uh.exp + 10,
      uh.bonus_speed = uh.bonus_speed + 1,
      uh.bonus_stamina = uh.bonus_stamina + 1,
      uh.bonus_strength = uh.bonus_strength + 1,
      u.total_exp = u.total_exp + 10
    WHERE uh.user_horse_id = ? AND uh.user_id = ?;
  `;

  const VALUES = [data.user_horse_id, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};



// add lifetime exp to user (does NOT decrease when horse is deleted)
module.exports.addUserTotalExp = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE User
    SET total_exp = total_exp + ?
    WHERE user_id = ?;
  `;

  const VALUES = [data.amount, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


// 4) Delete horse (only if belongs to user)
module.exports.deleteUserHorse = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM UserHorse
    WHERE user_horse_id = ? AND user_id = ?;
  `;

  const VALUES = [data.user_horse_id, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
