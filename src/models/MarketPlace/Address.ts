import { DataTypes, Model, type Sequelize } from "sequelize"

export class Address extends Model {
  public id!: string
  public location!: object
  public user_id!: string
  public name!: string
  public address_line1!: string
  public address_line2!: string
  public city!: string
  public state!: string
  public postal_code!: string
  public country!: string
  public lat!: number
  public lng!: number
  public is_default!: boolean

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  Address.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      location: {
        type: DataTypes.GEOGRAPHY("POINT"),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_line1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address_line2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      lng: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "address",
      tableName: "addresses",
    },
  )

  return Address
}
