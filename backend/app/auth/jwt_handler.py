import time
from datetime import datetime, timedelta
import jwt
from decouple import config
from typing import Dict

SECRET_KEY = "FITFLOW_SECRET_KEY"  
ALGORITHM = "HS256"

JWT_SECRET = config("JWT_SECRET", default="supersecretkey")  # store securely in .env
JWT_ALGORITHM = "HS256"

def token_response(token: str):
    return {"access_token": token}

def signJWT(user_id: str) -> Dict[str, str]:
    payload = {
        "user_id": user_id,
        "expires": time.time() + 3600  # 1 hour expiry
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token}

def decodeJWT(token: str):
    try:
        # ✅ Ensure token is bytes
        if isinstance(token, str):
            token = token.encode()

        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print("🔍 Decoded JWT payload:", decoded_token)

        if decoded_token["expires"] >= datetime.utcnow().timestamp():
            return decoded_token
        return None
    except Exception as e:
        print("❌ JWT Decode error:", e)
        return None

