import express from "express";
import accessRuleRoutes from "./AccessRule.routes";
import actionLogRoutes from "./ActionLog.routes";
import roleRoutes from "./Role.routes";
import userRoutes from "./User.routes";
import userProfileRoutes from "./UserProfile.routes"
import smsVerification from "./SmsVerification.routes"

const routes = () => {
  const router = express.Router();

  router.use("/access_rules", accessRuleRoutes());
  router.use("/action_logs", actionLogRoutes());
  router.use("/roles", roleRoutes());
  router.use("/users", userRoutes());
  router.use("/user_profiles", userProfileRoutes());
  router.use("/user_verification", smsVerification());
  return router;
};

export default routes;
