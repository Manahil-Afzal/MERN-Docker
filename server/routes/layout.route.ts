import express from "express";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import { updateAccessToken } from "../controllers/user.controller.js";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", updateAccessToken, isAuthenticated, authorizeRoles("admin"), createLayout);

layoutRouter.put("/edit-layout", updateAccessToken, isAuthenticated, authorizeRoles("admin"), editLayout);

layoutRouter.get("/get-layout/:type", getLayoutByType);


export default layoutRouter;