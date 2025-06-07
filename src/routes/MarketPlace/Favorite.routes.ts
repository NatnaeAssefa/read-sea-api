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
   * /favorites:
   *   get:
   *     summary: Fetch Favorites
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
 * /favorites/my:
 *   get:
 *     summary: Fetch My Favorites
 *     tags: [Favorite]
 *     parameters:
 *       - in: query
 *         name: query
 *         description: query
 *     responses:
 *       200:
 *         description: Success
 */
  router.get("/my", AuthenticateUser, FavoriteController.findMy)

  /**
   * @swagger
   * /favorites/get:
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
   * /favorites/{id}:
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
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_favorite"]), FavoriteController.findById)

  /**
   * @swagger
   * /favorites:
   *   post:
   *     summary: Create Favorite
   *     tags: [Favorite]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_favorite"]), FavoriteController.create)

  /**
   * @swagger
   * /favorites:
   *   put:
   *     summary: Update Favorite
   *     tags: [Favorite]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_favorite"]), FavoriteController.update)

  /**
   * @swagger
   * /favorites:
   *   delete:
   *     summary: Delete Favorite
   *     tags: [Favorite]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Favorite Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_favorite"]), FavoriteController.delete)

  return router
}

export default routes
