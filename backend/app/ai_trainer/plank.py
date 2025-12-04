import cv2
import mediapipe as mp
import numpy as np
import base64
import time

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# 🔹 State variables
state = {"started": False, "start_time": None, "duration": 0, "in_position": False}

def reset_state():
    """Reset plank timer and state."""
    state["started"] = False
    state["start_time"] = None
    state["duration"] = 0
    state["in_position"] = False
    print("🔁 plank timer reset")

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def process_frame(frame_b64: str):
    """Accept base64 frame string, return annotated frame + duration + feedback"""
    try:
        if "," in frame_b64:
            frame_b64 = frame_b64.split(",")[1]

        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        frame = cv2.flip(frame, 1)

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        feedback = "Align body straight and stay visible"
        duration = state["duration"]

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)
            )

            landmarks = results.pose_landmarks.landmark

            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                          landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

            angle = calculate_angle(left_shoulder, left_hip, left_ankle)
            form_score = 100 - abs(angle - 180)

            # 🔹 If angle is close to 180°, start/continue timer
            if 165 <= angle <= 195:
                if not state["in_position"]:
                    state["in_position"] = True
                    if not state["started"]:
                        state["started"] = True
                        state["start_time"] = time.time()
                        print("🟢 Plank started")
                else:
                    state["duration"] = int(time.time() - state["start_time"])
                    feedback = "Hold steady! Core tight."
            else:
                if state["in_position"]:
                    feedback = "Posture lost! Timer paused."
                    state["in_position"] = False

            duration = state["duration"]

            # 🔹 Auto-reset after 45 seconds (1 set complete)
            if duration >= 45:
                feedback = "✅ 45s complete! Resetting..."
                reset_state()

            # Display info
            cv2.putText(frame, f"Time: {duration}s", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, feedback, (20, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64_out = base64.b64encode(buffer).decode('utf-8')

        return {
            "frame": frame_b64_out,
            "time": duration,
            "feedback": feedback
        }

    except Exception as e:
        return {"error": str(e)}
