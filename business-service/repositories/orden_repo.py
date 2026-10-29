from sqlalchemy.orm import Session

import models


def get_by_id(db: Session, orden_id: str) -> models.OrdenReparacion | None:
    return (
        db.query(models.OrdenReparacion)
        .filter(models.OrdenReparacion.id == orden_id)
        .first()
    )


def get_count(db: Session) -> int:
    return db.query(models.OrdenReparacion).count()


def get_all(db: Session) -> list[models.OrdenReparacion]:
    return db.query(models.OrdenReparacion).all()


def create(db: Session, orden: models.OrdenReparacion) -> models.OrdenReparacion:
    db.add(orden)
    db.commit()
    db.refresh(orden)
    return orden


def save_status_change(
    db: Session,
    orden: models.OrdenReparacion,
    historial: models.HistorialEstado,
) -> models.OrdenReparacion:
    db.add(historial)
    db.commit()
    db.refresh(orden)
    return orden


def get_history(db: Session, orden_id: str) -> list[models.HistorialEstado]:
    return (
        db.query(models.HistorialEstado)
        .filter(models.HistorialEstado.orden_id == orden_id)
        .order_by(models.HistorialEstado.timestamp)
        .all()
    )
