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
