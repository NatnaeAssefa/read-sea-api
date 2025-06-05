import type { Transaction } from "sequelize"
import { type SearchHistory } from "../../models/MarketPlace"
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
import { SearchHistoryDAL } from "../../dals/MarketPlace";

const ModelName = "SearchHistory"

class SearchHistoryService {
  static create = (user: User, payload: Omit<SearchHistory, NullishPropertiesOf<SearchHistory>>): Promise<SearchHistory> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            SearchHistoryDAL.create(payload, transaction)
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

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: SearchHistory[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        SearchHistory: [["name", "ASC"]],
      }

      SearchHistoryDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<SearchHistory | null> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      SearchHistoryDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static findOne = (options: any, paranoid?: boolean): Promise<SearchHistory | null> => {
    return new Promise((resolve, reject) => {
      SearchHistoryDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<SearchHistory, NullishPropertiesOf<SearchHistory>>,
    options?: any,
  ): Promise<SearchHistory> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            SearchHistoryDAL.findById(id, options)
              .then((SearchHistory) => {
                if (SearchHistory) {
                  done(null, transaction, SearchHistory)
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
          (transaction: Transaction, SearchHistory: SearchHistory, done: Function) => {
            const _SearchHistory = { ...SearchHistory.toJSON() }
            SearchHistoryDAL.update(SearchHistory, payload, transaction)
              .then((result) => {
                done(null, _SearchHistory, { obj: result, transaction: transaction })
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
            SearchHistoryDAL.findById(id, options, force)
              .then((SearchHistory) => {
                if (SearchHistory) {
                  done(null, transaction, SearchHistory)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (transaction: Transaction, SearchHistory: SearchHistory, done: Function) => {
            SearchHistoryDAL.delete({ id: SearchHistory.id }, transaction, force)
              .then((result) => {
                done(null, SearchHistory, { obj: result, transaction: transaction })
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
}

export default SearchHistoryService
