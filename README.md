# CA2 – Stable Quest Web Application

## Overview

Stable Quest is a full-stack web application developed for **CA2 of the Backend Development module**.  
It extends the CA1 Wellness Challenge API by introducing a frontend interface and additional gamification features such as horse training, gacha mechanics, and achievement badges.

The application allows users to:
- Register and log in
- Complete wellness challenges
- Earn coins and train horses
- Unlock achievement badges based on lifetime progress

The system is built using **Node.js, Express, MySQL, and Bootstrap**, following a simple MVC structure and callback-based database interactions.

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript 

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- BCrypt

---

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
npm install
3. Create a `.env` file with the following values:
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
4. Initialise the database tables:
npm run init_tables
5.Start the server:
npm run dev
or 
npm run start
6. Open the application in a browser:
http://localhost:3000


## Project Structure

bed-ca2-marcadrian08/
│
├── node_modules/
│
├── graphics/
│   ├── badge.jpg
│   ├── challenge.jpg
│   ├── gacha.png
│   ├── gachaPull.png
│   ├── horseHero.jpg
│   ├── myHorses.jpg
│   └── register.jpg
│
├── public/
│   ├── css/
│   │   ├── badge.css
│   │   ├── color.css
│   │   ├── myHorses.css
│   │   ├── profile.css
│   │   ├── shop.css
│   │   ├── style.css
│   │   └── wellnessChallenge.css
│   │
│   ├── js/
│   │   ├── badge.js
│   │   ├── index.js
│   │   ├── loginUser.js
│   │   ├── logoutUser.js
│   │   ├── myHorses.js
│   │   ├── profile.js
│   │   ├── queryCMDS.js
│   │   ├── registerUser.js
│   │   ├── shop.js
│   │   └── wellnessChallenge.js
│   │   
│   ├── badge.html
│   ├── index.html
│   ├── login.html
│   ├── myHorses.html
│   ├── profile.html
│   ├── register.html
│   ├── shop.html
│   └── wellnessChallenge.html
│
├── src/
│   ├── configs/
│   │   ├── createSchema.js
│   │   └── initTables.js
│   │
│   ├── controllers/
│   │   ├── horseController.js
│   │   ├── shopController.js
│   │   ├── trainerBadgeController.js
│   │   ├── userController.js
│   │   └── wellnessChallengeController.js
│   │
│   ├── middlewares/
│   │   ├── bcryptMiddleware.js
│   │   └── jwtMiddleware.js
│   │
│   ├── models/
│   │   ├── horseModel.js
│   │   ├── shopModel.js
│   │   ├── trainerBadgeModel.js
│   │   ├── userModel.js
│   │   └── wellnessChallengeModel.js
│   │
│   ├── routes/
│   │   ├── horseRoutes.js
│   │   ├── mainRoutes.js
│   │   ├── shopRoutes.js
│   │   ├── trainerBadgeRoutes.js
│   │   ├── userRoutes.js
│   │   └── wellnessChallengeRoutes.js
│   │
│   ├── services/
│   │   └── db.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md

## Database Design

The database consists of the following main tables:

1) User – stores user credentials, coins, and lifetime EXP
2) WellnessChallenge – stores available wellness challenges
3) UserCompletion – records challenge completion per user
4) Horse – stores horse catalogue data (rarity and base stats)
5) UserHorse – links users to owned horses and tracks horse EXP
6) TrainerBadge – defines achievement tiers based on EXP

## Gamification Design (Section C)

Stable Quest uses a Horse Training theme to motivate user engagement.

1) Key mechanics:

-  Users earn coins by completing wellness challenges
- Users can also create their own wellness challenges and assign their own coin reward (with limits)

- Coins be used in 2 ways, to both train horses and to buy coins for gacha (lucky draw for horses) 

- Gacha System randomly draws a horse (different drop rates) from the Horse table - 75 coins needed to draw a horse from the gacha shop

- Training horses increases both horse stats and lifetime EXP, with a cost of 3 coins per training session
- Achievement badges are unlocked as lifetime EXP increases

Each training action:

- Increases the selected horse’s EXP
- Also increases the user’s lifetime EXP
- Achievements are calculated using User.total_exp

This ensures:

- Achievements never decrease
- Progress reflects total effort rather than current inventory
- A more realistic and user-friendly progression system

## Links to Graphics used in this project
- https://unsplash.com/photos/yellow-and-white-star-illustration-ZdqSuxl3Lak (badge.jpg)
- https://unsplash.com/photos/a-man-running-across-a-field-on-a-sunny-day-UFs5bKHgo4U (challenge.png)
- gacha.png was designed by me.
- gachapull.png was designed by me.
- https://unsplash.com/photos/man-riding-horse-in-race-IojCPQ2rWe8 (horseHero.jpg)
- https://unsplash.com/photos/girl-in-blue-jacket-holding-brown-horse-9ABBDJRVQ80 (myHorses.jpg)
- https://unsplash.com/photos/man-in-white-shirt-riding-brown-horse-during-daytime-vr7-UdiKQMU (register.jpg)


## Conclusion
This project extends the CA1 Wellness Challenge API into a complete interactive web application with authentication, frontend integration, and persistent gamified progression. It demonstrates the use of MVC architecture, relational database design, JWT-based authentication, and user-focused game mechanics.