import express from "express"
import { CartItemController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: CartItem
   *   description: CartItem management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [CartItem]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", CartItemController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a CartItem
   *     tags: [CartItem]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", CartItemController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch CartItem by ID
   *     tags: [CartItem]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: CartItem ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: CartItem Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_cart_item"]), CartItemController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create CartItem
   *     tags: [CartItem]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_cart_item"]), CartItemController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update CartItem
   *     tags: [CartItem]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_cart_item"]), CartItemController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete CartItem
   *     tags: [CartItem]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: CartItem Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_cart_item"]), CartItemController.delete)

  return router
}

export default routes
