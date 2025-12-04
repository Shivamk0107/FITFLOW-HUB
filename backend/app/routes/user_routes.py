# backend/app/routes/user_routes.py
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import users_collection
from passlib.context import CryptContext
from app.models import UserSignup, UserLogin
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.auth.jwt_handler import decodeJWT
from app.auth.jwt_handler import signJWT
from app.auth.auth_bearer import JWTBearer


router = APIRouter(prefix="/user", tags=["User"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def serialize_user(user):
    user["_id"] = str(user["_id"])
    if "password" in user:
        del user["password"]
    return user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserSignup(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    fitnessLevel: Optional[str] = None
    age: Optional[int] = None
    photo: Optional[str] = None

class LoginUser(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register_user(user: UserSignup):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password

    result = await users_collection.insert_one(user_dict)
    new_user = await users_collection.find_one({"_id": result.inserted_id})
    return serialize_user(new_user)


@router.post("/login")
async def login_user(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token_data = signJWT(str(user["_id"]))
    return {"user": serialize_user(user), "token": token_data["access_token"]}


@router.get("/{user_id}", dependencies=[Depends(JWTBearer())])
async def get_user(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


@router.put("/{user_id}")
async def update_user(user_id: str, updated_data: dict):
    # 🔹 Remove _id if sent accidentally
    if "_id" in updated_data:
        updated_data.pop("_id")

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)}, {"$set": updated_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    return serialize_user(updated_user)

@router.get("/me", dependencies=[Depends(JWTBearer())])
async def get_me(token: str = Depends(JWTBearer())):
    """Fetch the user details using the JWT token."""
    payload = decodeJWT(token)
    user_id = payload.get("user_id") or payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return serialize_user(user)

@router.get("/{user_id}", dependencies=[Depends(JWTBearer())])
async def get_user(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


# ---------------------------
# ✅ Update user (protected)
# ---------------------------
@router.put("/{user_id}", dependencies=[Depends(JWTBearer())])
async def update_user(user_id: str, updated_data: dict):
    if "_id" in updated_data:
        updated_data.pop("_id")

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)}, {"$set": updated_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    return serialize_user(updated_user)
