# Decisiones de Arquitectura y Trade-offs
## 1. Validación de JWT y Acoplamiento
Para esta prueba técnica, se implementó una validación descentralizada de JWT (usando HS256 con un secreto compartido).
**El problema:** Si el sistema escala a más microservicios, cada uno tendría que duplicar la lógica de validación, y compartir el secreto es un riesgo.
**Solución a futuro:** Implementar un API Gateway (Kong/Nginx) para centralizar la validación, o migrar a criptografía asimétrica (RS256) usando llave pública/privada.
## 2. Separación de Datos
Se usó una sola instancia de PostgreSQL (Supabase) con dos esquemas lógicos (`public` y `business`). Para una separación física real, solo se requiere cambiar las variables de entorno `DATABASE_URL` a servidores independientes.
