import { DataTypes, Model, type Sequelize } from "sequelize";
import { GeneralStatus } from "../../utilities/constants/Constants";

export class ProductRating extends Model {
  public id!: string;
  public user_id!: string;
  public product_id!: string;
  public rating!: number; // 1-5 stars
  public review_title!: string;
  public review_text!: string;
  public is_verified_purchase!: boolean; // Only users who bought the product can leave verified reviews
  public helpful_count!: number; // Number of users who found this review helpful
  public unhelpful_count!: number; // Number of users who found this review unhelpful
  public status!: string; // 'Active', 'Pending', 'Blocked', 'Archived'
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductRating.init(
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
        comment: "User who submitted the rating",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Product being rated",
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        },
        comment: "Rating from 1 to 5 stars",
      },
      review_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Optional title for the review",
      },
      review_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Optional detailed review text",
      },
      is_verified_purchase: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether this rating is from a verified purchase",
      },
      helpful_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of users who found this review helpful",
      },
      unhelpful_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of users who found this review unhelpful",
      },
      status: {
        type: DataTypes.ENUM(...Object.values(GeneralStatus)),
        allowNull: false,
        defaultValue: GeneralStatus.ACTIVE,
        comment: "Status of the rating/review",
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_rating",
      tableName: "product_ratings",
      indexes: [
        {
          fields: ['product_id']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['rating']
        },
        {
          fields: ['status']
        },
        {
          fields: ['is_verified_purchase']
        },
        {
          // Composite index for product ratings with status
          fields: ['product_id', 'status']
        },
        {
          // Unique constraint: one rating per user per product
          unique: true,
          fields: ['user_id', 'product_id']
        }
      ]
    }
  );

  return ProductRating;
};
