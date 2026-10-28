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


@router.patch("/{orden_id}/estado", response_model=schemas.OrdenResponse)
def cambiar_estado(
    orden_id: str, req: schemas.CambioEstadoRequest, db: Session = Depends(get_db)
):
    orden = (
        db.query(models.OrdenReparacion)
        .filter(models.OrdenReparacion.id == orden_id)
        .first()
    )
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    estado_anterior = orden.estado_actual
    orden.estado_actual = req.estado_nuevo

    # Guardamos en el historial
    historial = models.HistorialEstado(
        orden_id=orden.id,
        estado_anterior=estado_anterior,
        estado_nuevo=req.estado_nuevo,
        usuario_id="admin",
        comentario=req.comentario,
    )
    db.add(historial)
    db.commit()
    db.refresh(orden)
    return orden


@router.get("/{orden_id}", response_model=schemas.OrdenResponse)
def obtener_orden(orden_id: str, db: Session = Depends(get_db)):
    orden = (
        db.query(models.OrdenReparacion)
        .filter(models.OrdenReparacion.id == orden_id)
        .first()
    )
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden


@router.get(
    "/{orden_id}/historial", response_model=List[schemas.HistorialResponse]
)
def obtener_historial_orden(orden_id: str, db: Session = Depends(get_db)):
    historial = (
        db.query(models.HistorialEstado)
        .filter(models.HistorialEstado.orden_id == orden_id)
        .order_by(models.HistorialEstado.timestamp)
        .all()
    )
    return historial
