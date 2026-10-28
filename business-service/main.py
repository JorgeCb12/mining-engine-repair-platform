from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine, Base
from routers import clientes, motores

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Business Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(motores.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "business-service"}
