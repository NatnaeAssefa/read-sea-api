import { DataTypes, Model, type Sequelize } from "sequelize"

export class Product extends Model {
  public id!: string
  public name!: string
  public description!: string
  public price!: number
  public stock!: number
  public rating!: number
  public review_count!: number
  public featured!: boolean
  public trending!: boolean
  public category_id!: string

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  Product.init(
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
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
      },
      review_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      trending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product",
      tableName: "products",
    },
  )

  return Product
}
