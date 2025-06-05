import express from "express"
import { FavoriteController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Favorite
   *   description: Favorite management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [Favorite]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", FavoriteController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a Favorite
   *     tags: [Favorite]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", FavoriteController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch Favorite by ID
   *     tags: [Favorite]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Favorite ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Favorite Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_Favorite"]), FavoriteController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create Favorite
   *     tags: [Favorite]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_Favorite"]), FavoriteController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update Favorite
   *     tags: [Favorite]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_Favorite"]), FavoriteController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete Favorite
   *     tags: [Favorite]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Favorite Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_Favorite"]), FavoriteController.delete)

  return router
}

export default routes
