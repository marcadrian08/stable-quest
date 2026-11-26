//////////////////////////////////////////////////////
// REQUIRE BCRYPT MODULE
//////////////////////////////////////////////////////
const bcrypt = require("bcrypt");

//////////////////////////////////////////////////////
// SET SALT ROUNDS
//////////////////////////////////////////////////////
const saltRounds = 10;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR COMPARING PASSWORD
//////////////////////////////////////////////////////
module.exports.comparePassword = (req, res, next) => {
  // Check password
  const callback = (err, isMatch) => {
    if (err) {
      console.error("Error bcrypt:", err);
      res.status(500).json(err);
    } else {
      if (isMatch) {
        return next();
      } else {
        res.status(401).json({
          message: "Invalid username or password",
        });
      }
    }
  };
const plain = res.locals.password ?? req.body.password;
const hash = res.locals.hash;

bcrypt.compare(plain, hash, callback);


};

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR HASHING PASSWORD
//////////////////////////////////////////////////////
module.exports.hashPassword = (req, res, next) => {
  const callback = (err, hash) => {
    if (err) {
      console.error("Error bcrypt:", err);
      res.status(500).json(err);
    } else {
      res.locals.hash = hash;
      next();
    }
  };

  bcrypt.hash(req.body.password, saltRounds, callback);
};
