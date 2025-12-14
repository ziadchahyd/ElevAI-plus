from fastapi import APIRouter

router = APIRouter(tags=["data"])

@router.post("/data")
def add_daily_data():
    # TODO: store daily record (sleep, steps, etc.)
    return {
        "message": "POST /data not implemented yet",
        "next": "Implement daily data storage + validation"
    }

@router.get("/data/{user_id}")
def get_user_data(user_id: int, from_: str | None = None, to: str | None = None):
    # NOTE: 'from' est un mot réservé Python -> on l'appelle from_
    # TODO: fetch data for user_id, optionally filter by date range
    return {
        "message": "GET /data/{user_id} not implemented yet",
        "user_id": user_id,
        "from": from_,
        "to": to
    }
