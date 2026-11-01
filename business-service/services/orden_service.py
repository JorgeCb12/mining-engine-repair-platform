from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from repositories import motor_repo, orden_repo

TRANSICIONES_VALIDAS = {
    "recibido": ["en_diagnostico"],
    "en_diagnostico": ["esperando_aprobacion", "en_reparacion"],
    "esperando_aprobacion": ["en_reparacion"],
    "en_reparacion": ["en_pruebas"],
    "en_pruebas": ["finalizado"],
    "finalizado": ["entregado"],
    "entregado": [],
}


def create(db: Session, data: schemas.OrdenCreate) -> models.OrdenReparacion:
    if not motor_repo.get_by_id(db, data.motor_id):
        raise HTTPException(status_code=404, detail="Motor no encontrado")
    if orden_repo.get_orden_activa_by_motor(db, data.motor_id):
        raise HTTPException(
            status_code=400,
            detail="Este motor ya tiene una orden de reparación activa",
        )
    numero_orden = f"ORD-{orden_repo.get_count(db) + 1:04d}"
    orden = models.OrdenReparacion(numero_orden=numero_orden, **data.model_dump())
    return orden_repo.create(db, orden)


def get_all(db: Session) -> list[models.OrdenReparacion]:
    return orden_repo.get_all(db)


def change_status(
    db: Session, orden_id: str, data: schemas.CambioEstadoRequest
) -> models.OrdenReparacion:
    orden = orden_repo.get_by_id(db, orden_id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    estado_anterior = orden.estado_actual
    if data.estado_nuevo not in TRANSICIONES_VALIDAS.get(estado_anterior, []):
        raise HTTPException(status_code=400, detail="Transición de estado no válida")

    orden.estado_actual = data.estado_nuevo
    historial = models.HistorialEstado(
        orden_id=orden.id,
        estado_anterior=estado_anterior,
        estado_nuevo=data.estado_nuevo,
        usuario_id="admin",
        comentario=data.comentario,
    )
    return orden_repo.save_status_change(db, orden, historial)


def get_by_id(db: Session, orden_id: str) -> models.OrdenReparacion:
    orden = orden_repo.get_by_id(db, orden_id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden


def get_history(db: Session, orden_id: str) -> list[models.HistorialEstado]:
    return orden_repo.get_history(db, orden_id)
