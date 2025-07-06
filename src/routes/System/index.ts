import express from "express";
import configRoutes from "./Config.routes";
import fileRoutes from "./File.routes";
import notificationRoutes from "./Notification.routes";
import dashboardRoutes from "./Dashboard.routes";


const routes = () => {
  const router = express.Router();

  router.use("/files", fileRoutes());
  router.use("/configs", configRoutes());
  router.use("/notification", notificationRoutes());
  router.use("/dashboard", dashboardRoutes());

  return router;
};

export default routes;
