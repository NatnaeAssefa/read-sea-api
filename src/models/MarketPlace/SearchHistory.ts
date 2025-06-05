import { DataTypes, Model, type Sequelize } from "sequelize"

export class SearchHistory extends Model {
  public id!: string
  public user_id!: string
  public query!: string
  public last_searched!: Date
  public search_count!: number

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export default (sequelize: Sequelize) => {
  SearchHistory.init(
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
      query: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_searched: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      search_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "search_history",
      tableName: "search_histories"
    },
  )

  return SearchHistory
}
