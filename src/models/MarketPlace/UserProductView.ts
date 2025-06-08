import { DataTypes, Model, type Sequelize } from "sequelize"
import { Product } from "./Product"

export class UserProductView extends Model {
  public id!: string
  public user_id!: string
  public product_id!: string
  public view_count!: number
  public last_viewed!: Date
  public product!: Product

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  UserProductView.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      last_viewed: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "user_product_view",
      tableName: "user_product_views"
    },
  )

  return UserProductView
}