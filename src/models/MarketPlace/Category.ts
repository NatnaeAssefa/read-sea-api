import { DataTypes, Model, type Sequelize } from "sequelize"

export class Category extends Model {
  public id!: string
  public name!: string
  public description!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      sequelize,
      paranoid: true,
      modelName: "category",
      tableName: "categories",
    },
  )

  return Category
}
