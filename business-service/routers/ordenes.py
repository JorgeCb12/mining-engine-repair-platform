from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from database import get_db
from dependencies import verify_token
from services import orden_service

router = APIRouter(
    prefix="/ordenes", tags=["Órdenes"], dependencies=[Depends(verify_token)]
)


@router.post("/", response_model=schemas.OrdenResponse, status_code=201)
def crear_orden(orden: schemas.OrdenCreate, db: Session = Depends(get_db)):
    return orden_service.create(db, orden)


@router.get("/", response_model=List[schemas.OrdenResponse])
def listar_ordenes(db: Session = Depends(get_db)):
    return orden_service.get_all(db)


@router.patch("/{orden_id}/estado", response_model=schemas.OrdenResponse)
def cambiar_estado(
    orden_id: str, req: schemas.CambioEstadoRequest, db: Session = Depends(get_db)
):
    return orden_service.change_status(db, orden_id, req)


@router.get("/{orden_id}", response_model=schemas.OrdenResponse)
def obtener_orden(orden_id: str, db: Session = Depends(get_db)):
    return orden_service.get_by_id(db, orden_id)


@router.get(
    "/{orden_id}/historial", response_model=List[schemas.HistorialResponse]
)
def obtener_historial_orden(orden_id: str, db: Session = Depends(get_db)):
    return orden_service.get_history(db, orden_id)
