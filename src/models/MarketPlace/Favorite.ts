import { DataTypes, Model, type Sequelize } from "sequelize"

export class Favorite extends Model {
  public id!: string
  public user_id!: string
  public product_id!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  Favorite.init(
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
    },
    {
      sequelize,
      paranoid: true,
      modelName: "favorite",
      tableName: "favorites",
    },
  )

  return Favorite
}
