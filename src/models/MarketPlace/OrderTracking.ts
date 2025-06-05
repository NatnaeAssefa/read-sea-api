import { DataTypes, Model, type Sequelize } from "sequelize"

export class OrderTracking extends Model {
  public id!: string
  public order_id!: string
  public status!: string
  public description!: string
  public location!: string
  public latitude!: number
  public longitude!: number
  public timestamp!: Date

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  OrderTracking.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "order_tracking",
      tableName: "order_trackings",
    },
  )

  return OrderTracking
}
