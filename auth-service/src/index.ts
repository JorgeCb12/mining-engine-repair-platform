import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "auth-service" }),
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => console.log(`Auth Service en puerto ${PORT}`));
