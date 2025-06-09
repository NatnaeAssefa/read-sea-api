import type { Transaction } from "sequelize"
import { ChappaPayment as BaseModel } from "../../models/MarketPlace"
import BaseDAL from "../Base.dal"

class ChappaPaymentDAL {
  static create = (payload: Partial<BaseModel>, t?: Transaction): Promise<BaseModel> => {
    return BaseDAL.create<BaseModel>(BaseModel, payload, t)
  }

  static findMany = (options: any, paranoid = false): Promise<{ rows: BaseModel[]; count: number }> => {
    return BaseDAL.findMany<BaseModel>(BaseModel, options, paranoid)
  }

  static findById = (id: string, options?: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findById<BaseModel>(BaseModel, id, options, paranoid)
  }

  static findOne = (options: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid)
  }

  static update = (obj: BaseModel, payload: Partial<BaseModel>, t?: Transaction): Promise<BaseModel> => {
    return BaseDAL.update<BaseModel>(BaseModel, obj, payload, t)
  }

  static delete = (where: any, t?: Transaction, force = false): Promise<boolean> => {
    return BaseDAL.delete<BaseModel>(BaseModel, where, t, force)
  }
}

export default ChappaPaymentDAL