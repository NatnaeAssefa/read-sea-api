import express from "express"
import { OrderTrackingController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: OrderTracking
   *   description: OrderTracking management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [OrderTracking]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", OrderTrackingController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a OrderTracking
   *     tags: [OrderTracking]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", OrderTrackingController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch OrderTracking by ID
   *     tags: [OrderTracking]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: OrderTracking ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: OrderTracking Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_OrderTracking"]), OrderTrackingController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create OrderTracking
   *     tags: [OrderTracking]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_OrderTracking"]), OrderTrackingController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update OrderTracking
   *     tags: [OrderTracking]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_OrderTracking"]), OrderTrackingController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete OrderTracking
   *     tags: [OrderTracking]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: OrderTracking Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_OrderTracking"]), OrderTrackingController.delete)

  return router
}

export default routes
