from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    username: str
    is_admin: Optional[bool] = False

class UserCreate(User):
    password: str

class UserResponse(User):
    id: int

    class Config:
        from_attributes = True

class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str

class Appointment(BaseModel):
    startime: datetime
    endtime: datetime
    purpose: str

class AppointmentCreate(Appointment):
    pass

class AppointmentResponse(Appointment):
    id: int
    username: str

    class Config:
        from_attributes = True