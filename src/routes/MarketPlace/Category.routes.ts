import express from "express"
import { CategoryController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Category
   *   description: Category management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [Category]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", CategoryController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a Category
   *     tags: [Category]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", CategoryController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch Category by ID
   *     tags: [Category]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Category ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Category Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_category"]), CategoryController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create Category
   *     tags: [Category]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_category"]), CategoryController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update Category
   *     tags: [Category]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_category"]), CategoryController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete Category
   *     tags: [Category]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Category Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_category"]), CategoryController.delete)

  return router
}

export default routes
