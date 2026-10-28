from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from datetime import datetime
import uuid
from database import Base


class Cliente(Base):
    __tablename__ = "clientes"
    __table_args__ = {
        "schema": "business"
    }  # <-- AQUÍ LE DECIMOS QUE USE EL ESQUEMA BUSINESS

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    razon_social = Column(String, nullable=False)
    tipo_identificacion = Column(String, nullable=False)
    numero_identificacion = Column(String, unique=True, nullable=False)
    contacto_nombre = Column(String, nullable=False)
    contacto_email = Column(String, nullable=False)
    contacto_telefono = Column(String, nullable=False)
    ubicacion = Column(String, nullable=False)
    estado_activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
