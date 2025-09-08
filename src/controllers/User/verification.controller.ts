import { Response } from "express";
import { User } from "../../models/User";
import ServerResponse from "../../utilities/response/Response";
import Joi from "joi";
import { generateVerificationCode, sendVerificationSMS } from "../../utilities/sms/sms";

class VerificationController {
  // Send verification code
  static sendVerificationCode = async (request: any, response: Response) => {
    const startTime = new Date();
    console.log('Request=====>>>',request.body)
    const schema = Joi.object({
      phone_number: Joi.string().required(),
    });

    const { error } = schema.validate(request.body);
    if (error) {
      return ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }

    try {
      const { phone_number } = request.body;
      const user = await User.findOne({ where: { phone_number } });

      if (!user) {
        return ServerResponse(request, response, 404, null, "User not found", startTime);
      }

      const code = generateVerificationCode();
      user.verification_code = code;
      user.verification_time = new Date();
      await user.save();

      await sendVerificationSMS(phone_number, code);

      return ServerResponse(request, response, 200, null, "Verification code sent", startTime);
    } catch (err: any) {
      console.error(err);
      return ServerResponse(request, response, 500, null, "Internal server error", startTime);
    }
  };

  // Verify code
  static verifyCode = async (request: any, response: Response) => {
    const startTime = new Date();

    const schema = Joi.object({
      phone_number: Joi.string().required(),
      code: Joi.string().required(),
    });

    const { error } = schema.validate(request.body);
    if (error) {
      return ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }

    try {
      const { phone_number, code } = request.body;
      const user = await User.findOne({ where: { phone_number } });

      if (!user) {
        return ServerResponse(request, response, 404, null, "User not found", startTime);
      }

      if (user.verification_code === code) {
        user.is_verified = true;
        user.status = 'Active';
        (user as any).verification_code = null; // Clear code after verification
        await user.save();
        return ServerResponse(request, response, 200, null, "Phone verified successfully", startTime);
      } else {
        return ServerResponse(request, response, 400, null, "Invalid verification code", startTime);
      }
    } catch (err: any) {
      console.error(err);
      return ServerResponse(request, response, 500, null, "Internal server error", startTime);
    }
  };
}

export default VerificationController;
