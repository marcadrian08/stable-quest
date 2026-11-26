const pool = require("../services/db");

const SQLSTATEMENT = `
-- DROP TABLES (ORDER MATTERS)
DROP TABLE IF EXISTS UserHorse;
DROP TABLE IF EXISTS Horse;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS WellnessChallenge;
DROP TABLE IF EXISTS TrainerBadge;
DROP TABLE IF EXISTS User;

-- ======================
-- USER TABLE (AUTH READY)
-- ======================
CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  coins INT NOT NULL DEFAULT 0,
  total_exp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- WELLNESS CHALLENGES
-- ======================
CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  coins_reward INT NOT NULL,
  created_by_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES User(user_id)
);

-- ======================
-- USER COMPLETION
-- ======================
CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  details VARCHAR(255) NULL,
  UNIQUE KEY uq_user_challenge (user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (challenge_id) REFERENCES WellnessChallenge(challenge_id)
);


-- ======================
-- HORSE CATALOG
-- ======================
CREATE TABLE Horse (
  horse_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rarity ENUM('common','rare','epic','legendary') DEFAULT 'common',
  speed INT NOT NULL,
  stamina INT NOT NULL,
  strength INT NOT NULL
);

-- ======================
-- USER OWNED HORSES
-- ======================
CREATE TABLE UserHorse (
  user_horse_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  horse_id INT NOT NULL,
  exp INT DEFAULT 0,
  bonus_speed INT DEFAULT 0,
  bonus_stamina INT DEFAULT 0,
  bonus_strength INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (horse_id) REFERENCES Horse(horse_id)
);

-- ======================
-- TRAINER BADGES
-- ======================
CREATE TABLE TrainerBadge (
  badge_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_exp INT NOT NULL
);

-- ======================
-- SEED DATA (SAFE)
-- ======================
INSERT INTO WellnessChallenge (description, coins_reward) VALUES
('Morning Jog — Light track training', 10),
('Hydration Drill — Drink 2 cups of water', 15),
('Endurance Walk — 15 minute walk', 20),
('Stable Clean-Up — Clean your room', 25),
('Mental Focus — 30 minutes no phone', 20),
('Yoga Stretch — 20 minute flexibility routine', 15),
('Quick Sprint — Run 100 meters fast', 15);

INSERT INTO Horse (name, rarity, speed, stamina, strength) VALUES
('Brown Horse', 'common', 30, 30, 30),
('Rainbow Horse', 'rare', 40, 35, 30),
('Dragon Horse', 'epic', 55, 50, 45),
('Golden Horse', 'legendary', 75, 60, 65),
('Shadow Horse', 'rare', 45, 40, 35),
('Silver Horse', 'epic', 60, 50, 50);

INSERT INTO TrainerBadge (name, min_exp) VALUES
('Novice Trainer', 0),
('Apprentice Trainer', 50),
('Expert Trainer', 100),
('Master Trainer', 200);
`;

pool.query(SQLSTATEMENT, (error) => {
  if (error) console.error("Error creating tables:", error);
  else console.log("Tables created successfully");
  process.exit();
});
