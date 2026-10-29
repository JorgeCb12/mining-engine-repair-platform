from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from dependencies import verify_token
from services import cliente_service

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"],
    dependencies=[Depends(verify_token)],
)


@router.post("/", response_model=schemas.ClienteResponse, status_code=201)
def crear_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    return cliente_service.create(db, cliente)


@router.get("/", response_model=List[schemas.ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    return cliente_service.get_all(db)


@router.get("/{cliente_id}", response_model=schemas.ClienteResponse)
def obtener_cliente(cliente_id: str, db: Session = Depends(get_db)):
    return cliente_service.get_by_id(db, cliente_id)


@router.put("/{cliente_id}", response_model=schemas.ClienteResponse)
def actualizar_cliente(
    cliente_id: str, datos: schemas.ClienteCreate, db: Session = Depends(get_db)
):
    return cliente_service.update(db, cliente_id, datos)
