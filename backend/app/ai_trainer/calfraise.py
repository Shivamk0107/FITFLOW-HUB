import cv2
import mediapipe as mp
import numpy as np
import base64

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# 🔹 State variables
state = {"count": 0, "direction": 0, "started": False}

def reset_state():
    """Reset counter and direction"""
    state["count"] = 0
    state["direction"] = 0
    state["started"] = False
    print("🔁 Calf Raise counter reset to 0")

def calculate_vertical_distance(a, b):
    """Helper to calculate vertical (y-axis) difference"""
    return abs(a[1] - b[1])

def process_frame(frame_b64: str):
    """Accept base64 frame string, return annotated frame + count + feedback"""
    try:
        # 🔹 Remove base64 header if present
        if "," in frame_b64:
            frame_b64 = frame_b64.split(",")[1]

        frame_bytes = base64.b64decode(frame_b64)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        frame = cv2.flip(frame, 1)

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        feedback = "Stay visible in frame"
        count = state["count"]

        # 🔹 Auto reset if starting new session
        if not state["started"]:
            reset_state()
        state["started"] = True

        # 🔹 Auto reset after completing one set (30 reps)
        if count >= 30:
            feedback = "Set complete! Resetting..."
            reset_state()
            count = 0

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)
            )

            landmarks = results.pose_landmarks.landmark

            # 🔹 Key body landmarks
            left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                          landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]

            # Measure vertical lift distance
            height_diff = calculate_vertical_distance(left_ankle, left_knee)

            # 🔹 Calf raise rep logic
            if height_diff > 0.15:  # Standing tall (heels lifted)
                feedback = "Hold the top position!"
                if state["direction"] == 0:
                    state["count"] += 1
                    state["direction"] = 1
            elif height_diff < 0.10:  # Lowered down
                feedback = "Go up slowly"
                if state["direction"] == 1:
                    state["direction"] = 0

            count = state["count"]

            # Display information
            cv2.putText(frame, f"Reps: {count}", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, feedback, (20, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        # Convert frame to base64 for frontend
        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64_out = base64.b64encode(buffer).decode('utf-8')

        return {
            "frame": frame_b64_out,
            "count": count,
            "feedback": feedback
        }

    except Exception as e:
        return {"error": str(e)}
