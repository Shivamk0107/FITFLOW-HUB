class FeedbackGenerator:
    def generate_feedback(self, exercise_name, reps, form_score):
        tips = {
            "squats": "Maintain knee alignment with toes.",
            "bicepcurls": "Keep elbows tucked in.",
            "crunches": "Avoid pulling your neck."
        }
        return {
            "tip": tips.get(exercise_name, "Good work! Keep going."),
            "form_score": form_score,
            "reps": reps
        }
