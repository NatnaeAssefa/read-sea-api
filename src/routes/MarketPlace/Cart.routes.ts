import express from "express"
import { CartController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Cart
   *   description: Shopping cart management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /cart:
   *   get:
   *     summary: Get User Cart
   *     tags: [Cart]
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", AuthenticateUser, CartController.getCart)

  /**
   * @swagger
   * /cart/add:
   *   post:
   *     summary: Add Item to Cart
   *     tags: [Cart]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               productId:
   *                 type: string
   *                 format: uuid
   *               quantity:
   *                 type: number
   *                 minimum: 1
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request
   */
  router.post("/add", AuthenticateUser, CartController.addToCart)

  /**
   * @swagger
   * /cart/update/{id}:
   *   put:
   *     summary: Update Cart Item
   *     tags: [Cart]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Cart Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: number
   *                 minimum: 0
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request
   *       404:
   *         description: Cart item not found
   */
  router.put("/update/:id", AuthenticateUser, CartController.updateCartItem)

  /**
   * @swagger
   * /cart/remove/{id}:
   *   delete:
   *     summary: Remove Item from Cart
   *     tags: [Cart]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Cart Item ID
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Cart item not found
   */
  router.delete("/remove/:id", AuthenticateUser, CartController.removeFromCart)

  /**
   * @swagger
   * /cart/clear:
   *   delete:
   *     summary: Clear Cart
   *     tags: [Cart]
   *     responses:
   *       200:
   *         description: Success
   */
  router.delete("/clear", AuthenticateUser, CartController.clearCart)

  return router
}

export default routes
