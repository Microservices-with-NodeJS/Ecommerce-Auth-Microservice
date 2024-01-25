// src/auth.route.ts
import { Router } from "express";
import * as AuthController from "../controllers/userController";

const router = Router();
// Register new user
router.post("/register", AuthController.createUser);

// Login user
router.post("/login", AuthController.loginUser);

export default router;
