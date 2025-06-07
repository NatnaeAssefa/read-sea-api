import express from "express"
import { CartController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Cart
   *   description: Cart management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [Cart]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", CartController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a Cart
   *     tags: [Cart]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", CartController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch Cart by ID
   *     tags: [Cart]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Cart ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Cart Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_cart"]), CartController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create Cart
   *     tags: [Cart]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_cart"]), CartController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update Cart
   *     tags: [Cart]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_cart"]), CartController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete Cart
   *     tags: [Cart]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Cart Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_cart"]), CartController.delete)

  return router
}

export default routes
