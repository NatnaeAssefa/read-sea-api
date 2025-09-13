import express from "express";
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";
import VerificationController from "../../controllers/User/verification.controller";

const routes = () => {
  const router = express.Router();

  /**
   * @swagger
   * /users/send_verification:
   *   post:
   *     summary: Send verification code to user
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Code sent successfully
   */
  router.post(
    "/send_verification",
    VerificationController.sendVerificationCode
  );

  /**
   * @swagger
   * /users/verify_code:
   *   post:
   *     summary: Verify user phone number
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Phone verified successfully
   */
  router.post(
    "/verify_code",
    VerificationController.verifyCode
  );

  return router;
};

export default routes;
