import { DataTypes, Model, type Sequelize } from "sequelize"

export class ChappaPayment extends Model {
  public id!: string
  public user_id!: string
  public payment_method_id!: string
  public order_id!: string
  public transaction_id!: string
  public amount!: number
  public currency!: string
  public status!: string // 'pending', 'completed', 'failed', 'refunded'
  public payment_date!: Date
  public metadata!: object

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  ChappaPayment.init(
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
      payment_method_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ETB',
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "chappa_payment",
      tableName: "chappa_payments",
    },
  )

  return ChappaPayment
}