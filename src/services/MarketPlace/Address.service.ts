import type { Transaction } from "sequelize"
import { type Address } from "../../models/MarketPlace"
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
import { AddressDAL } from "../../dals/MarketPlace";
import { GlobalAuthOptionsNew } from "../../middleware/Auth/Auth";
import sequelize, { Op } from "sequelize";

const ModelName = "Address"

class AddressService {
  static AuthOptions = (user: User, options: any, paranoid?: boolean) => {
    return GlobalAuthOptionsNew(user, options, null, null, paranoid);
  };
  
  static create = (user: User, payload: Omit<Address, NullishPropertiesOf<Address>>): Promise<Address> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            payload.user_id = user.id
            payload.location = {
              type: "Point",
              coordinates: [payload.lng, payload.lat],
            },

              AddressDAL.create(payload, transaction)
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

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: Address[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        Address: [["name", "ASC"]],
      }

      AddressDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<Address | null> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      AddressDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }
  static findByUserId = (userId: string, options?: any, paranoid?: boolean): Promise<{rows: Address[]; count: number}> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        where: {
          ...(options?.where || {}),
          user_id: userId
        }
      }

      AddressDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static findOne = (options: any, paranoid?: boolean): Promise<Address | null> => {
    return new Promise((resolve, reject) => {
      AddressDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<Address, NullishPropertiesOf<Address>>,
    options?: any,
  ): Promise<Address> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            AddressDAL.findById(id, options)
              .then((Address) => {
                if (Address) {
                  done(null, transaction, Address)
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
          (transaction: Transaction, Address: Address, done: Function) => {
            const _Address = { ...Address.toJSON() }
            AddressDAL.update(Address, payload, transaction)
              .then((result) => {
                done(null, _Address, { obj: result, transaction: transaction })
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
            AddressDAL.findById(id, options, force)
              .then((Address) => {
                if (Address) {
                  done(null, transaction, Address)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (transaction: Transaction, Address: Address, done: Function) => {
            AddressDAL.delete({ id: Address.id }, transaction, force)
              .then((result) => {
                done(null, Address, { obj: result, transaction: transaction })
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

  static findByCoordinate = (
    user: User,
    options: any,
    lat: number,
    lng: number,
    radius: number,
    paranoid?: boolean
  ): Promise<{ rows: Address[]; count: number }> => {
    return new Promise((resolve, reject) => {
      let authOptions = AddressService.AuthOptions(user, options, paranoid);

      // Add PostGIS spatial query in the where clause using Sequelize's raw SQL
      authOptions.options.where = {
        ...authOptions.options.where,
        [Op.and]: sequelize.literal(`
          ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
            ${radius}
          )
        `),
      };

      // Add the ST_Distance calculation in the attributes
      authOptions.options.attributes = {
        include: [
          [
            sequelize.literal(`
          ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          )
        `),
            "distance",
          ],
        ],
      };

      // Sort by the calculated distance
      authOptions.options.order = [[sequelize.literal('distance'), 'ASC']];

      AddressDAL.findMany(authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  };

 
}

export default AddressService
