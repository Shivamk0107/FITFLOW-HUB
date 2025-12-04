class BaseTrainer:
    def __init__(self):
        self.reps = 0
        self.stage = None
        self.form_score = 0

    def calculate_angle(self, a, b, c):
        import math
        ba = (a['x'] - b['x'], a['y'] - b['y'])
        bc = (c['x'] - b['x'], c['y'] - b['y'])
        cosine_angle = (ba[0]*bc[0] + ba[1]*bc[1]) / (
            (ba[0]**2 + ba[1]**2)**0.5 * (bc[0]**2 + bc[1]**2)**0.5
        )
        return round(math.degrees(math.acos(max(-1, min(1, cosine_angle)))), 2)

    def process_pose(self, landmarks):
        raise NotImplementedError("Each trainer must implement process_pose()")
