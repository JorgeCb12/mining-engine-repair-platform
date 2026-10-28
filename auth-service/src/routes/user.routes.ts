import { Router } from "express";
import {
  getMe,
  getAllUsers,
  deactivateUser,
} from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);

router.get("/", requireRole(["administrador"]), getAllUsers);
router.patch("/:id/deactivate", requireRole(["administrador"]), deactivateUser);

export default router;
