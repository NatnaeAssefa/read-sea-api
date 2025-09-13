import { Transaction } from "sequelize";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { UserDAL } from "../../dals/User";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from ".";
import { User } from "../../models/User";
import { generateVerificationCode, sendVerificationSMS } from "../../utilities/sms/sms";

const ModelName = "User Verification";

class VerificationService {
  /**
   * Send verification code to user
   */
  static sendCode = (user: User): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          // 1. Start transaction
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },

          // 2. Fetch user
          (transaction: Transaction, done: Function) => {
            UserDAL.findById(user.id)
              .then((result) => {
                if (!result) {
                  done(new NotFoundError("User not found"), { transaction });
                } else {
                  done(null, transaction, result);
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), { transaction })
              );
          },

          // 3. Generate code + save
          (transaction: Transaction, user: User, done: Function) => {
            const code = generateVerificationCode();

            user.verification_code = code;
            user.verification_time = new Date();

            user
              .save({ transaction })
              .then(async () => {
                await sendVerificationSMS(user.phone_number, code);
                done(null, { obj: true, transaction });
              })
              .catch((error) =>
                done(new InternalServerError(error), { transaction })
              );
          },

          // 4. Audit log
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: { user_id: user.id },
              user_id: user.id,
            });
            done(null, result);
          },
        ],
        (error, result: { obj: boolean; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              result.transaction.commit();
              resolve(true);
            } else {
              reject(new InternalServerError("Dead End"));
            }
          } else {
            reject(error);
            if (result && result.transaction) {
              result.transaction.rollback();
            }
          }
        }
      );
    });
  };

  /**
   * Verify code
   */
  static verifyCode = (user: User, code: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          // 1. Fetch user
          (done: Function) => {
            UserDAL.findById(user.id)
              .then((result) => {
                if (!result) {
                  done(new NotFoundError("User not found"));
                } else {
                  done(null, result);
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },

          // 2. Check code
          (user: User, done: Function) => {
            if (user.verification_code !== code) {
              done(new BadRequestError(["Invalid verification code"]));
            } else {
              user.is_verified = true;
              user.status = "Active";
              (user as any).verification_code = null;
              user
                .save()
                .then(() => {
                  ActionLogService.handleCreate({
                    action: LogActions.UPDATE,
                    object: ModelName,
                    prev_data: {},
                    new_data: { user_id: user.id, verified: true },
                    user_id: user.id,
                  });
                  done(null, true);
                })
                .catch((error) => done(new InternalServerError(error)));
            }
          },
        ],
        (error, result: boolean | undefined) => {
          if (error) {
            reject(error);
          } else {
            resolve(result ?? false);
          }
        }
      );
    });
  };
}

export default VerificationService;
