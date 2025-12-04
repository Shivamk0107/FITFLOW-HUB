# FitFlow Hub Project

This repository contains the complete source code for the FitFlow Hub application, an AI-powered fitness trainer. The project is organized into two main parts: a React frontend and a Python (FastAPI) backend.

## Project Structure

```
fitflow-hub/
├── frontend/         # React application source code
├── backend/          # FastAPI application source code
└── README.md         # This file
```

- **`/frontend`**: A modern React application built with TypeScript. It handles the user interface, camera access, and communication with the backend via WebSockets.
- **`/backend`**: A Python application using the FastAPI framework. It provides a WebSocket endpoint that receives video frames, processes them using MediaPipe and OpenCV for exercise detection, and sends back real-time data like rep counts and form status.

---

## How to Run Locally

### Prerequisites

1.  **Python:** Version 3.8 or newer.
2.  **Node.js & npm:** Latest LTS version recommended.
3.  **Webcam:** A working webcam is required for the application to function.

### 1. Backend Setup

First, set up and run the Python server which handles the AI processing.

```bash
# 1. Navigate into the backend directory
cd backend

# 2. Create and activate a Python virtual environment
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Run the FastAPI server
# This will start the server on http://127.0.0.1:8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
**Leave this terminal window running.**

### 2. Frontend Setup

Next, in a **new terminal window**, set up and run the React development server.

```bash
# 1. Navigate into the frontend directory
cd frontend

# 2. Install a simple web server if you don't have one
# We use 'live-server' for its simplicity with this project's setup.
npm install -g live-server

# 3. Run the live server
live-server
```
This command will automatically open your web browser to the correct address, and the FitFlow Hub application will be running.

### 3. Using the App
- When you start a workout, the frontend will connect to your Python backend.
- Your browser will ask for permission to use your webcam. You must **Allow** it.
