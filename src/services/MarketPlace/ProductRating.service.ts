import async from "async";
import { Transaction } from "sequelize";
import { User } from "../../models/User";
import { ProductRating, Product, Order, OrderItem } from "../../models/MarketPlace";
import { ProductRatingDAL, ProductDAL, OrderDAL, OrderItemDAL, RatingHelpfulnessDAL } from "../../dals/MarketPlace";
import { createTransaction } from "../../utilities/database/sequelize";
import { InternalServerError, NotFoundError, BadRequestError, ForbiddenError } from "../../errors/Errors";


const ModelName = "ProductRating";

interface CreateRatingPayload {
  product_id: string;
  rating: number;
  review_title?: string;
  review_text?: string;
}

interface UpdateRatingPayload {
  rating?: number;
  review_title?: string;
  review_text?: string;
}

class ProductRatingService {
  // Create a new rating for a product
  static create = (user: User, payload: CreateRatingPayload): Promise<ProductRating> => {
    return new Promise((resolve, reject) => {
      let transaction: Transaction | null = null;

      async.waterfall(
        [
          // Start transaction
          (done: any) => {
            createTransaction()
              .then((t) => {
                transaction = t;
                done(null, t);
              })
              .catch((error) => done(new InternalServerError("error")));
          },
          // Validate product exists
          (transaction: Transaction, done: any) => {
            ProductDAL.findById(payload.product_id)
              .then((product) => {
                if (!product) {
                  return done(new NotFoundError("Product not found"), null);
                }
                done(null, product, transaction);
              })
              .catch((error) => done(new InternalServerError(error), null));
          },
          // Check if user already rated this product
          (product: Product, transaction: Transaction, done: any) => {
            ProductRatingDAL.findUserRatingForProduct(user.id, payload.product_id)
              .then((existingRating) => {
                if (existingRating) {
                  return done(new BadRequestError(["You have already rated this product"]), null);
                }
                done(null, product, transaction);
              })
              .catch((error) => done(new InternalServerError(error), null));
          },
          // Check if user has purchased this product (for verified purchase flag)
          (product: Product, transaction: Transaction, done: any) => {
            OrderItemDAL.findOne({
              include: [{
                model: Order,
                where: { user_id: user.id },
                required: true
              }],
              where: { product_id: payload.product_id }
            })
              .then((orderItem) => {
                const isVerifiedPurchase = !!orderItem;
                done(null, product, isVerifiedPurchase, transaction);
              })
              .catch((error) => done(new InternalServerError(error), null));
          },
          // Create the rating
          (product: Product, isVerifiedPurchase: boolean, transaction: Transaction, done: any) => {
            const ratingData = {
              ...payload,
              user_id: user.id,
              is_verified_purchase: isVerifiedPurchase,
              status: 'Active'
            };

            ProductRatingDAL.create(ratingData, transaction)
              .then((rating) => {
                done(null, rating, product, transaction);
              })
              .catch((error) => {
                done(new InternalServerError(error), null);
              });
          },
          // Update product's cumulative rating
          (rating: ProductRating, product: Product, transaction: Transaction, done: any) => {
            this.updateProductRating(payload.product_id, transaction)
              .then(() => done(null, rating))
              .catch((error) => done(new InternalServerError(error), null));
          }
        ],
        (error: any, rating: any) => {
          if (error) {
            if (transaction) {
              transaction.rollback();
            }
            return reject(error);
          }

          if (transaction) {
            transaction.commit();
          }
          resolve(rating);
        }
      );
    });
  };

