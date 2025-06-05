import express from "express"
import { PaymentMethodController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: PaymentMethod
   *   description: PaymentMethod management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [PaymentMethod]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", PaymentMethodController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a PaymentMethod
   *     tags: [PaymentMethod]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", PaymentMethodController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch PaymentMethod by ID
   *     tags: [PaymentMethod]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: PaymentMethod ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: PaymentMethod Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_PaymentMethod"]), PaymentMethodController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create PaymentMethod
   *     tags: [PaymentMethod]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_PaymentMethod"]), PaymentMethodController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update PaymentMethod
   *     tags: [PaymentMethod]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_PaymentMethod"]), PaymentMethodController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete PaymentMethod
   *     tags: [PaymentMethod]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: PaymentMethod Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_PaymentMethod"]), PaymentMethodController.delete)

  return router
}

export default routes
