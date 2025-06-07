import express from "express"
import { AddressController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Address
   *   description: Address management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Fetch Categories
   *     tags: [Address]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", AddressController.findMany)

  /**
   * @swagger
   * /categories/get:
   *   get:
   *     summary: Fetch a Address
   *     tags: [Address]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", AddressController.findOne)

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Fetch Address by ID
   *     tags: [Address]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Address ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Address Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_address"]), AddressController.findById)

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Create Address
   *     tags: [Address]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_address"]), AddressController.create)

  /**
   * @swagger
   * /categories:
   *   put:
   *     summary: Update Address
   *     tags: [Address]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_address"]), AddressController.update)

  /**
   * @swagger
   * /categories:
   *   delete:
   *     summary: Delete Address
   *     tags: [Address]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Address Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_address"]), AddressController.delete)

  return router
}

export default routes
