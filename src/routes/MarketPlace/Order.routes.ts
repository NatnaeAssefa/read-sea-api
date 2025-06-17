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
   * /orders/my:
   *   get:
   *     summary: Fetch My Orders
   *     tags: [Order]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get(
    "/search/by-coordinates", 
    AuthenticateUser, 
    OrderController.findByCoordinates
  )

  /**
   * @swagger
   * /orders/{id}:
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
   *       404:
   *         description: Order Not Found
   */
  router.get(
    "/my", 
    AuthenticateUser, 
    OrderController.findMyOrders
  )

  /**
   * @swagger
   * /orders/{id}:
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
   *       404:
   *         description: Order Not Found
   */

 
  router.get(
    "/:id", 
    AuthenticateUser, 
    AuthorizeAccess(["read_order"]), 
    OrderController.findById
  )

  /**
   * @swagger
   * /orders/user/{userId}:
   *   get:
   *     summary: Fetch Orders by User ID
   *     tags: [Order]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         description: User ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       403:
   *         description: Unauthorized
   *       404:
   *         description: Orders Not Found
   */
  router.get(
    "/user/:userId", 
    AuthenticateUser, 
    AuthorizeAccess(["read_order"]), 
    OrderController.findByUserId
  )

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
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_order"]), OrderController.create)

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
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_order"]), OrderController.update)

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
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_order"]), OrderController.delete)

  return router
}

export default routes
