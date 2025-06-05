import type { Transaction } from "sequelize"
import { PaymentMethod as BaseModel } from "../../models/MarketPlace"
import BaseDAL from "../Base.dal"

class PaymentMethodDAL {
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

  static bulk_update = (rule: any, payload: Partial<BaseModel>, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_update<BaseModel>(BaseModel, rule, payload, t)
  }

  static delete = (query: any, t?: Transaction, force = false): Promise<boolean> => {
    return BaseDAL.delete<BaseModel>(BaseModel, query, t, force)
  }

  static bulk_delete = (rule: any, t?: Transaction, force = false): Promise<boolean> => {
    return BaseDAL.bulk_delete<BaseModel>(BaseModel, rule, t, force)
  }

  static restore = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.restore<BaseModel>(BaseModel, query, t)
  }

  static bulk_restore = (rule: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_restore<BaseModel>(BaseModel, rule, t)
  }
}

export default PaymentMethodDAL
