# Questify 🎯


A social goal-tracking platform that helps you stay motivated, build winning streaks, and achieve your goals with friends. Whether you're trying to hit daily habits or complete long-term objectives, Questify makes it fun, social, and rewarding.


## What's This All About?


Questify is a web app designed to help you accomplish your goals while staying connected with friends. You can:
- Set daily and weekly goals that matter to you
- Track your progress and build impressive streaks
- Earn points and unlock badges for achievements
- Compete on leaderboards with friends
- Send encouragement nudges powered by AI
- Share your wins with your social circle


Think of it like a gym buddy, but for all your goals, whether that's fitness, learning, productivity, or personal growth.


## Features


### 📊 Goal Management
- Create goals with descriptions and deadlines
- Track daily and weekly commitments
- See your progress at a glance with visual progress bars
- Get notifications when you complete tasks


### 🔥 Streaks & Motivation
- Build streaks by completing goals consistently
- Your current and longest streaks are displayed on your dashboard
- Streaks reset if you miss a day
- Visual streak counters keep you motivated


### 🏆 Gamification
- Earn points for completing goals
- Unlock badges for hitting milestones
- Monthly leaderboards to see how you stack up against friends
- Special achievements for consistent performance


### 👥 Social Features
- Add friends and view their progress
- Send AI-powered encouragement nudges
- See what your friends are working on
- Celebrate wins together on the leaderboard
- Get inspired by friends' activity feeds


### 🤖 AI-Powered Nudges
- Get personalized encouragement messages
- Send supportive nudges to friends working on goals
- Powered by Google's Gemini AI for personalized motivation




## Project Structure


```
Questify/
├── backend/              # Node.js + Express API
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── db/              # Database config & schema
│   ├── middleware/      # Authentication & middleware
│   ├── cron/            # Scheduled tasks (streaks, resets)
│   └── server.js        # Main server file
│
├── frontend/            # React web app
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Full page views
│   │   └── App.js       # Main app component
│   └── public/          # Static files
│
└── README.md            # This file
```


## How It Works


### Creating Goals
1. Log in or sign up
2. Go to the Goals page
3. Create a new goal with a title, description, frequency (daily/weekly), and deadline
4. Start tracking your progress


### Building Streaks
- Each time you complete a goal, your streak increases
- If you miss a day, your streak resets (so stay consistent!)
- Your longest streak is recorded forever


### Earning Points & Badges
- Complete tasks → earn points
- Hit milestones → unlock badges
- Points contribute to monthly leaderboards


### Social Features
- Find friends and add them
- View their goals and progress on Friend Feed
- Send encouragement nudges when they're working on goals
- Compete on the monthly leaderboard


## API Endpoints


The backend provides these main routes:


- **Auth** — `/api/auth` — Register, login, logout
- **Goals** — `/api/goals` — Create, read, update, delete goals
- **Leaderboard** — `/api/leaderboard` — View rankings
- **Social** — `/api/social` — Friends, nudges, feeds
- **Gamification** — `/api/gamification` — Badges, points, streaks


## Database Overview


The app uses PostgreSQL with these main tables:


- **users** — Account info, streaks, points
- **goals** — User-created goals with details
- **task_completions** — Records when goals are completed
- **badges** — Unlocked achievements
- **friendships** — Connections between users
- **nudges** — Encouragement messages
- **monthly_leaderboard** — Current month rankings


## Tech Stack


**Backend:**
- Node.js + Express (server)
- PostgreSQL (database)
- Bcrypt (password hashing)
- Google Generative AI (nudges)
- Node-cron (scheduled tasks)


**Frontend:**
- React (UI framework)
- React Router (navigation)
- CSS (styling)




---


**Built with ❤️ to help you achieve your goals**
