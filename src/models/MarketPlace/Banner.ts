import { DataTypes, Model, Sequelize } from "sequelize";
import { GeneralStatus, BannerTargetAudience } from "../../utilities/constants/Constants";

export class Banner extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public image_url!: string;
  public link_url!: string;
  public start_date!: Date;
  public end_date!: Date;
  public status!: string;
  public priority!: number;
  public target_audience!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Banner.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        // validate: {
        //   isUrl: true
        // }
      },
      link_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Banner becomes active from this date",
        validate: {
          isDate: true,
          notNull: true
        }
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Banner becomes inactive after this date",
        validate: {
          isDate: true,
          notNull: true,
          isAfterStartDate(value: Date) {
            if (value <= (this as any).start_date) {
              throw new Error('End date must be after start date');
            }
          }
        }
      },
      status: {
        type: DataTypes.ENUM(...Object.values(GeneralStatus)),
        allowNull: false,
        defaultValue: GeneralStatus.ACTIVE
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Higher numbers indicate higher priority for display order",
        validate: {
          min: 0,
          max: 999
        }
      },
      target_audience: {
        type: DataTypes.ENUM(...Object.values(BannerTargetAudience)),
        allowNull: false,
        defaultValue: BannerTargetAudience.ALL,
        comment: "Target audience for the banner",
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "banner",
      tableName: "banners",
      deletedAt: "deletedAt",
      indexes: [
        {
          fields: ['status']
        },
        {
          fields: ['start_date', 'end_date']
        },
        {
          fields: ['priority']
        },
        {
          fields: ['status', 'start_date', 'end_date', 'priority']
        }
      ]
    }
  );
};
