from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine, Base
from routers import clientes  # <-- Importamos las rutas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Business Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos las rutas
app.include_router(clientes.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "business-service"}
