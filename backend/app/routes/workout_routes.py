from fastapi import APIRouter, Depends
from app.auth.auth_bearer import JWTBearer
from app.database import read_db, write_db
from app.models import WorkoutRecord
import uuid

router = APIRouter(prefix="/workouts", tags=["Workouts"])

@router.post("/", dependencies=[Depends(JWTBearer())])
def add_workout(workout: WorkoutRecord):
    db = read_db()
    workout.id = str(uuid.uuid4())
    db["workouts"].append(workout.dict())
    write_db(db)
    return {"message": "Workout added", "workout": workout}

@router.get("/{user_id}", dependencies=[Depends(JWTBearer())])
def get_user_workouts(user_id: str):
    db = read_db()
    user_workouts = [w for w in db["workouts"] if w["user_id"] == user_id]
    return {"workouts": user_workouts}