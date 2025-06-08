import type { FindOptions, IncrementDecrementOptionsWithBy, InstanceDestroyOptions, InstanceRestoreOptions, InstanceUpdateOptions, Model, SaveOptions, SetOptions, Transaction } from "sequelize"
import { type ChappaPayment } from "../../models/MarketPlace"
import async from "async"
import { createTransaction } from "../../utilities/database/sequelize";
import {
  InternalServerError,
  NotFoundError,
  BadRequestError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import ChappaPaymentDAL from "../../dals/MarketPlace/ChappaPayment.dal";
import ChappaService from "../Chappa/Chappa.service";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "../System";
import { SequelizeHooks } from "sequelize/types/hooks";
import { ValidationOptions } from "sequelize/types/instance-validator";
import { Notification } from "../../models/System";

const ModelName = "ChappaPayment"

class ChappaPaymentService {
  static create = (user: User, payload: Omit<ChappaPayment, NullishPropertiesOf<ChappaPayment>>): Promise<ChappaPayment> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ChappaPaymentDAL.create(payload, transaction)
              .then((result) => {
                done(null, result, { obj: result, transaction: transaction })
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: obj,
              user_id: user?.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: ChappaPayment[]; count: number }> => {
    return new Promise((resolve, reject) => {
      const queryOptions = {
        ...options,
        ChappaPayment: [["createdAt", "DESC"]],
      }

      ChappaPaymentDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<ChappaPayment | null> => {
    return new Promise((resolve, reject) => {
      const queryOptions = {
        ...options,
      }

      ChappaPaymentDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<ChappaPayment, NullishPropertiesOf<ChappaPayment>>,
    options?: any,
  ): Promise<ChappaPayment> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ChappaPaymentDAL.findById(id, options)
              .then((ChappaPayment) => {
                if (ChappaPayment) {
                  done(null, transaction, ChappaPayment)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (transaction: Transaction, ChappaPayment: ChappaPayment, done: Function) => {
            const _ChappaPayment = { ...ChappaPayment.toJSON() }
            ChappaPaymentDAL.update(ChappaPayment, payload, transaction)
              .then((result) => {
                done(null, _ChappaPayment, { obj: result, transaction: transaction })
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: obj,
              new_data: payload,
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static initiatePayment = (
    user: User,
    orderId: string,
    paymentMethodId: string,
    amount: number,
    callbackUrl: string
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const txRef = `tx-${uuidv4()}`;
      
      // Initialize payment with Chappa
      ChappaService.initializePayment({
        amount,
        currency: "ETB",
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        tx_ref: txRef,
        callback_url: callbackUrl,
        customization: {
          title: "Red-Sea Pay", // Shortened to comply with 16-char limit
          description: "Payment for your order",
        }
      })
        .then(async (response) => {
          // Create payment record
          try {
            const paymentRecord = await ChappaPaymentService.create(user, {
              user_id: user.id,
              payment_method_id: paymentMethodId,
              order_id: orderId,
              transaction_id: txRef,
              amount,
              currency: "ETB",
              status: "pending",
              metadata: response
            } as any);
            
            resolve({
              payment: paymentRecord,
              chappaResponse: response
            });
          } catch (error) {
            reject(new InternalServerError(error as string));
          }
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  }

  static verifyPayment = (txRef: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      ChappaService.verifyPayment({ tx_ref: txRef })
        .then(async (response) => {
          try {
            // Find the payment record
            const payment = await ChappaPaymentDAL.findOne({ 
              where: { transaction_id: txRef } 
            });
            
            if (!payment) {
              return reject(new NotFoundError("Payment record not found"));
            }
            
            // Update payment status based on verification
            const status = response.status === "success" ? "completed" : "failed";
            await ChappaPaymentDAL.update(payment, {
              status,
              payment_date: new Date(),
              metadata: { ...payment.get('metadata'), verification: response }
            });
            
            resolve({
              payment,
              verificationResponse: response
            });
          } catch (error) {
            reject(new InternalServerError(error as string));
          }
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  }

  static refundPayment = (
    user: User,
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            // Find the payment record
            ChappaPaymentDAL.findById(paymentId)
              .then((payment) => {
                if (!payment) {
                  done(new NotFoundError(`${ModelName} Not Found`))
                } else if (payment.status !== 'completed') {
                  done(new BadRequestError([`Payment with ID ${paymentId} is not completed and cannot be refunded`]))
                } else {
                  done(null, payment)
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (payment: ChappaPayment, done: Function) => {
            // Determine refund amount (full or partial)
            const refundAmount = amount || payment.amount
            
            if (refundAmount > payment.amount) {
              done(new BadRequestError([`Refund amount (${refundAmount}) cannot exceed original payment amount (${payment.amount})`]))
              return
            }
            
            // Get transaction reference from payment metadata
            const txRef = payment.transaction_id
            
            // Process refund with Chappa
            ChappaService.processRefund({
              tx_ref: txRef,
              amount: refundAmount,
              reason: reason || 'Customer requested refund'
            })
              .then((refundResponse) => {
                done(null, payment, refundResponse, refundAmount)
              })
              .catch((error) => {
                done(new InternalServerError(`Failed to process refund with Chappa: ${error.message || error}`))
              })
          },
          (payment: ChappaPayment, refundResponse: any, refundAmount: number, done: Function) => {
            createTransaction()
              .then((transaction) => done(null, payment, refundResponse, refundAmount, transaction))
              .catch((error) => done(new InternalServerError(error)))
          },
          (payment: ChappaPayment, refundResponse: any, refundAmount: number, transaction: Transaction, done: Function) => {
            // Update payment record with refund information
            const refundData = {
              status: refundAmount === payment.amount ? 'refunded' : 'partially_refunded',
              refunded_amount: refundAmount,
              refund_date: new Date(),
              refund_reason: reason,
              metadata: {
                ...payment.metadata,
                refund: {
                  amount: refundAmount,
                  date: new Date(),
                  reason: reason,
                  response: refundResponse
                }
              }
            }
            
            ChappaPaymentDAL.update(payment, refundData, transaction)
              .then((updatedPayment) => {
                done(null, updatedPayment, { obj: updatedPayment, transaction: transaction })
              })
              .catch((error) => 
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              )
          },
          (updatedPayment: ChappaPayment, result: any, done: Function) => {
            // Log the refund action
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: { status: 'completed' },
              new_data: { status: updatedPayment.status, refunded_amount: updatedPayment.amount },
              user_id: user.id,
            })
            
            // Create notification for the payment owner
            NotificationService.create({
              user_id: updatedPayment.user_id,
              notification_title: 'Payment Refunded',
              notification_body: `Your payment of ${updatedPayment.amount} ETB has been refunded${reason ? ': ' + reason : ''}`,
              notification_type: 'payment_refund',
              is_read: false,
              notification_category: "",
              notification_url: "/notification",
            } as any)
              .then(() => done(null, result))
              .catch((error) => {
                // Don't fail the whole operation if notification fails
                console.error('Failed to create refund notification:', error)
                done(null, result)
              })
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        }
      )
    })
  }
}

export default ChappaPaymentService

