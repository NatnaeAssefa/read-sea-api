import { DataTypes, Model, type Sequelize } from "sequelize"

export class AppSetting extends Model {
  public id!: string
  public user_id!: string
  public language!: string
  public theme!: string
  public notifications_enabled!: boolean
  public email_notifications!: boolean
  public push_notifications!: boolean

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  AppSetting.init(
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
        unique: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "en",
      },
      theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "light",
      },
      notifications_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      email_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      push_notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "app_setting",
      tableName: "app_settings",
    },
  )

  return AppSetting
}
