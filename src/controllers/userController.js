const model = require("../models/userModel.js");

//////////////////////////////////////////////////////
// REGISTER: Check username uniqueness (PUBLIC)
//////////////////////////////////////////////////////
module.exports.checkUserName = (req, res, next) => {
  if (!req.body.username) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!req.body.password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const data = {
    username: req.body.username
  };

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return next();
  };

  model.checkUserName(data, callback);
};

//////////////////////////////////////////////////////
// REGISTER: Create user (after bcrypt.hashPassword)
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) => {
  const data = {
    username: req.body.username,
    password_hash: res.locals.hash
  };

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.locals.userId = results.insertId;
    res.locals.message = "Registered successfully";

    return next();
  };

  model.createUser(data, callback);
};

//////////////////////////////////////////////////////
// LOGIN: Verify user exists (PUBLIC)
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: "username and password are required"
    });
  }

  const data = {
    username: req.body.username
  };

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const user = results[0];

    res.locals.userId = user.user_id;
    res.locals.hash = user.password_hash;
    res.locals.message = "Login successful";

    return next();
  };

  model.selectUserByUsername(data, callback);
};

//////////////////////////////////////////////////////
// ME: Get current logged-in user (PROTECTED)
//////////////////////////////////////////////////////
module.exports.getMe = (req, res) => {
  const data = {
    user_id: res.locals.userId
  };

  const callback = (error, results) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json(results[0]);
  };

  model.getMe(data, callback);
};

// This middleware checks whether the new username is provided
// and ensures it does not conflict with other existing users
// checks new username and ensures no conflict with other users
module.exports.checkUsernameForUpdateMe = (req, res, next) => {
  if (req.body.username === undefined) {
    return res.status(400).json({ message: "Username is required" });
  }

  const data = {
    username: req.body.username,
    user_id: res.locals.userId // IMPORTANT: use token user id, not req.params
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (results.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return next();
  };

  model.checkUsernameExceptUser(data, callback);
};

// updates the logged-in user (no :id in route)
module.exports.updateMe = (req, res) => {
  const data = {
    user_id: res.locals.userId, // IMPORTANT
    username: req.body.username,
    coins: req.body.coins // optional, ok if undefined
  };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user_id: data.user_id,
      username: data.username,
      coins: data.coins
    });
  };

  model.updateUserById(data, callback);
};

// This controller updates a user's username based on user_id
module.exports.updateUserById = (req, res) => {
    const data = {
        user_id: req.params.user_id,
        username: req.body.username,
        coins: req.body.coins
    };

    const callback = (error, results) => {
        if (error) {
            return res.status(500).json(error);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user_id: data.user_id,
            username: data.username,
            coins: data.coins
        });
    };

    model.updateUserById(data, callback);
};

// This controller retrieves a single user based on the user_id
module.exports.readUserById = (req, res) =>
{
    const data = {
        user_id: req.params.user_id
    };

    const callback = (error, results) => {
        if (error) {
            console.error("Error readUserById:", error);
            return res.status(500).json(error);
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // results[0] is used because user_id is unique
        return res.status(200).json(results[0]);
    };

    model.selectUserById(data, callback);
};