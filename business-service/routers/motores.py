from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from dependencies import verify_token

router = APIRouter(
    prefix="/motores", tags=["Motores"], dependencies=[Depends(verify_token)]
)


@router.post("/", response_model=schemas.MotorResponse, status_code=201)
def crear_motor(motor: schemas.MotorCreate, db: Session = Depends(get_db)):
    # Validar cliente propietario
    cliente = (
        db.query(models.Cliente)
        .filter(models.Cliente.id == motor.cliente_propietario_id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente propietario no existe")

    existe = (
        db.query(models.Motor)
        .filter(models.Motor.numero_serie == motor.numero_serie)
        .first()
    )
    if existe:
        raise HTTPException(
            status_code=400, detail="Ya existe un motor con este número de serie"
        )

    nuevo_motor = models.Motor(**motor.model_dump())
    db.add(nuevo_motor)
    db.commit()
    db.refresh(nuevo_motor)
    return nuevo_motor


@router.get("/", response_model=List[schemas.MotorResponse])
def listar_motores(db: Session = Depends(get_db)):
    return db.query(models.Motor).all()


@router.get("/{motor_id}", response_model=schemas.MotorResponse)
def obtener_motor(motor_id: str, db: Session = Depends(get_db)):
    motor = db.query(models.Motor).filter(models.Motor.id == motor_id).first()
    if not motor:
        raise HTTPException(status_code=404, detail="Motor no encontrado")
    return motor
