import type { Transaction } from "sequelize"
import { Category, Product, ProductImage, } from "../../models/MarketPlace"
import async from "async"
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { FileDAL } from "../../dals/System";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import { File } from "../../models/System";
import UserProductViewDAL from "../../dals/MarketPlace/UserProductView.dal"
import { UserProductView } from "../../models/MarketPlace/UserProductView"

import { Op } from "sequelize"
import { ProductDAL, ProductImageDAL } from "../../dals/MarketPlace";

const ModelName = "Product"

interface CreateProductWithImagesPayload {
  product: Omit<Product, NullishPropertiesOf<Product>>;
  files?: string[];
}

class ProductService {
  static create = (user: User, payload: Omit<Product, NullishPropertiesOf<Product>>): Promise<Product> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ProductDAL.create(payload, transaction)
              .then((result) => {
                done(null, result, { obj: result, transaction: transaction })
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: obj,
              user_id: user?.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            // Fix: Don't reject twice
            if (result && result.transaction) {
              result.transaction.rollback()
              reject(error)
            } else {
              reject(error || new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: Product[]; count: number }> => {
    return new Promise((resolve, reject) => {
      const includeOptions = [
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: ProductImage,
          include: [
            {
              model: File,
              attributes: ["id", "path"],
            },
          ],
        },
      ]

      const queryOptions = {
        ...options,
        include: includeOptions,
        order: [["createdAt", "DESC"]],
      }

      ProductDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<Product | null> => {
    return new Promise((resolve, reject) => {
      const includeOptions = [
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: ProductImage,
          include: [
            {
              model: File,
              attributes: ["id", "path"],
            },
          ],
        },
      ]

      const queryOptions = {
        ...options,
        include: includeOptions,
      }

      ProductDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static findOne = (options: any, paranoid?: boolean): Promise<Product | null> => {
    return new Promise((resolve, reject) => {
      ProductDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static getFeaturedProducts = (limit = 4): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const options = {
        where: { featured: true },
        limit,
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: ProductImage,
            include: [
              {
                model: File,
                attributes: ["id", "path"],
              },
            ],
          },
        ],
        order: [["rating", "DESC"]],
      }

      ProductDAL.findMany(options)
        .then((result) => {
          resolve(result.rows)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static getTrendingProducts = (limit = 8): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const options = {
        where: { trending: true },
        limit,
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
          {
            model: ProductImage,
            include: [
              {
                model: File,
                attributes: ["id", "path"],
              },
            ],
          },
        ],
        order: [["review_count", "DESC"]],
      }

      ProductDAL.findMany(options)
        .then((result) => {
          resolve(result.rows)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static searchProducts = (query: string, limit = 10): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const options = {
        where: {
          name: {
            [Op.iLike]: `%${query}%`,
          },
        },
        limit,
        include: [
          {
            model: Category,
            attributes: ["id", "name"],
          },
        ],
      }

      ProductDAL.findMany(options)
        .then((result) => {
          resolve(result.rows)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<Product, NullishPropertiesOf<Product>>,
    options?: any,
  ): Promise<Product> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ProductDAL.findById(id, options)
              .then((product) => {
                if (product) {
                  done(null, transaction, product)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (transaction: Transaction, product: Product, done: Function) => {
            const _product = { ...product.toJSON() }
            ProductDAL.update(product, payload, transaction)
              .then((result) => {
                done(null, _product, { obj: result, transaction: transaction })
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: obj,
              new_data: payload,
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            // Fix: Don't reject twice
            if (result && result.transaction) {
              result.transaction.rollback()
              reject(error)
            } else {
              reject(error || new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static delete = (user: User, id: string, options?: any, force?: boolean): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ProductDAL.findById(id, options, force)
              .then((product) => {
                if (product) {
                  done(null, transaction, product)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) => 
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              )
          },
          (transaction: Transaction, product: Product, done: Function) => {
            ProductDAL.delete({ id: product.id }, transaction, force)
              .then((result) => {
                done(null, product, { obj: result, transaction: transaction })
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: force ? LogActions.HARD_DELETE : LogActions.SOFT_DELETE,
              object: ModelName,
              prev_data: { id: id, options: options },
              new_data: obj,
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            // Fix: Don't reject twice
            if (result && result.transaction) {
              result.transaction.rollback()
              reject(error)
            } else {
              reject(error || new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static createWithImages = (user: User, payload: CreateProductWithImagesPayload): Promise<Product> => {
    return new Promise((resolve, reject) => {
      let product: Product;
      const productData = payload.product;
      const fileIds = payload.files || [];

      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            ProductDAL.create(productData, transaction)
              .then((result) => {
                product = result;
              
                done(null, result, transaction);
              })
              .catch((error) =>
                done(new InternalServerError('error creating product'), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (productObj: Product, transaction: Transaction, done: Function) => {
            if (fileIds.length === 0) {
              done(null, productObj, { obj: productObj, transaction });
              return;
            }

            let productImages: ProductImage[] = [];
            
            async.eachSeries(
              fileIds,
              (fileId: string, callback) => {
                const imageData = {
                  product_id: productObj.id,
                  file_id: fileId,
                  is_primary: productImages.length === 0 // First image is primary
                };
                
                ProductImageDAL.create(imageData, transaction)
                  .then((image) => {
                    if (!image) {
                      // Fix: Handle case where image creation fails but doesn't throw
                      callback(new InternalServerError("Failed to create product image") as any);
                      return;
                    }
                    productImages.push(image as ProductImage);
                    callback(null);
                  })
                  .catch((error) => callback(new InternalServerError(error) as any));
              },
              (error) => {
                if (error) {
                  done(error, { obj: null, transaction });
                } else {
                  // Add images to product object for response
                  const productWithImages = {
                    ...productObj.toJSON(),
                    product_image: productImages
                  };
                  done(null, productWithImages, { obj: productWithImages, transaction });
                }
              }
            );
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: obj,
              user_id: user?.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj)
              result.transaction.commit()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            // Fix: Don't reject twice
            if (result && result.transaction) {
              result.transaction.rollback()
              reject(error)
            } else {
              reject(error || new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static recordUserView = (userId: string, productId: string): Promise<UserProductView> => {
    return new Promise((resolve, reject) => {
      // Add transaction for consistency with other methods
      createTransaction()
        .then((transaction) => {
          UserProductViewDAL.findOne({
            where: { user_id: userId, product_id: productId }
          })
            .then((existingView) => {
              if (existingView) {
                return UserProductViewDAL.update(
                  existingView,
                  { 
                    view_count: existingView.view_count + 1,
                    last_viewed: new Date()
                  },
                  transaction
                ).then(() => UserProductViewDAL.findById(existingView.id))
              } else {
                return UserProductViewDAL.create({
                  user_id: userId,
                  product_id: productId,
                  view_count: 1,
                  last_viewed: new Date()
                }, transaction)
              }
            })
            .then((result) => {
              if (result) {
                resolve(result)
                transaction.commit()
              }
            })
            .catch((error) => {
              transaction.rollback()
              reject(new InternalServerError(error))
            })
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static getUserRecentlyViewedProducts = (userId: string, limit = 4): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      // Fix: Restructure query to be more efficient
      const options = {
        where: { user_id: userId },
        order: [["last_viewed", "DESC"]],
        limit,
        include: [
          {
            model: Product,
            include: [
              {
                model: Category,
                attributes: ["id", "name"],
              },
              {
                model: ProductImage,
                include: [
                  {
                    model: File,
                    attributes: ["id", "path"],
                  },
                ],
              },
            ],
          },
        ],
      }

      UserProductViewDAL.findMany(options)
        .then((result) => {
          if (!result.rows || result.rows.length === 0) {
            resolve([])
            return
          }
          
          // Fix: Add null check and proper type handling
          const products = result.rows
            .filter(view => view.product) // Filter out any null products
            .map(view => view.product)
          resolve(products)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }
}

export default ProductService












