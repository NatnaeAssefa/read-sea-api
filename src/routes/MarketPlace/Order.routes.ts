import express from "express"
import { OrderController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Order
   *   description: Order management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [Order]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", OrderController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a Order
   *     tags: [Order]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", OrderController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch Order by ID
   *     tags: [Order]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Order ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Order Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_Order"]), OrderController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create Order
   *     tags: [Order]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_Order"]), OrderController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update Order
   *     tags: [Order]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_Order"]), OrderController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete Order
   *     tags: [Order]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Order Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_Order"]), OrderController.delete)

  return router
}

export default routes
