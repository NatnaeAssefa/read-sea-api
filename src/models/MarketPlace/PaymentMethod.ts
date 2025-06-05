import { DataTypes, Model, type Sequelize } from "sequelize"

export class PaymentMethod extends Model {
  public id!: string
  public user_id!: string
  public type!: string // 'credit_card', 'paypal', etc.
  public provider!: string
  public account_number!: string // Last 4 digits for cards
  public expiry_date!: string
  public is_default!: boolean
  public address_id!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  PaymentMethod.init(
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      address_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "payment_method",
      tableName: "payment_methods",
    },
  )

  return PaymentMethod
}
