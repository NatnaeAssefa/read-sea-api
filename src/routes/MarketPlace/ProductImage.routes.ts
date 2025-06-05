import express from "express"
import { ProductImageController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: ProductImage
   *   description: ProductImage management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [ProductImage]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", ProductImageController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a ProductImage
   *     tags: [ProductImage]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", ProductImageController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch ProductImage by ID
   *     tags: [ProductImage]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ProductImage ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: ProductImage Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_ProductImage"]), ProductImageController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create ProductImage
   *     tags: [ProductImage]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_ProductImage"]), ProductImageController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update ProductImage
   *     tags: [ProductImage]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_ProductImage"]), ProductImageController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete ProductImage
   *     tags: [ProductImage]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: ProductImage Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_ProductImage"]), ProductImageController.delete)

  return router
}

export default routes
