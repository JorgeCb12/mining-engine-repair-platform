from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from repositories import cliente_repo


def create(db: Session, data: schemas.ClienteCreate) -> models.Cliente:
    if cliente_repo.get_by_numero_identificacion(db, data.numero_identificacion):
        raise HTTPException(
            status_code=400,
            detail="El cliente con este número de identificación ya existe",
        )
    return cliente_repo.create(db, models.Cliente(**data.model_dump()))


def get_all(db: Session) -> list[models.Cliente]:
    return cliente_repo.get_all(db)


def get_by_id(db: Session, cliente_id: str) -> models.Cliente:
    cliente = cliente_repo.get_by_id(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


def update(
    db: Session, cliente_id: str, data: schemas.ClienteCreate
) -> models.Cliente:
    cliente = get_by_id(db, cliente_id)
    return cliente_repo.update(db, cliente, data.model_dump())
