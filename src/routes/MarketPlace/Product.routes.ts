import express from "express"
import { ProductController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Product
   *   description: Product management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /products:
   *   get:
   *     summary: Fetch Products
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: page
   *         description: Page number
   *       - in: query
   *         name: limit
   *         description: Items per page
   *       - in: query
   *         name: categoryId
   *         description: Filter by category
   *       - in: query
   *         name: search
   *         description: Search query
   *       - in: query
   *         name: featured
   *         description: Filter featured products
   *       - in: query
   *         name: trending
   *         description: Filter trending products
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", ProductController.findMany)

  /**
   * @swagger
   * /products/featured:
   *   get:
   *     summary: Fetch Featured Products
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of products to return
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/featured", ProductController.getFeaturedProducts)

  /**
   * @swagger
   * /products/trending:
   *   get:
   *     summary: Fetch Trending Products
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of products to return
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/trending", ProductController.getTrendingProducts)

  /**
   * @swagger
   * /products/search:
   *   get:
   *     summary: Search Products
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: query
   *         required: true
   *         description: Search query
   *       - in: query
   *         name: limit
   *         description: Number of products to return
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad request (missing query)
   */
  router.get("/search", ProductController.searchProducts)

  /**
   * @swagger
   * /products/get:
   *   get:
   *     summary: Fetch a Product
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", ProductController.findOne)

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     summary: Fetch Product by ID
   *     tags: [Product]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Product ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Product Not Found
   */
  router.get("/:id", ProductController.findById)

  /**
   * @swagger
   * /products:
   *   post:
   *     summary: Create Product
   *     tags: [Product]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_product"]), ProductController.create)

  /**
   * @swagger
   * /products:
   *   put:
   *     summary: Update Product
   *     tags: [Product]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_product"]), ProductController.update)

  /**
   * @swagger
   * /products:
   *   delete:
   *     summary: Delete Product
   *     tags: [Product]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Product Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_product"]), ProductController.delete)

  return router
}

export default routes
