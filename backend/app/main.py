from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.ai_trainer import (
    squats, lunges, stepup, wallsits, calfraise, plank, pushups,
    crunches, bicepcurls, tricepdips, jumpingjacks, mountainclimbers,
    jumprope, highknee, buttkicks
)
from app.utils.pose_estimation import PoseEstimator
from app.utils.feedback_generator import FeedbackGenerator
from app.routes import auth_routes, user_routes, workout_routes, progress_routes




import json
import importlib
import traceback

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI(title="FitFlow Hub Backend")

# CORS: pass the list directly (not [origins])
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(workout_routes.router)
# Register any routers that exist in the modules (if modules have routers)
modules = [
    squats, lunges, stepup, wallsits, calfraise, plank, pushups,
    crunches, bicepcurls, tricepdips, jumpingjacks, mountainclimbers,
    jumprope, highknee, buttkicks
]

for m in modules:
    # include router if module defines one
    if hasattr(m, "router"):
        try:
            app.include_router(m.router)
        except Exception:
            print(f"Could not include router for module {m}: {traceback.format_exc()}")

# Init utilities
pose_estimator = PoseEstimator()
feedback_generator = FeedbackGenerator()

@app.get("/")
async def root():
    return {"message": "FitFlow Hub Backend Running ✅"}

# Unified websocket handler
@app.websocket("/ws/ai_trainer/{exercise_name}")
async def websocket_endpoint(websocket: WebSocket, exercise_name: str):
    await websocket.accept()
    try:
        # Normalize name (remove spaces, lower)
        normalized_name = exercise_name.replace(" ", "").lower()

        # Try to get module from imported globals or import dynamically
        trainer_module = globals().get(normalized_name)
        if trainer_module is None:
            try:
                trainer_module = importlib.import_module(f"app.ai_trainer.{normalized_name}")
            except Exception:
                await websocket.send_text(json.dumps({"error": f"Unknown exercise: {exercise_name}"}))
                return

        
        # Determine what API the module exposes:
        # Prefer process_pose(landmarks) if present, else process_frame(frame_b64)
        if hasattr(trainer_module, "process_pose"):
            mode = "pose"
        elif hasattr(trainer_module, "process_frame"):
            mode = "frame"
        else:
            await websocket.send_text(json.dumps({"error": f"Trainer module for {exercise_name} missing process_pose/process_frame"}))
            return

        await websocket.send_text(json.dumps({"status": f"✅ Connected to {exercise_name} trainer"}))

        # Loop: receive JSON frames like { "frame": "data:image/jpeg;base64,..." }
        while True:
            try:
                data_text = await websocket.receive_text()
            except WebSocketDisconnect:
                print(f"❌ Disconnected: {exercise_name}")
                break
            except Exception:
                # connection closed or not text
                print(f"Receive error for {exercise_name}", traceback.format_exc())
                break

            if not data_text:
                continue

            # try parse JSON
            try:
                payload = json.loads(data_text)
            except Exception:
                # If not JSON, try interpret as direct data url string
                payload = {"frame": data_text}

            frame_b64 = None
            landmarks = None

            if isinstance(payload, dict) and payload.get("frame"):
                frame_b64 = payload.get("frame")
                # If the trainer expects landmarks (process_pose), use pose_estimator to extract them
                if mode == "pose":
                    try:
                        # PoseEstimator should expose a method that takes base64 image (data URL) and returns landmarks dict.
                        landmarks = pose_estimator.estimate_from_data_url(frame_b64)
                    except Exception:
                        # try to fallback to no landmarks
                        landmarks = {}
                else:
                    # mode == "frame" -> we can call process_frame directly with frame_b64
                    landmarks = None
            elif isinstance(payload, dict) and payload.get("landmarks"):
                landmarks = payload.get("landmarks")

            try:
                if mode == "pose":
                    # call module.process_pose(landmarks)
                    feedback = trainer_module.process_pose(landmarks or {})
                else:
                    # call module.process_frame(frame_b64) -- trainer returns dict or JSON-serializable
                    feedback = trainer_module.process_frame(frame_b64)
            except Exception as e:
                print("Error processing frame/pose:", traceback.format_exc())
                feedback = {"error": str(e)}

            # Send back JSON result
            try:
                await websocket.send_text(json.dumps(feedback))
            except Exception:
                # If send fails, break the loop
                print("Failed to send feedback or connection closed.")
                break

    except Exception:
        print("Unexpected error in websocket handler:", traceback.format_exc())
        try:
            await websocket.close()
        except Exception:
            pass
