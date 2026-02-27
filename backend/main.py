from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, List
from sqlalchemy.orm import Session
from backend.database import Base, engine, get_db
from backend.models import UserDB, AppointmentDB
from backend.schemas import User, UserCreate, UserLoginRequest, UserLoginResponse, UserResponse, AppointmentCreate, AppointmentResponse
from backend.password import create_access_token, authenticate_user, get_current_user, password_hash
from datetime import timedelta


ACCESS_TOKEN_EXPIRE_MINUTES = 30
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/signup/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = password_hash.hash(user.password)
    db_user = UserDB(username=user.username, password=hashed_password, is_admin=user.is_admin)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/signin/", response_model=UserLoginResponse)
async def read_items(user: UserLoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not authenticate_user(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
    
# Read: all appointment
@app.get("/appointments", response_model=List[AppointmentResponse])
async def read_item(current_user: Annotated[User, Depends(get_current_user)],db: Session = Depends(get_db)):
    if current_user.is_admin:
        db_items = db.query(AppointmentDB, UserDB.username).join(UserDB, AppointmentDB.user_id == UserDB.id).all()
    else:
        print(current_user.id)
        db_items = db.query(AppointmentDB, UserDB.username).join(UserDB, AppointmentDB.user_id == UserDB.id).filter(AppointmentDB.user_id == current_user.id).all()
    if db_items is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    result = []
    for appointment, username in db_items:
        result.append({
            "id": appointment.id,
            "startime": appointment.startime,
            "endtime": appointment.endtime,
            "purpose": appointment.purpose,
            "username": username
        })
    return result

# Create appointment
@app.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    db_item = AppointmentDB(user_id=current_user.id, startime=appointment.startime, endtime=appointment.endtime, purpose=appointment.purpose)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment: AppointmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    db_item = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if not current_user.is_admin and db_item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db_item.startime = appointment.startime
    db_item.endtime = appointment.endtime
    db_item.purpose = appointment.purpose

    db.commit()
    db.refresh(db_item)
    return db_item