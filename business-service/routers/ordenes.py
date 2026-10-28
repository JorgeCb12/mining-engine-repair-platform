from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from dependencies import verify_token

router = APIRouter(
    prefix="/ordenes", tags=["Órdenes"], dependencies=[Depends(verify_token)]
)


@router.post("/", response_model=schemas.OrdenResponse, status_code=201)
def crear_orden(orden: schemas.OrdenCreate, db: Session = Depends(get_db)):
    # Verificamos que el motor y el cliente existan
    motor = db.query(models.Motor).filter(models.Motor.id == orden.motor_id).first()
    if not motor:
        raise HTTPException(status_code=404, detail="Motor no encontrado")

    total_ordenes = db.query(models.OrdenReparacion).count()
    numero_orden = f"ORD-{total_ordenes + 1:04d}"

    nueva_orden = models.OrdenReparacion(
        numero_orden=numero_orden, **orden.model_dump()
    )
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    return nueva_orden


@router.get("/", response_model=List[schemas.OrdenResponse])
def listar_ordenes(db: Session = Depends(get_db)):
    return db.query(models.OrdenReparacion).all()
