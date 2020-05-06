import { Router } from "express";
import { confirmEmailController } from "../controllers/confirmEmailController";

const confirmRoute = Router();

confirmRoute.get("/:id", confirmEmailController);

export default confirmRoute;
