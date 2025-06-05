import express from "express"
import { AppSettingController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: AppSetting
   *   description: AppSetting management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [AppSetting]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", AppSettingController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a AppSetting
   *     tags: [AppSetting]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", AppSettingController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch AppSetting by ID
   *     tags: [AppSetting]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: AppSetting ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: AppSetting Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_AppSetting"]), AppSettingController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create AppSetting
   *     tags: [AppSetting]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_AppSetting"]), AppSettingController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update AppSetting
   *     tags: [AppSetting]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_AppSetting"]), AppSettingController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete AppSetting
   *     tags: [AppSetting]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: AppSetting Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_AppSetting"]), AppSettingController.delete)

  return router
}

export default routes
