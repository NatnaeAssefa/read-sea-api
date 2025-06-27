import type { Transaction } from "sequelize"
import { Op } from "sequelize"
import { Banner as BaseModel } from "../../models/MarketPlace"
import BaseDAL from "../Base.dal"

class BannerDAL {
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

  // Custom method for finding active banners within date range
  static findActiveBanners = (options: any = {}, paranoid = false): Promise<{ rows: BaseModel[]; count: number }> => {
    const currentDate = new Date()
    
    const activeOptions = {
      ...options,
      where: {
        ...options.where,
        status: 'Active',
        start_date: {
          [Op.lte]: currentDate
        },
        end_date: {
          [Op.gte]: currentDate
        }
      },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    }

    return BaseDAL.findMany<BaseModel>(BaseModel, activeOptions, paranoid)
  }

  // Custom method for finding banners by date range
  static findByDateRange = (startDate: Date, endDate: Date, options: any = {}, paranoid = false): Promise<{ rows: BaseModel[]; count: number }> => {
    const dateRangeOptions = {
      ...options,
      where: {
        ...options.where,
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            end_date: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            [Op.and]: [
              {
                start_date: {
                  [Op.lte]: startDate
                }
              },
              {
                end_date: {
                  [Op.gte]: endDate
                }
              }
            ]
          }
        ]
      },
      order: [
        ['priority', 'DESC'],
        ['start_date', 'ASC']
      ]
    }

    return BaseDAL.findMany<BaseModel>(BaseModel, dateRangeOptions, paranoid)
  }
}

export default BannerDAL
