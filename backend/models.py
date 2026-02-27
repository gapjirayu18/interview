from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from backend.database import Base

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    is_admin = Column(Boolean, default=False)

class AppointmentDB(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    purpose = Column(String)
    startime = Column(DateTime)
    endtime = Column(DateTime)
    