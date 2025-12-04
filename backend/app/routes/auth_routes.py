from fastapi import APIRouter, HTTPException
from app.models import User, UserLogin
from app.auth.jwt_handler import signJWT
from app.database import users_collection
from typing import Dict
from passlib.context import CryptContext
from pydantic import BaseModel
import uuid, hashlib
from bson import ObjectId




router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Helper to clean MongoDB object (moved to top)
def serialize_user(user):
    """Convert MongoDB _id to string and remove password field."""
    user["_id"] = str(user["_id"])
    if "password" in user:
        del user["password"]
    return user


class User(BaseModel):
    fullname: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup")
async def signup(user: User):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pw

    result = await users_collection.insert_one(user_dict)
    new_user = await users_collection.find_one({"_id": result.inserted_id})
    return {"user": serialize_user(new_user), "token": signJWT(str(new_user["_id"]))}


# Login
@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"user": serialize_user(user), "token": signJWT(str(user["_id"]))}