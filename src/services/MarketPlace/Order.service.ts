import type { Transaction } from "sequelize"
import { 
  type Order, 
  OrderItem, 
  OrderTracking, 
  Product, 
  ProductImage, 
  Address, 
  PaymentMethod 
} from "../../models/MarketPlace"
import { File } from "../../models/System"
import async from "async"
import { createTransaction } from "../../utilities/database/sequelize";
import {
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import { OrderDAL } from "../../dals/MarketPlace";
import { Sequelize } from "sequelize";

const ModelName = "Order"

class OrderService {
  static create = (user: User, payload: Omit<Order, NullishPropertiesOf<Order>>): Promise<Order> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            OrderDAL.create(payload, transaction)
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

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: Order[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        order: [["total", "ASC"]],
      }

      OrderDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<Order | null> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      OrderDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static findOne = (options: any, paranoid?: boolean): Promise<Order | null> => {
    return new Promise((resolve, reject) => {
      OrderDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<Order, NullishPropertiesOf<Order>>,
    options?: any,
  ): Promise<Order> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            OrderDAL.findById(id, options)
              .then((Order) => {
                if (Order) {
                  done(null, transaction, Order)
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
          (transaction: Transaction, Order: Order, done: Function) => {
            const _Order = { ...Order.toJSON() }
            OrderDAL.update(Order, payload, transaction)
              .then((result) => {
                done(null, _Order, { obj: result, transaction: transaction })
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

  static delete = (user: User, id: string, options?: any, force?: boolean): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            OrderDAL.findById(id, options, force)
              .then((Order) => {
                if (Order) {
                  done(null, transaction, Order)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (transaction: Transaction, Order: Order, done: Function) => {
            OrderDAL.delete({ id: Order.id }, transaction, force)
              .then((result) => {
                done(null, Order, { obj: result, transaction: transaction })
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
              action: force ? LogActions.HARD_DELETE : LogActions.SOFT_DELETE,
              object: ModelName,
              prev_data: { id: id, options: options },
              new_data: obj,
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

  static findByUserId = (userId: string, options: any = {}, paranoid: boolean = true): Promise<{ rows: Order[]; count: number }> => {
    return new Promise((resolve, reject) => {
      const queryOptions = {
        ...options,
        where: {
          ...(options.where || {}),
          user_id: userId
        },
        order: [["createdAt", "DESC"]], // Most recent orders first
        include: [
          ...(options.include || []),
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                include: [
                  {
                    model: ProductImage,
                    include: [
                      {
                        model: File,
                        attributes: ["id", "path"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: OrderTracking,
            order: [["createdAt", "DESC"]],
          },
          {
            model: Address,
          },
          {
            model: PaymentMethod,
          }
        ]
      };

      OrderDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  };

  static findByCoordinates = (
    latitude: number, 
    longitude: number, 
    radiusInKm: number, 
    options: any = {}, 
    paranoid: boolean = true
  ): Promise<{ rows: Order[]; count: number }> => {
    return new Promise((resolve, reject) => {
      // Haversine formula
      const haversineFormula = `
        (
          6371 * acos(
            cos(radians(${latitude})) 
            * cos(radians(Address.lat)) 
            * cos(radians(Address.lng) - radians(${longitude})) 
            + sin(radians(${latitude})) 
            * sin(radians(Address.lat))
          )
        )
      `;

      const queryOptions = {
        ...options,
        include: [
          // Include everything from the original options if any
          ...(options.include || []),
          {
            model: Address,
            where: Sequelize.literal(`${haversineFormula} <= ${radiusInKm}`),
            attributes: {
              include: [
                [Sequelize.literal(haversineFormula), 'distance']
              ]
            }
          },
          {
            model: OrderItem,
            include: [
              {
                model: Product,
                include: [
                  {
                    model: ProductImage,
                    include: [
                      {
                        model: File,
                        attributes: ["id", "path"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: OrderTracking,
            order: [["createdAt", "DESC"]],
          },
          {
            model: PaymentMethod,
          }
        ],
        // Order results by distance (closest first)
        order: [[Sequelize.literal(haversineFormula), 'ASC']]
      };

      OrderDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  };
}

export default OrderService
