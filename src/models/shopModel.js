const pool = require("../services/db");

// 1) get the user's coins
module.exports.getUserCoins = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT coins FROM User
        WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// 2) deduct coins
module.exports.deductCoins = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE User
        SET coins = coins - ?
        WHERE user_id = ? AND coins >= ?;
    `;

    const VALUES = [data.amount, data.user_id, data.amount];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3) insert horse from gacha
module.exports.insertUserHorse = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO UserHorse (user_id, horse_id)
        VALUES (?, ?);
    `;

    const VALUES = [data.user_id, data.horse_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// 4) get horse by id 
module.exports.getHorseById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT horse_id, name, rarity, speed, stamina, strength
    FROM Horse
    WHERE horse_id = ?;
  `;
  const VALUES = [data.horse_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

