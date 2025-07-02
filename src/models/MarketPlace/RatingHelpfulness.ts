import { DataTypes, Model, type Sequelize } from "sequelize";

export class RatingHelpfulness extends Model {
  public id!: string;
  public user_id!: string;
  public product_rating_id!: string;
  public is_helpful!: boolean; // true = helpful, false = unhelpful
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  RatingHelpfulness.init(
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
        comment: "User who marked the rating as helpful/unhelpful",
      },
      product_rating_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Rating being marked as helpful/unhelpful",
      },
      is_helpful: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "true = helpful, false = unhelpful",
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "rating_helpfulness",
      tableName: "rating_helpfulness",
      indexes: [
        {
          fields: ['product_rating_id']
        },
        {
          fields: ['user_id']
        },
        {
          // Unique constraint: one helpfulness vote per user per rating
          unique: true,
          fields: ['user_id', 'product_rating_id']
        }
      ]
    }
  );

  return RatingHelpfulness;
};
