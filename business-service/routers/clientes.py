from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from dependencies import verify_token

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"],
    dependencies=[Depends(verify_token)],
)


@router.post("/", response_model=schemas.ClienteResponse, status_code=201)
def crear_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):

    existe = (
        db.query(models.Cliente)
        .filter(models.Cliente.numero_identificacion == cliente.numero_identificacion)
        .first()
    )
    if existe:
        raise HTTPException(
            status_code=400,
            detail="El cliente con este número de identificación ya existe",
        )

    nuevo_cliente = models.Cliente(**cliente.model_dump())
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return nuevo_cliente


@router.get("/", response_model=List[schemas.ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(models.Cliente).all()
