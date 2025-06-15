import { DataTypes, Model, Sequelize } from "sequelize";
import { GeneralStatus } from "../../utilities/constants/Constants";

export class PromoCode extends Model {
  public id!: string;
  public discount_percentage!: number
  public code!: string;
  public expiry_date!: Date;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export default (sequelize: Sequelize) => {
  PromoCode.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      discount_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM(...Object.values(GeneralStatus)),
        allowNull: false,
        defaultValue: GeneralStatus.ACTIVE
      },
      expiry_date: {
        type: DataTypes.DATE,
        comment: "Marks the expiration of the promo-code!",
        allowNull: true,
        defaultValue: () => {
          const today = new Date();
          today.setMonth(today.getMonth() + 7);
          return today;
        },
      }
    },
    {
      sequelize,
      paranoid: true,
      modelName: "promo_code",
      tableName: "promo_codes",
    }
  );
};
