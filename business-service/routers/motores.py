from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from dependencies import verify_token
from services import motor_service

router = APIRouter(
    prefix="/motores", tags=["Motores"], dependencies=[Depends(verify_token)]
)


@router.post("/", response_model=schemas.MotorResponse, status_code=201)
def crear_motor(motor: schemas.MotorCreate, db: Session = Depends(get_db)):
    return motor_service.create(db, motor)


@router.get("/", response_model=List[schemas.MotorResponse])
def listar_motores(db: Session = Depends(get_db)):
    return motor_service.get_all(db)


@router.get("/{motor_id}", response_model=schemas.MotorResponse)
def obtener_motor(motor_id: str, db: Session = Depends(get_db)):
    return motor_service.get_by_id(db, motor_id)
