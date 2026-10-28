from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ClienteBase(BaseModel):
    razon_social: str
    tipo_identificacion: str
    numero_identificacion: str
    contacto_nombre: str
    contacto_email: str
    contacto_telefono: str
    ubicacion: str


class ClienteCreate(ClienteBase):
    pass


class ClienteResponse(ClienteBase):
    id: str
    estado_activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MotorBase(BaseModel):
    codigo_interno: str
    numero_serie: str
    fabricante: str
    modelo: str
    tipo_motor: str
    potencia_hp: int
    horas_de_uso: int = 0
    ubicacion_actual: str
    cliente_propietario_id: str


class MotorCreate(MotorBase):
    pass


class MotorResponse(MotorBase):
    id: str
    estado_activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
