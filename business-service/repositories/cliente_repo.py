from sqlalchemy.orm import Session

import models


def get_by_id(db: Session, cliente_id: str) -> models.Cliente | None:
    return db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()


def get_by_numero_identificacion(
    db: Session, numero_identificacion: str
) -> models.Cliente | None:
    return (
        db.query(models.Cliente)
        .filter(models.Cliente.numero_identificacion == numero_identificacion)
        .first()
    )


def get_all(db: Session) -> list[models.Cliente]:
    return db.query(models.Cliente).all()


def create(db: Session, cliente: models.Cliente) -> models.Cliente:
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


def update(
    db: Session, cliente: models.Cliente, data: dict
) -> models.Cliente:
    for key, value in data.items():
        setattr(cliente, key, value)
    db.commit()
    db.refresh(cliente)
    return cliente
