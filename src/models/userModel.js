const pool = require('../services/db');

// For register: check username exists
module.exports.checkUserName = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id
    FROM User
    WHERE username = ?
    LIMIT 1;
  `;
  pool.query(SQLSTATEMENT, [data.username], callback);
};

// For login: get hash
module.exports.selectUserByUsername = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, password_hash
    FROM User
    WHERE username = ?
    LIMIT 1;
  `;
  pool.query(SQLSTATEMENT, [data.username], callback);
};


// This model function inserts a new user into the User table (for register, make sure coins = 0)
module.exports.createUser = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO User (username, password_hash, coins)
    VALUES (?, ?, 0);
  `;
  const VALUES = [data.username, data.password_hash];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.getMe = (data, callback) =>
{
    const SQLSTATEMENT = `
        SELECT user_id, username, coins
        FROM User
        WHERE user_id = ?
        LIMIT 1;
        `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

// This model function checks whether a username already exists
module.exports.checkUsernameExceptUser = (data, callback) =>
{
    // excluding the current user's user_id
    const SQLSTATEMENT = `
        SELECT * FROM User
        WHERE username = ? AND user_id != ?
    `;
    const VALUES = [data.username, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

// This model function updates a user's username in the User table
module.exports.updateUserById = (data, callback) =>
{
    const SQLSTATEMENT = `
        UPDATE User
        SET username = ?
        WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.selectUserById = (data, callback) =>
{
    const SQLSTATEMENT = `
        SELECT user_id, username, coins
        FROM User
        WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATEMENT, VALUES, callback);
};