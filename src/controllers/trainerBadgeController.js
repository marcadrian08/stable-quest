const model = require("../models/trainerBadgeModel");

// 1) list all badges (public)
module.exports.readAllBadges = (req, res) => {
  const callback = (error, results) => {
    if (error) return res.status(500).json(error);
    return res.status(200).json(results);
  };

  model.getAllBadges(callback);
};

// 2) get lifetime EXP (protected)
module.exports.getMyTotalExp = (req, res, next) => {
  const data = { user_id: res.locals.userId };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    if (!results || results.length === 0) res.locals.totalExp = 0;
    else res.locals.totalExp = results[0].total_exp || 0;

    return next();
  };

  model.getTotalUserExp(data, callback);
};

// 3) get badge based on EXP (protected)
module.exports.getMyBadge = (req, res) => {
  const data = { total_exp: res.locals.totalExp };

  const callback = (error, results) => {
    if (error) return res.status(500).json(error);

    const badge = (results && results.length > 0) ? results[0] : {
      badge_id: null,
      name: "Novice Trainer",
      min_exp: 0
    };

    return res.status(200).json({
      total_exp: res.locals.totalExp,
      badge: badge
    });
  };

  model.getBadgeByExp(data, callback);
};
