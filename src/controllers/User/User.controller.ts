import { Request, Response } from "express";
import { UserService } from "../../services/User";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import {
  EmailRegex,
  PhoneNumberRegex,
  PasswordRegex,
  PasswordMessage,
  UserType,
  UserStatus,
  UserNotificationStatus,
} from "../../utilities/constants/Constants";
import { User } from "../../models/User";
import { env } from "../../config";

const ModelName = "User";

class UserController {
  static findMany(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    UserService.findMany(request.user, parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findOne(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    UserService.findOne(request.user, parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findById(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      let id: string = request.params.id;
      let parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      UserService.findById(
        request.user,
        id,
        parsedQuery.query,
        parsedQuery.paranoid
      )
        .then((result) => {
          if (result) {
            ServerResponse(request, response, 200, result, "", startTime);
          } else {
            ServerResponse(
              request,
              response,
              404,
              null,
              `${ModelName} Not Found`,
              startTime
            );
          }
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
      return;
    }
  }

  static register(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      first_name: Joi.string().required().trim(),
      last_name: Joi.string().required().trim(),
      email: Joi.string()
        .pattern(new RegExp(EmailRegex))
        .message("Invalid Email Address")
        .required(),
      phone_number: Joi.string()
        .pattern(new RegExp(PhoneNumberRegex))
        .message("Invalid Phone Number")
        .required(),
      password: Joi.string()
        .regex(PasswordRegex)
        .message(PasswordMessage)
        .required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      UserService.register(data)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static create(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      first_name: Joi.string().required().trim(),
      last_name: Joi.string().required().trim(),
      email: Joi.string()
        .pattern(new RegExp(EmailRegex))
        .message("Invalid Email Address")
        .required(),
      phone_number: Joi.string().allow(null),
      password: Joi.string()
        .regex(PasswordRegex)
        .message(PasswordMessage)
        .required(),
      status: Joi.string()
        .valid(...Object.values(UserStatus))
        .required(),
      type: Joi.string()
        .valid(...Object.values(UserType))
        .required(),
      role_id: Joi.string().guid().allow(null),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      UserService.create(user, data)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static getMe(request: any, response: Response) {
    const startTime = new Date();
    ServerResponse(request, response, 200, request.user, "Success", startTime);
  }

  static googleAuth(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      code: Joi.string().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      UserService.verifyGoogle(data.code)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static facebookAuth(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      code: Joi.string().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      UserService.verifyFacebook(request.user)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static verify(request: any, response: Response) {
    const startTime = new Date();
    let email = request.query.email || "test@email.com";
    let code = request.query.code || "test code";

    UserService.verify(email, code)
      .then((user) => {
        ServerResponse(
          request,
          response,
          200,
          {
            name: user.first_name,
            homeUrl: env.FRONTEND_URL,
          },
          "verify_success",
          startTime,
          "view"
        );
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          {
            messages: error.payload.errors ?? ["Failed To Verify"],
            homeUrl: env.FRONTEND_URL,
          },
          "error",
          startTime,
          "view"
        );
      });
  }

  static recover(request: any, response: Response) {
    const startTime = new Date();
    let email = request.query.email || "test@email.com";
    let code = request.query.code || "test code";

    UserService.recover(email, code)
      .then((result) => {
        ServerResponse(
          request,
          response,
          200,
          {
            email: result.email,
            code: result.code,
          },
          "recover_input",
          startTime,
          "view"
        );
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          {
            messages: error.payload.errors ?? ["Failed To Verify"],
            homeUrl: env.FRONTEND_URL,
          },
          "error",
          startTime,
          "view"
        );
      });
  }

  static submitChangedPassword(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      email: Joi.string().email().required(),
      code: Joi.string().required(),
      password: Joi.string()
        .regex(PasswordRegex)
        .message(PasswordMessage)
        .required(),
      confirm_password: Joi.string().valid(Joi.ref("password")).required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;

      UserService.changePasswordOnRecovery(data.email, data.code, data.password)
        .then((user) => {
          ServerResponse(
            request,
            response,
            200,
            {
              name: user.first_name,
              homeUrl: env.FRONTEND_URL,
            },
            "recover_success",
            startTime,
            "view"
          );
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            {
              messages: error.payload.errors ?? ["Failed To Verify"],
            },
            "recover_input",
            startTime,
            "view"
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        {
          email: request.body.email ?? "",
          code: request.body.code ?? "",
          messages: error.details ?? ["Failed to perform action"],
        },
        "recover_input",
        startTime,
        "view"
      );
    }
  }

  static changeUserPassword(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      user_id: Joi.string().guid().required(),
      password: Joi.string()
        .regex(PasswordRegex)
        .message(PasswordMessage)
        .required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      UserService.changeUserPassword(user, data.user_id, data.password)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static changePassword(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      previous_password: Joi.string().required(),
      new_password: Joi.string()
        .regex(PasswordRegex)
        .message(PasswordMessage)
        .required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      UserService.changePassword(
        user.id,
        data.previous_password,
        data.new_password
      )
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static forgotPassword(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      UserService.forgotPassword(data.email)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static login(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      email: Joi.string().email().required().trim(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      UserService.login(data.email, data.password)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static revokeToken(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      user_id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      UserService.revokeTokens(user, data["user_id"])
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static update(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      first_name: Joi.string().trim(),
      last_name: Joi.string().trim(),
      phone_number: Joi.string()
        .pattern(new RegExp(PhoneNumberRegex))
        .message("Invalid Phone Number"),
      status: Joi.string()
        .valid(...Object.values(UserStatus))
        .allow(null),
      role_id: Joi.string().guid().allow(null),
      notification_status: Joi.string()
        .valid(...Object.values(UserNotificationStatus))
        .allow(null),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      UserService.update(user, id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static updateMe(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      first_name: Joi.string().trim(),
      last_name: Joi.string().trim(),
      phone_number: Joi.string()
        .pattern(new RegExp(PhoneNumberRegex))
        .message("Invalid Phone Number"),
      notification_status: Joi.string()
        .valid(...Object.values(UserNotificationStatus))
        .allow(null),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      UserService.update(user, user.id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static delete(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      force: Joi.boolean(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const force: boolean = request.body.force ?? false;
      const user: User = request.user;
      UserService.delete(user, id, null, force)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static restore(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const user: User = request.user;
      UserService.restore(user, id)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static toggleIsVerified(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      is_verified: Joi.boolean().required()
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      UserService.toggleIsVerified(user, id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

}

export default UserController;