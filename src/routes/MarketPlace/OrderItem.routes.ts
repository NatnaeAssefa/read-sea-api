import express from "express"
import { OrderItemController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: OrderItem
   *   description: OrderItem management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [OrderItem]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", OrderItemController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a OrderItem
   *     tags: [OrderItem]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", OrderItemController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch OrderItem by ID
   *     tags: [OrderItem]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: OrderItem ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: OrderItem Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_OrderItem"]), OrderItemController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create OrderItem
   *     tags: [OrderItem]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_OrderItem"]), OrderItemController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update OrderItem
   *     tags: [OrderItem]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_OrderItem"]), OrderItemController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete OrderItem
   *     tags: [OrderItem]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: OrderItem Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_OrderItem"]), OrderItemController.delete)

  return router
}

export default routes
