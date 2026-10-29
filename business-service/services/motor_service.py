from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from repositories import cliente_repo, motor_repo


def create(db: Session, data: schemas.MotorCreate) -> models.Motor:
    if not cliente_repo.get_by_id(db, data.cliente_propietario_id):
        raise HTTPException(status_code=404, detail="Cliente propietario no existe")
    if motor_repo.get_by_numero_serie(db, data.numero_serie):
        raise HTTPException(
            status_code=400, detail="Ya existe un motor con este número de serie"
        )
    return motor_repo.create(db, models.Motor(**data.model_dump()))


def get_all(db: Session) -> list[models.Motor]:
    return motor_repo.get_all(db)


def get_by_id(db: Session, motor_id: str) -> models.Motor:
    motor = motor_repo.get_by_id(db, motor_id)
    if not motor:
        raise HTTPException(status_code=404, detail="Motor no encontrado")
    return motor
