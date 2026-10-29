from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from datetime import datetime, timezone
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
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Motor(Base):
    __tablename__ = "motores"
    __table_args__ = {"schema": "business"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    codigo_interno = Column(String, nullable=False)
    numero_serie = Column(String, unique=True, nullable=False)
    fabricante = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    tipo_motor = Column(String, nullable=False)
    potencia_hp = Column(Integer, nullable=False)
    horas_de_uso = Column(Integer, default=0)
    ubicacion_actual = Column(String, nullable=False)
    cliente_propietario_id = Column(
        String, ForeignKey("business.clientes.id"), nullable=False
    )
    estado_activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class OrdenReparacion(Base):
    __tablename__ = "ordenes_reparacion"
    __table_args__ = {"schema": "business"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    numero_orden = Column(String, unique=True, nullable=False)
    motor_id = Column(String, ForeignKey("business.motores.id"), nullable=False)
    cliente_id = Column(String, ForeignKey("business.clientes.id"), nullable=False)
    estado_actual = Column(
        String, default="recibido"
    )  # recibido, en_diagnostico, esperando_aprobacion, en_reparacion, en_pruebas, finalizado, entregado
    descripcion_falla = Column(String, nullable=False)
    diagnostico = Column(String, nullable=True)
    trabajos_realizados = Column(String, nullable=True)
    costo_estimado = Column(
        String, nullable=True
    )  # Puedes usar Float/Numeric si prefieres
    fecha_recepcion = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_estimada_entrega = Column(DateTime, nullable=True)
    usuario_asignado_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class HistorialEstado(Base):
    __tablename__ = "historial_estados"
    __table_args__ = {"schema": "business"}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    orden_id = Column(
        String, ForeignKey("business.ordenes_reparacion.id"), nullable=False
    )
    estado_anterior = Column(String, nullable=False)
    estado_nuevo = Column(String, nullable=False)
    usuario_id = Column(String, nullable=False)
    comentario = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
