# Gym Log - Personalized Workout Tracker

A modern, highly polished, and responsive full-stack fitness application built with **React**, **Vite**, **Tailwind CSS**, and **Firebase (Firestore & Authentication)**. This application serves as a dedicated platform for users to design workout splits, log active sessions, track progress metrics, and view detailed historic workout analytics.

---

## 🚀 Key Features

*   **Secure Authentication**: Single-click secure Google/Gmail sign-in.
*   **Durable Cloud Synchronization**: Your personalized workout schedules, active templates, and logging histories are synced in real-time with Firestore.
*   **Custom Workout Designer**: Create, customize, and save your own routines, movements, target splits, and plans.
*   **Active Session Logger**: Interactive real-time tracker for live workouts featuring an integrated rest timer, dynamic set validation, weight/rep logs, and automated volume calculations.
*   **Personalized User Profile**: 
    *   Upload custom profile photos/avatars directly.
    *   Log physical stats such as weight and height.
    *   Specify key goals (e.g., Hypertrophy, Peak Power & Strength) using a custom-crafted dark UI dropdown matching the app's aesthetic.
    *   Unified dashboard to safely manage login credentials, settings, and secure sign-out.
*   **Offline Resilience**: In-memory caching ensures transitions are instant, fluent, and highly responsive.

---

## 🛠️ Architecture & Stack

*   **Frontend Library**: React (v18+) with TypeScript
*   **Build Tool**: Vite for fast bundling and hot module management
*   **Styling Engine**: Tailwind CSS with custom theme attributes and animations powered by `motion`
*   **Database & Auth**: Firebase Firestore (durable cloud state) and Firebase Auth
*   **Visual Assets & Icons**: Lucide React and custom SVG illustrations

---

## 📁 Directory Structure

```text
├── src/
│   ├── components/         # Interactive UI screens, modals, trackers and chart visuals
│   │   ├── ActiveWorkoutScreen.tsx
│   │   ├── BottomNav.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── UserProfileModal.tsx   # Profile stats, custom photo uploads & Goal inputs
│   │   └── ...
│   ├── context/            # Shared React context modules (State Management)
│   │   ├── AuthContext.tsx       # Manages user authentication & reactive Firestore profile sync
│   │   └── WorkoutContext.tsx    # Handles workout session state, active timers, and volume metrics
│   ├── utils/              # Helper utility functions & data formatters
│   ├── firebase.ts         # Firebase App configuration and initializations
│   ├── App.tsx             # Main routing shell and primary application frame
│   └── index.css           # Global typography rules & custom Tailwind styles
├── package.json            # Dependencies and terminal runscripts
└── README.md               # Project documentation
```

---

## 🎯 Getting Started & Development

1.  **Install Base Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Local Dev Server**:
    ```bash
    npm run dev
    ```
    The application will launch on your local port (defaulting to port `3000`).

3.  **Build Production Bundle**:
    ```bash
    npm run build
    ```
