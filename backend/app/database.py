import json, os
# app/database.py
from motor.motor_asyncio import AsyncIOMotorClient

DB_FILE = "db.json"
def read_db():
    if not os.path.exists(DB_FILE):
        return {"users": [], "workouts": []}
    with open(DB_FILE, "r") as f:
        return json.load(f)
    
def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ✅ Correct MongoDB Atlas connection string (with credentials)
MONGO_URL = ""

# Initialize the client
client = AsyncIOMotorClient(MONGO_URL)

# Database name
db = client["fitflow"]

# Users collection
users_collection = db["users"]
progress_collection = db["progress"]  # 👈 new collection


print("✅ Connected to MongoDB Atlas successfully!")
