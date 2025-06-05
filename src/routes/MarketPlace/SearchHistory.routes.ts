import express from "express"
import { SearchHistoryController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: SearchHistory
   *   description: SearchHistory management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [SearchHistory]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", SearchHistoryController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a SearchHistory
   *     tags: [SearchHistory]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", SearchHistoryController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch SearchHistory by ID
   *     tags: [SearchHistory]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: SearchHistory ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: SearchHistory Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_SearchHistory"]), SearchHistoryController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create SearchHistory
   *     tags: [SearchHistory]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_SearchHistory"]), SearchHistoryController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update SearchHistory
   *     tags: [SearchHistory]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_SearchHistory"]), SearchHistoryController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete SearchHistory
   *     tags: [SearchHistory]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: SearchHistory Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_SearchHistory"]), SearchHistoryController.delete)

  return router
}

export default routes