  // Update an existing rating
  static update = (user: User, ratingId: string, payload: UpdateRatingPayload): Promise<ProductRating> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          // Start transaction
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          // Find and validate rating ownership
          (transaction: Transaction, done: Function) => {
            ProductRatingDAL.findById(ratingId)
              .then((rating) => {
                if (!rating) {
                  return done(new NotFoundError("Rating not found"), { transaction });
                }
                if (rating.user_id !== user.id) {
                  return done(new ForbiddenError("You can only update your own ratings"), { transaction });
                }
                done(null, rating, transaction);
              })
              .catch((error) => done(new InternalServerError(error), { transaction }));
          },
          // Update the rating
          (rating: ProductRating, transaction: Transaction, done: Function) => {
            ProductRatingDAL.update(rating, payload, transaction)
              .then(() => done(null, rating, transaction))
              .catch((error) => done(new InternalServerError(error), { transaction }));
          },
          // Update product's cumulative rating if rating value changed
          (rating: ProductRating, transaction: Transaction, done: Function) => {
            if (payload.rating !== undefined) {
              this.updateProductRating(rating.product_id, transaction)
                .then(() => done(null, rating, transaction))
                .catch((error) => done(new InternalServerError(error), { transaction }));
            } else {
              done(null, rating, transaction);
            }
          },
          // Get updated rating
          (rating: ProductRating, transaction: Transaction, done: Function) => {
            ProductRatingDAL.findById(ratingId)
              .then((updatedRating) => done(null, updatedRating, { transaction }))
              .catch((error) => done(new InternalServerError(error), { transaction }));
          }
        ],
        (error: any, result: any) => {
          if (error) {
            if (result?.transaction) {
              result.transaction.rollback();
            }
            return reject(error);
          }

          result.transaction.commit();
          resolve(result);
        }
      );
    });
  };

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<ProductRating | null> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      ProductRatingDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  // Delete a rating
  static delete = (user: User, ratingId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          // Start transaction
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          // Find and validate rating ownership
          (transaction: Transaction, done: Function) => {
            ProductRatingDAL.findById(ratingId)
              .then((rating) => {
                if (!rating) {
                  return done(new NotFoundError("Rating not found"), { transaction });
                }
                if (rating.user_id !== user.id) {
                  return done(new ForbiddenError("You can only delete your own ratings"), { transaction });
                }
                done(null, rating, transaction);
              })
              .catch((error) => done(new InternalServerError(error), { transaction }));
          },
          // Delete the rating
          (rating: ProductRating, transaction: Transaction, done: Function) => {
            ProductRatingDAL.delete({ id: ratingId }, transaction)
              .then(() => done(null, rating, transaction))
              .catch((error) => done(new InternalServerError(error), { transaction }));
          },
          // Update product's cumulative rating
          (rating: ProductRating, transaction: Transaction, done: Function) => {
            this.updateProductRating(rating.product_id, transaction)
              .then(() => done(null, true, { transaction }))
              .catch((error) => done(new InternalServerError(error), { transaction }));
          }
        ],
        (error: any, result: any) => {
          if (error) {
            if (result?.transaction) {
              result.transaction.rollback();
            }
            return reject(error);
          }

          result.transaction.commit();
          resolve(result);
        }
      );
    });
  };

  // Get ratings for a product with filtering and pagination
  static getProductRatings = (
    productId: string,
    filters: {
      rating?: number;
      verifiedPurchaseOnly?: boolean;
      sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<{ ratings: ProductRating[]; total: number; stats: any }> => {
    return new Promise((resolve, reject) => {
      async.parallel(
        {
          // Get filtered ratings
          ratings: (done: Function) => {
            const { page = 1, limit = 10 } = pagination;
            const offset = (page - 1) * limit;

            ProductRatingDAL.findWithFilters(productId, filters, {
              limit,
              offset,
              include: [
                {
                  model: User,
                  attributes: ['id', 'email'] // Only include safe user data
                }
              ]
            })
              .then((result) => done(null, result))
              .catch((error) => done(new InternalServerError(error)));
          },
          // Get rating statistics
          stats: (done: Function) => {
            ProductRatingDAL.getProductRatingStats(productId)
              .then((stats) => done(null, stats))
              .catch((error) => done(new InternalServerError(error)));
          }
        },
        (error: any, results: any) => {
          if (error) {
            return reject(error);
          }

          resolve({
            ratings: results.ratings.rows,
            total: results.ratings.count,
            stats: results.stats
          });
        }
      );
    });
  };

  // Toggle helpfulness vote for a rating
  static toggleHelpfulness = async (user: User, ratingId: string, isHelpful: boolean): Promise<any> => {
    const transaction = await createTransaction();

    try {
      // Validate rating exists
      const rating = await ProductRatingDAL.findById(ratingId);
      if (!rating) {
        throw new NotFoundError("Rating not found");
      }

      // Prevent users from voting on their own ratings
      if (rating.user_id === user.id) {
        throw new BadRequestError(["You cannot vote on your own rating"]);
      }

      // Toggle helpfulness vote
      const voteResult = await RatingHelpfulnessDAL.toggleHelpfulnessVote(user.id, ratingId, isHelpful, transaction);

      // Update rating helpfulness counts
      const stats = await RatingHelpfulnessDAL.getRatingHelpfulnessStats(ratingId, transaction);
      await ProductRatingDAL.update(
        rating,
        {
          helpful_count: stats.helpfulCount,
          unhelpful_count: stats.unhelpfulCount
        },
        transaction
      );

      await transaction.commit();
      return voteResult;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new InternalServerError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Helper method to update product's cumulative rating
  private static updateProductRating = async (productId: string, transaction?: Transaction): Promise<void> => {
    const stats = await ProductRatingDAL.getProductRatingStats(productId, transaction);

    const product = await ProductDAL.findById(productId);
    if (product) {
      await ProductDAL.update(
        product,
        {
          rating: stats.averageRating,
          review_count: stats.totalRatings
        },
        transaction
      );
    }
  };

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: ProductRating[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      ProductRatingDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  // Get rating statistics for a product
  static getProductRatingStats = (productId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      ProductRatingDAL.getProductRatingStats(productId)
        .then((result) => resolve(result))
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  // Get user's ratings
  static getUserRatings = (userId: string, options?: any, pagination?: any): Promise<{ rows: ProductRating[]; count: number }> => {
    return new Promise((resolve, reject) => {
      const queryOptions = {
        where: {
          user_id: userId,
          ...options?.where
        },
        ...options,
        ...pagination
      };

      ProductRatingDAL.findMany(queryOptions)
        .then((result) => resolve(result))
        .catch((error) => reject(new InternalServerError(error)));
    });
  };
}

export default ProductRatingService;
