import express from "express";
import accessRuleRoutes from "./AccessRule.routes";
import actionLogRoutes from "./ActionLog.routes";
import roleRoutes from "./Role.routes";
import userRoutes from "./User.routes";

const routes = () => {
  const router = express.Router();

  router.use("/access_rules", accessRuleRoutes());
  router.use("/action_logs", actionLogRoutes());
  router.use("/roles", roleRoutes());
  router.use("/users", userRoutes());

  return router;
};

export default routes;
