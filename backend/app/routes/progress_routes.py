from fastapi import APIRouter, HTTPException, Depends, Body
from app.auth.auth_bearer import JWTBearer
from app.auth.jwt_handler import decodeJWT
from app.database import users_collection, progress_collection
from app.models import ProgressEntry, UserProgress
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/progress", tags=["Progress"])

# --- Utility to serialize MongoDB object ---
def serialize_progress(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# 🔹 Save or update progress (NEW ROUTE)
@router.post("/save")
async def save_progress(entry: ProgressEntry, token: dict = Depends(JWTBearer())):
    try:
        user_id = token.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Attach token user_id (for safety)
        entry.user_id = user_id
        entry.timestamp = datetime.utcnow()

        # 1️⃣ Insert this individual progress record
        await progress_collection.insert_one(entry.dict())

        # 2️⃣ Fetch or initialize user’s overall progress
        existing_progress = await progress_collection.find_one({"user_id": user_id, "summary": True})
        if not existing_progress:
            existing_progress = {
                "user_id": user_id,
                "summary": True,
                "steps": 0,
                "caloriesBurned": 0.0,
                "dailyActivity": {"workoutTime": 0.0, "cardioTime": 0.0},
                "workoutHistory": [],
                "weeklyHighlights": {"streak": 0.0, "caloriesBurned": 0.0},
                "calendarHeatmapData": {},
                "strengthData": {"labels": [], "datasets": []},
                "lastUpdated": datetime.utcnow()
            }

        # 3️⃣ Update totals
        existing_progress["steps"] += entry.count
        existing_progress["caloriesBurned"] += round(entry.count * 0.5, 2)  # estimate: 0.5 cal per rep
        existing_progress["dailyActivity"]["workoutTime"] += round(entry.count * 0.2, 2)  # 0.2 min per count

        # 4️⃣ Add to workout history
        history_item = {
            "exercise": entry.exercise,
            "count": entry.count,
            "feedback": entry.feedback or "",
            "timestamp": entry.timestamp.isoformat()
        }
        existing_progress["workoutHistory"].append(history_item)

        # 5️⃣ Update the progress summary document
        await progress_collection.update_one(
            {"user_id": user_id, "summary": True},
            {"$set": existing_progress},
            upsert=True
        )

        return {"status": "success", "message": "Progress saved successfully"}

    except Exception as e:
        print("❌ Error in /progress/save route:", e)
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Fetch all progress for a user
@router.get("/user-progress")
async def get_user_progress(token: dict = Depends(JWTBearer())):
    try:
        print("🔍 user_data in route:", token)
        user_id = token.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Check if user exists
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get progress document for this user
        progress = await progress_collection.find_one({"user_id": user_id})
        if not progress:
            # Initialize a blank one
            progress = {
                "user_id": user_id,
                "totalWorkouts": 0,
                "totalCalories": 0.0,
                "totalDuration": 0.0,
                "totalExercises": 0,
                "streakDays": 0,
                "weeklyData": [],
                "lastUpdated": datetime.utcnow()
            }
            await progress_collection.insert_one(progress)

        progress["_id"] = str(progress["_id"])
        return {"status": "success", "data": progress}

    except Exception as e:
        print("❌ Error in /user-progress route:", e)
        raise HTTPException(status_code=500, detail=str(e))



# 🔹 Reset progress
@router.delete("/{user_id}", dependencies=[Depends(JWTBearer())])
async def reset_progress(user_id: str):
    result = await progress_collection.delete_many({"user_id": user_id})
    return {"deleted": result.deleted_count}
