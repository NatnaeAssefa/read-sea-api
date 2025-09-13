import express from "express"
import { BannerController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Banner
   *   description: Banner management APIs
   */

  const router = express.Router()

  // Public routes - No authentication required
  /**
   * @swagger
   * /banners:
   *   get:
   *     summary: Fetch Active Banners (Public)
   *     tags: [Banner]
   *     description: Returns only active banners within their date range, ordered by priority
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of banners to return
   *         schema:
   *           type: integer
   *       - in: query
   *         name: offset
   *         description: Number of banners to skip
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 data:
   *                   type: object
   *                   properties:
   *                     rows:
   *                       type: array
   *                       items:
   *                         type: object
   *                     count:
   *                       type: integer
   *                 message:
   *                   type: string
   */
  router.get("/", BannerController.findActiveBanners)

  // Admin routes - Authentication and authorization required
  /**
   * @swagger
   * /admin/banners:
   *   get:
   *     summary: Fetch All Banners (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: query
   *         description: Query parameters for filtering
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  router.get("/admin", AuthenticateUser, AuthorizeAccess(["read_banner"]), BannerController.findMany)

  /**
   * @swagger
   * /admin/banners/search:
   *   get:
   *     summary: Search Banners (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: query
   *         description: Search query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/admin/search", AuthenticateUser, AuthorizeAccess(["read_banner"]), BannerController.findOne)

  /**
   * @swagger
   * /admin/banners/date-range:
   *   get:
   *     summary: Find Banners by Date Range (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: start_date
   *         required: true
   *         description: Start date (ISO format)
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: end_date
   *         required: true
   *         description: End date (ISO format)
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Invalid date range
   */
  router.get("/admin/date-range", AuthenticateUser, AuthorizeAccess(["read_banner"]), BannerController.findByDateRange)

  /**
   * @swagger
   * /admin/banners/{id}:
   *   get:
   *     summary: Fetch Banner by ID (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Banner ID
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Banner not found
   */
  router.get("/admin/:id", AuthenticateUser, AuthorizeAccess(["read_banner"]), BannerController.findById)

  /**
   * @swagger
   * /admin/banners:
   *   post:
   *     summary: Create Banner (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - image_url
   *               - start_date
   *               - end_date
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *               description:
   *                 type: string
   *               image_url:
   *                 type: string
   *                 format: uri
   *               link_url:
   *                 type: string
   *                 format: uri
   *               start_date:
   *                 type: string
   *                 format: date-time
   *               end_date:
   *                 type: string
   *                 format: date-time
   *               status:
   *                 type: string
   *                 enum: [Active, Inactive, Pending, Blocked, Archived]
   *               priority:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 999
   *               target_audience:
   *                 type: string
   *                 enum: [ALL, GUEST, REGISTERED]
   *     responses:
   *       201:
   *         description: Banner created successfully
   *       400:
   *         description: Validation error
   */
  router.post("/admin", AuthenticateUser, AuthorizeAccess(["create_banner"]), BannerController.create)

  /**
   * @swagger
   * /admin/banners:
   *   put:
   *     summary: Update Banner (SuperAdmin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 format: uuid
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *               description:
   *                 type: string
   *               image_url:
   *                 type: string
   *                 format: uri
   *               link_url:
   *                 type: string
   *                 format: uri
   *               start_date:
   *                 type: string
   *                 format: date-time
   *               end_date:
   *                 type: string
   *                 format: date-time
   *               status:
   *                 type: string
   *                 enum: [Active, Inactive, Pending, Blocked, Archived]
   *               priority:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 999
   *     responses:
   *       200:
   *         description: Banner updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Banner not found
   */
 
 
  router.post("/superAdmin", AuthenticateUser, AuthorizeAccess(["create_banner"]), BannerController.create)

  /**
   * @swagger
   * /admin/banners:
   *   put:
   *     summary: Update Banner (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 format: uuid
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *               description:
   *                 type: string
   *               image_url:
   *                 type: string
   *                 format: uri
   *               link_url:
   *                 type: string
   *                 format: uri
   *               start_date:
   *                 type: string
   *                 format: date-time
   *               end_date:
   *                 type: string
   *                 format: date-time
   *               status:
   *                 type: string
   *                 enum: [Active, Inactive, Pending, Blocked, Archived]
   *               priority:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 999
   *     responses:
   *       200:
   *         description: Banner updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Banner not found
   */
  router.put("/admin", AuthenticateUser, AuthorizeAccess(["update_banner"]), BannerController.update)

  /**
   * @swagger
   * /admin/banners:
   *   delete:
   *     summary: Delete Banner (Admin)
   *     tags: [Banner]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 format: uuid
   *               force:
   *                 type: boolean
   *                 description: Whether to permanently delete (hard delete)
   *     responses:
   *       200:
   *         description: Banner deleted successfully
   *       404:
   *         description: Banner not found
   */
  router.delete("/admin", AuthenticateUser, AuthorizeAccess(["delete_banner"]), BannerController.delete)

  return router
}

export default routes
