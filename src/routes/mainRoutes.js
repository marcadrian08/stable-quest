const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
router.use("/user", userRoutes);

const wellnessChallengeRoutes = require("./wellnessChallengeRoutes");
router.use("/challenge", wellnessChallengeRoutes);

const horseRoutes = require("./horseRoutes");
router.use("/horse", horseRoutes);

const shopRoutes = require("./shopRoutes");
router.use("/shop", shopRoutes);

const trainerBadgeRoutes = require("./trainerBadgeRoutes");
router.use("/trainerBadge", trainerBadgeRoutes);

module.exports = router;
