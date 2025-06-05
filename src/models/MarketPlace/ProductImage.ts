import { DataTypes, Model, type Sequelize } from "sequelize"

export class ProductImage extends Model {
  public id!: string
  public product_id!: string
  public file_id!: string
  public is_primary!: boolean

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  ProductImage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      file_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_image",
      tableName: "product_images",
    },
  )

  return ProductImage
}
