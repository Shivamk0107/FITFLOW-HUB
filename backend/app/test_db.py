from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    MONGO_URL = "mongodb+srv://fitflowuser:Fitflow123@fitflowhub.qwert.mongodb.net/fitflowhub"
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["fitflowhub"]
    print(await db.list_collection_names())

asyncio.run(test_connection())
