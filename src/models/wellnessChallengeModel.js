const pool = require("../services/db");

// 1) retrieve challenges for this user (seed + own)
module.exports.selectChallengesForUser = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT *
    FROM WellnessChallenge
    WHERE created_by_user_id IS NULL
       OR created_by_user_id = ?
    ORDER BY created_at DESC;
  `;

  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


module.exports.createChallenge = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO WellnessChallenge (description, coins_reward, created_by_user_id)
    VALUES (?, ?, ?);
  `;
  
  const VALUES = [data.description, data.coins_reward, data.created_by_user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.deleteChallenge = (data, callback) => {
  const SQLSTATEMENT = `
    DELETE FROM WellnessChallenge
    WHERE challenge_id = ? AND created_by_user_id = ?;
  `;

  const VALUES = [data.challenge_id, data.user_id];

  pool.query(SQLSTATEMENT, VALUES, callback);
};


module.exports.insertChallengeCompletion = (data, callback) =>
{
    const SQLSTATEMENT = `
        INSERT INTO UserCompletion (user_id, challenge_id, details)
        VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.challenge_id, data.details];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
module.exports.checkCompletionExists = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 1
    FROM UserCompletion
    WHERE user_id = ? AND challenge_id = ?
    LIMIT 1;
  `;
  const VALUES = [data.user_id, data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get coins reward for a challenge
module.exports.selectChallengeById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT coins_reward
    FROM WellnessChallenge
    WHERE challenge_id = ?
    LIMIT 1;
  `;
  const VALUES = [data.challenge_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// insert a challenge completion to a user
module.exports.addCoinsToUser = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE User
    SET coins = coins + ?
    WHERE user_id = ?;
  `;
  const VALUES = [data.coins_reward, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


module.exports.selectUserCompletions = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT wc.challenge_id, wc.description, wc.coins_reward, uc.details
    FROM UserCompletion uc
    JOIN WellnessChallenge wc ON uc.challenge_id = wc.challenge_id
    WHERE uc.user_id = ?;
  `;
  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};


module.exports.checkAnyCompletionForChallenge = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 1 FROM UserCompletion WHERE challenge_id = ? LIMIT 1;
  `;
  pool.query(SQLSTATEMENT, [data.challenge_id], callback);
};
