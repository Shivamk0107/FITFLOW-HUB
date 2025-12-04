from app.ai_trainer.base_trainer import BaseTrainer
from fastapi import APIRouter, WebSocket

router = APIRouter()

@router.websocket("/ws/ai_trainer/pushups")
async def pushups_socket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("✅ Connected to Push-Ups WebSocket.")
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Push-Ups: received {data}")
    except Exception:
        await websocket.close()

class Pushups(BaseTrainer):
    def process_pose(self, landmarks):
        try:
            left_shoulder = landmarks['leftShoulder']
            left_elbow = landmarks['leftElbow']
            left_wrist = landmarks['leftWrist']

            angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)

            if angle < 70:
                self.stage = 'down'
            if angle > 150 and self.stage == 'down':
                self.stage = 'up'
                self.reps += 1

            return {
                "exercise": "push-ups",
                "reps": self.reps,
                "form_score": 90,
                "feedback": "Keep elbows at 45° and avoid flaring out."
            }
        except Exception as e:
            return {"error": str(e)}
