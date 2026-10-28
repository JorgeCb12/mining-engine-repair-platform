import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "auth-service" }),
);
app.use("/auth", authRoutes);

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => console.log(`Auth Service en puerto ${PORT}`));
