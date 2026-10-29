from sqlalchemy.orm import Session

import models


def get_by_id(db: Session, motor_id: str) -> models.Motor | None:
    return db.query(models.Motor).filter(models.Motor.id == motor_id).first()


def get_by_numero_serie(db: Session, numero_serie: str) -> models.Motor | None:
    return (
        db.query(models.Motor)
        .filter(models.Motor.numero_serie == numero_serie)
        .first()
    )


def get_all(db: Session) -> list[models.Motor]:
    return db.query(models.Motor).all()


def create(db: Session, motor: models.Motor) -> models.Motor:
    db.add(motor)
    db.commit()
    db.refresh(motor)
    return motor
