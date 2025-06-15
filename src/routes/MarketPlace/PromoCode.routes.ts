import express from "express"
import { PromoCodeController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: PromoCode
   *   description: PromoCode management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /promo_codes:
   *   get:
   *     summary: Fetch PromoCodes
   *     tags: [PromoCode]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", AuthenticateUser, AuthorizeAccess(["read_promo_code"]), PromoCodeController.findMany)

  /**
   * @swagger
   * /promo_codes/get:
   *   get:
   *     summary: Fetch a PromoCode
   *     tags: [PromoCode]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/get", PromoCodeController.findOne)

  /**
   * @swagger
   * /promo_codes/{id}/calculate/{amount}:
   *   get:
   *     summary: Calculate discounted amount using promo code
   *     tags: [PromoCode]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: PromoCode ID
   *       - in: path
   *         name: amount
   *         required: true
   *         description: Original amount to apply discount to
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: PromoCode Not Found
   */
  router.get("/:id/calculate/:amount", AuthenticateUser, AuthorizeAccess(["read_promo_code"]), PromoCodeController.calculateDiscount)


  /**
   * @swagger
   * /promo_codes/{id}:
   *   get:
   *     summary: Fetch PromoCode by ID
   *     tags: [PromoCode]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: PromoCode ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: PromoCode Not Found
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["write_promo_code"]), PromoCodeController.findById)

  /**
   * @swagger
   * /promo_codes:
   *   post:
   *     summary: Create PromoCode
   *     tags: [PromoCode]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post("/", AuthenticateUser, AuthorizeAccess(["write_promo_code"]), PromoCodeController.create)

  /**
   * @swagger
   * /promo_codes:
   *   put:
   *     summary: Update PromoCode
   *     tags: [PromoCode]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put("/", AuthenticateUser, AuthorizeAccess(["write_promo_code"]), PromoCodeController.update)

  /**
   * @swagger
   * /promo_codes:
   *   delete:
   *     summary: Delete PromoCode
   *     tags: [PromoCode]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: PromoCode Not Found
   */
  router.delete("/", AuthenticateUser, AuthorizeAccess(["delete_promo_code"]), PromoCodeController.delete)

  return router
}

export default routes

