import express from "express"
import { ChappaPaymentController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: ChappaPayment
   *   description: Chappa Payment management APIs
   */

  const router = express.Router()

  /**
   * @swagger
   * /chappa-payments:
   *   get:
   *     summary: Fetch Chappa Payments
   *     tags: [ChappaPayment]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/", AuthenticateUser, AuthorizeAccess(["read_chappa_payment"]), ChappaPaymentController.findMany)

  /**
   * @swagger
   * /chappa-payments/{id}:
   *   get:
   *     summary: Fetch Chappa Payment by ID
   *     tags: [ChappaPayment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Payment ID
   *     responses:
   *       200:
   *         description: Success
   */
  router.get("/:id", AuthenticateUser, AuthorizeAccess(["read_chappa_payment"]), ChappaPaymentController.findById)

  /**
   * @swagger
   * /chappa-payments/initiate:
   *   post:
   *     summary: Initiate Chappa Payment
   *     tags: [ChappaPayment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - order_id
   *               - payment_method_id
   *               - amount
   *               - callback_url
   *             properties:
   *               order_id:
   *                 type: string
   *                 format: uuid
   *               payment_method_id:
   *                 type: string
   *                 format: uuid
   *               amount:
   *                 type: number
   *               callback_url:
   *                 type: string
   *                 format: uri
   *     responses:
   *       201:
   *         description: Payment initiated successfully
   */
  router.post("/initiate", AuthenticateUser, AuthorizeAccess(["initiate_chappa_payment"]), ChappaPaymentController.initiatePayment)

  /**
   * @swagger
   * /chappa-payments/verify:
   *   post:
   *     summary: Verify Chappa Payment
   *     tags: [ChappaPayment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tx_ref
   *             properties:
   *               tx_ref:
   *                 type: string
   *     responses:
   *       200:
   *         description: Payment verified
   */
  router.post("/verify", AuthenticateUser, AuthorizeAccess(["verify_chappa_payment"]), ChappaPaymentController.verifyPayment)

  /**
   * @swagger
   * /chappa-payments/refund:
   *   post:
   *     summary: Refund Chappa Payment
   *     tags: [ChappaPayment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - payment_id
   *             properties:
   *               payment_id:
   *                 type: string
   *                 format: uuid
   *               amount:
   *                 type: number
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Payment refunded
   */
  router.post("/refund", AuthenticateUser, AuthorizeAccess(["refund_chappa_payment"]), ChappaPaymentController.refundPayment)

  /**
   * @swagger
   * /chappa-payments/webhook:
   *   post:
   *     summary: Chappa Webhook Handler
   *     tags: [ChappaPayment]
   *     responses:
   *       200:
   *         description: Webhook processed
   */
  router.post("/webhook", ChappaPaymentController.webhookHandler)

  return router
}

export default routes
