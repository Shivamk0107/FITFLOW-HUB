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
    print("🔁 jumpingjacks counter reset to 0")

def calculate_distance(a, b):
    """Calculate Euclidean distance between two points"""
    a = np.array(a)
    b = np.array(b)
    return np.linalg.norm(a - b)

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

        # 🔹 Auto reset after completing one set
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

            # Get key points for movement
            left_hand = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            right_hand = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

            left_foot = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            right_foot = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

            # Calculate average distance of hands and feet
            hand_distance = calculate_distance(left_hand, right_hand)
            foot_distance = calculate_distance(left_foot, right_foot)

            # 🔹 Rep logic for jumping jacks:
            # When both arms are up and legs apart → "up"
            # When both arms down and legs together → "down"
            if hand_distance < 0.25 and foot_distance < 0.15:
                feedback = "Jump and raise arms!"
                if state["direction"] == 1:
                    state["direction"] = 0
            elif hand_distance > 0.45 and foot_distance > 0.3:
                feedback = "Great form!"
                if state["direction"] == 0:
                    state["count"] += 1
                    state["direction"] = 1

            count = state["count"]

            # Overlay info
            cv2.putText(frame, f"Reps: {count}", (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, feedback, (20, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64_out = base64.b64encode(buffer).decode('utf-8')

        return {
            "frame": frame_b64_out,
            "count": count,
            "feedback": feedback
        }

    except Exception as e:
        return {"error": str(e)}
