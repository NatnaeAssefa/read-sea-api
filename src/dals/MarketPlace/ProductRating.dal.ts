import { Transaction, Op, QueryTypes } from "sequelize";
import { ProductRating as BaseModel } from "../../models/MarketPlace";
import BaseDAL from "../Base.dal";

class ProductRatingDAL {
  static create = (payload: Partial<BaseModel>, t?: Transaction): Promise<BaseModel> => {
    console.log('🔍 ProductRatingDAL.create called with:', payload);
    console.log('🔍 BaseModel:', typeof BaseModel);
    console.log('🔍 BaseModel.create:', typeof BaseModel?.create);
    console.log('🔍 BaseModel name:', BaseModel?.name);

    return BaseDAL.create<BaseModel>(BaseModel, payload, t);
  };

  static findMany = (options: any, paranoid = false): Promise<{ rows: BaseModel[]; count: number }> => {
    return BaseDAL.findMany<BaseModel>(BaseModel, options, paranoid);
  };

  static findById = (id: string, options?: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findById<BaseModel>(BaseModel, id, options, paranoid);
  };

  static findOne = (options: any, paranoid = false): Promise<BaseModel | null> => {
    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid);
  };

  static update = (obj: BaseModel, payload: any, t?: Transaction): Promise<BaseModel> => {
    return BaseDAL.update<BaseModel>(BaseModel, obj, payload, t);
  };

  static delete = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.delete<BaseModel>(BaseModel, query, t);
  };

  static restore = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.restore<BaseModel>(BaseModel, query, t);
  };

  static bulk_restore = (rule: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_restore<BaseModel>(BaseModel, rule, t);
  };

  // Custom method for finding ratings by product with pagination and filtering
  static findByProduct = (
    productId: string, 
    options: any = {}, 
    paranoid = false
  ): Promise<{ rows: BaseModel[]; count: number }> => {
    const productOptions = {
      ...options,
      where: {
        ...options.where,
        product_id: productId,
        status: 'Active'
      },
      order: [
        ['helpful_count', 'DESC'], // Most helpful first
        ['createdAt', 'DESC'] // Then newest first
      ]
    };

    return BaseDAL.findMany<BaseModel>(BaseModel, productOptions, paranoid);
  };

  // Custom method for finding ratings by user
  static findByUser = (
    userId: string, 
    options: any = {}, 
    paranoid = false
  ): Promise<{ rows: BaseModel[]; count: number }> => {
    const userOptions = {
      ...options,
      where: {
        ...options.where,
        user_id: userId
      },
      order: [
        ['createdAt', 'DESC']
      ]
    };

    return BaseDAL.findMany<BaseModel>(BaseModel, userOptions, paranoid);
  };

  // Custom method for checking if user has already rated a product
  static findUserRatingForProduct = (
    userId: string, 
    productId: string, 
    paranoid = false
  ): Promise<BaseModel | null> => {
    const options = {
      where: {
        user_id: userId,
        product_id: productId
      }
    };

    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid);
  };

  // Custom method for getting rating statistics for a product
  static getProductRatingStats = async (productId: string, transaction?: Transaction): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }> => {
    // Use raw query with transaction to ensure we see uncommitted data
    const query = `
      SELECT rating
      FROM product_ratings
      WHERE product_id = :productId
      AND status = 'Active'
    `;

    const ratings = await BaseModel.sequelize?.query(query, {
      replacements: { productId },
      type: QueryTypes.SELECT,
      transaction
    }) as any[];

    const totalRatings = ratings.length;
    if (totalRatings === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    // Calculate average rating
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const averageRating = Math.round((sum / totalRatings) * 10) / 10; // Round to 1 decimal place

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating,
      totalRatings,
      ratingDistribution
    };
  };

  // Custom method for finding ratings with filters (rating value, verified purchase, etc.)
  static findWithFilters = (
    productId: string,
    filters: {
      rating?: number;
      verifiedPurchaseOnly?: boolean;
      sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
    },
    options: any = {},
    paranoid = false
  ): Promise<{ rows: BaseModel[]; count: number }> => {
    const whereClause: any = {
      product_id: productId,
      status: 'Active'
    };

    // Add rating filter
    if (filters.rating) {
      whereClause.rating = filters.rating;
    }

    // Add verified purchase filter
    if (filters.verifiedPurchaseOnly) {
      whereClause.is_verified_purchase = true;
    }

    // Determine sort order
    let orderClause: any[] = [];
    switch (filters.sortBy) {
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      case 'helpful':
        orderClause = [['helpful_count', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating_high':
        orderClause = [['rating', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'rating_low':
        orderClause = [['rating', 'ASC'], ['createdAt', 'DESC']];
        break;
      case 'newest':
      default:
        orderClause = [['createdAt', 'DESC']];
        break;
    }

    const filterOptions = {
      ...options,
      where: {
        ...options.where,
        ...whereClause
      },
      order: orderClause
    };

    return BaseDAL.findMany<BaseModel>(BaseModel, filterOptions, paranoid);
  };
}

export default ProductRatingDAL;
