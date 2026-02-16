---
description: How to start the Replateo development servers (Frontend + Backend)
---

To run the full application, you need to start two separate terminals.

# 1. Start the Backend Server (Node.js)
The backend handles the AI food analysis and data logging.

1. Open a new terminal.
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. (First time only) Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   // turbo
   node server.js
   ```
   *You should see: "Starting Food Safety Analysis API (Node.js) on port 5000"*

# 2. Start the Frontend Server (React)
The frontend provides the user interface.

1. Open a second terminal.
2. Ensure you are in the root directory (where `package.json` and `vite.config.js` are).
3. (First time only) Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   // turbo
   npm run dev
   ```
   *You should see a localhost URL (e.g., http://localhost:5173)*

# 3. Access the Application
Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
