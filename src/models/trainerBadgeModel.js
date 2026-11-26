const pool = require("../services/db");

// 1) get all badge levels
module.exports.getAllBadges = (callback) => {
  const SQLSTATEMENT = `
    SELECT badge_id, name, min_exp
    FROM TrainerBadge
    ORDER BY min_exp ASC;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// 2) get lifetime EXP from User table (NOT from UserHorse)
module.exports.getTotalUserExp = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT total_exp
    FROM User
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3) get badge based on total EXP
module.exports.getBadgeByExp = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT badge_id, name, min_exp
    FROM TrainerBadge
    WHERE min_exp <= ?
    ORDER BY min_exp DESC
    LIMIT 1;
  `;
  const VALUES = [data.total_exp];
  pool.query(SQLSTATEMENT, VALUES, callback);
};
