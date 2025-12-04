from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    MONGO_URL = ""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["fitflowhub"]
    print(await db.list_collection_names())

asyncio.run(test_connection())
