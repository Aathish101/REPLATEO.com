# Replateo (Web)

A food donation platform with AI-powered safety analysis.

## Project Structure

*   **Frontend**: React + Vite (Root directory) - Handles the UI and user interactions.
*   **Backend**: Node.js + Express (`./backend` directory) - Handles API requests, AI analysis (Gemini), and logging.

## Getting Started

You need to run **both** the frontend and backend servers for the application to work correctly (especially the "Donate Food" feature).

### 1. Start the Backend

The backend runs on port `5000`.

```bash
cd backend
npm install   # (First time only)
node server.js
```

### 2. Start the Frontend

The frontend runs on port `5173` (default).

Open a **new terminal window** in the root directory:

```bash
npm install   # (First time only)
npm run dev
```

### 3. Usage

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

*   **Donate Food**: Snap a picture of food, providing prep/package times.
*   **AI Safety Check**: The backend analyzes the image using Google Gemini to determine if it's safe for donation according to FSSAI guidelines.
*   **Listings**: Browse available food donations.

## Configuration

The backend requires a `.env` file in the `backend/` directory with the following keys:

*   `GEMINI_API_KEY`: Google Gemini API Key
*   `PORT`: 5000