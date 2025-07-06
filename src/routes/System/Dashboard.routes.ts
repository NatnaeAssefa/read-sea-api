import express from "express";
import { DashboardController } from "../../controllers/System";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics API
 */

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns statistics for the dashboard including total users, products, revenue, etc.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 100
 *                     totalProducts:
 *                       type: number
 *                       example: 500
 *                     totalProductPrice:
 *                       type: number
 *                       example: 150000
 *                     totalRevenue:
 *                       type: number
 *                       example: 75000
 *                 message:
 *                   type: string
 *                   example: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/stats",
  AuthenticateUser,
  AuthorizeAccess(["view_analytics"]),
  DashboardController.getDashboardStats
);

/**
 * @swagger
 * /api/v1/dashboard/order-analytics:
 *   get:
 *     summary: Get order analytics
 *     description: Returns order analytics including total orders, pending orders, revenue, and shipped today
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                       example: 250
 *                     pendingOrders:
 *                       type: number
 *                       example: 15
 *                     totalRevenue:
 *                       type: number
 *                       example: 75000
 *                     shippedToday:
 *                       type: number
 *                       example: 8
 *                 message:
 *                   type: string
 *                   example: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/order-analytics",
  AuthenticateUser,
  AuthorizeAccess(["view_analytics"]),
  DashboardController.getOrderAnalytics
);

/**
 * @swagger
 * /api/v1/dashboard/product-analytics:
 *   get:
 *     summary: Get product analytics
 *     description: Returns product analytics including total products, active products, out of stock products, and total revenue
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: number
 *                       example: 500
 *                     activeProducts:
 *                       type: number
 *                       example: 450
 *                     outOfStock:
 *                       type: number
 *                       example: 25
 *                     totalRevenue:
 *                       type: number
 *                       example: 85000
 *                 message:
 *                   type: string
 *                   example: Success
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/product-analytics",
  AuthenticateUser,
  AuthorizeAccess(["view_analytics"]),
  DashboardController.getProductAnalytics
);

export default () => {
  return router;
}; 