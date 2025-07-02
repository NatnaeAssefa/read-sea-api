import { DataTypes, Model, type Sequelize } from "sequelize"
import { OrderStatus } from "../../utilities/constants/Constants";

export class Order extends Model {
  public id!: string
  public user_id!: string
  public order_number!: string
  public status!: string // 'processing', 'shipped', 'delivered', 'cancelled'
  public address_id!: string
  public payment_method_id!: string
  public subtotal!: number
  public shipping_fee!: number
  public tax!: number
  public total!: number
  public estimated_delivery!: Date
  public promo_code_id!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  Order.init(
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
      order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(OrderStatus)),
        allowNull: false,
        defaultValue: OrderStatus.PROCESSING,
      },
      address_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      payment_method_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estimated_delivery: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      promo_code_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "order",
      tableName: "orders",
    },
  )

  return Order
}
