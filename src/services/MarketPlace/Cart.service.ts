import type { Transaction } from "sequelize"
import { type Cart, CartItem, Product, ProductImage } from "../../models/MarketPlace"
import async from "async"
import { createTransaction } from "../../utilities/database/sequelize";
import {
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import { CartDAL, CartItemDAL } from "../../dals/MarketPlace";
import { File } from "../../models/System";
import { NullishPropertiesOf } from "sequelize/types/utils";


const ModelName = "Cart"

class CartService {
  static getCart = (user_id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            // Find or create cart
            CartDAL.findOne({ where: { user_id } })
              .then((cart) => {
                if (cart) {
                  done(null, cart)
                } else {
                  CartDAL.create({ user_id })
                    .then((newCart) => done(null, newCart))
                    .catch((error) => done(new InternalServerError(error)))
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (cart: Cart, done: Function) => {
            // Get cart items
            CartDAL.findMany({
              where: { cart_id: cart.id },
              include: [
                {
                  model: Product,
                  include: [
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
            })
              .then((Carts) => {
                // Calculate totals
                let subtotal = 0
                Carts.rows.forEach((item: any) => {
                  subtotal += item.product.price * item.quantity
                })

                const result = {
                  id: cart.id,
                  items: Carts.rows,
                  itemCount: Carts.rows.length,
                  subtotal,
                }

                done(null, result)
              })
              .catch((error) => done(new InternalServerError(error)))
          },
        ],
        (error, result) => {
          if (!error) {
            resolve(result)
          } else {
            reject(error)
          }
        },
      )
    })
  }

  static addToCart = (user: User, product_id: string, quantity = 1): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            // Get or create cart
            CartDAL.findOne({ where: { user_id: user.id } })
              .then((cart) => {
                if (cart) {
                  done(null, transaction, cart)
                } else {
                  CartDAL.create({ user_id: user.id }, transaction)
                    .then((newCart) => done(null, transaction, newCart))
                    .catch((error) =>
                      done(new InternalServerError(error), {
                        obj: null,
                        transaction: transaction,
                      }),
                    )
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (transaction: Transaction, cart: Cart, done: Function) => {
            // Check if product exists in cart
            CartItemDAL.findOne({
              where: {
                cart_id: cart.id,
                product_id,
              },
            })
              .then((existingItem) => {
                if (existingItem) {
                  // Update quantity
                  CartItemDAL.update(existingItem, { quantity: existingItem.quantity + quantity }, transaction)
                    .then(() => done(null, { obj: cart, transaction }))
                    .catch((error) =>
                      done(new InternalServerError(error), {
                        obj: null,
                        transaction: transaction,
                      }),
                    )
                } else {
                  // Create new cart item
                  CartItemDAL.create(
                    {
                      cart_id: cart.id,
                      product_id,
                      quantity,
                    },
                    transaction,
                  )
                    .then(() => done(null, { obj: cart, transaction }))
                    .catch((error) =>
                      done(new InternalServerError(error), {
                        obj: null,
                        transaction: transaction,
                      }),
                    )
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: {},
              new_data: { product_id, quantity },
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              result.transaction.commit()
              // Return updated cart
              this.getCart(user.id)
                .then((cart) => resolve(cart))
                .catch((error) => reject(error))
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static updateCartItem = (user: User, cartItemId: string, quantity: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.findOne({ where: { user_id: user.id } })
              .then((cart) => {
                if (cart) {
                  done(null, transaction, cart)
                } else {
                  done(new NotFoundError("Cart not found"), {
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
          (transaction: Transaction, cart: Cart, done: Function) => {
            CartItemDAL.findOne({
              where: {
                id: cartItemId,
                cart_id: cart.id,
              },
            })
              .then((cartItem) => {
                if (cartItem) {
                  if (quantity <= 0) {
                    CartItemDAL.delete({ id: cartItem.id }, transaction)
                      .then(() => done(null, { obj: cart, transaction }))
                      .catch((error) =>
                        done(new InternalServerError(error), {
                          obj: null,
                          transaction: transaction,
                        }),
                      )
                  } else {
                    CartItemDAL.update(cartItem, { quantity }, transaction)
                      .then(() => done(null, { obj: cart, transaction }))
                      .catch((error) =>
                        done(new InternalServerError(error), {
                          obj: null,
                          transaction: transaction,
                        }),
                      )
                  }
                } else {
                  done(new NotFoundError("Cart item not found"), {
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
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: "CartItem",
              prev_data: { cartItemId },
              new_data: { quantity },
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              result.transaction.commit()
              // Return updated cart
              this.getCart(user.id)
                .then((cart) => resolve(cart))
                .catch((error) => reject(error))
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static removeFromCart = (user: User, CartId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.findOne({ where: { user_id: user.id } })
              .then((cart) => {
                if (cart) {
                  done(null, transaction, cart)
                } else {
                  done(new NotFoundError("Cart not found"), {
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
          (transaction: Transaction, cart: Cart, done: Function) => {
            CartDAL.delete(
              {
                id: CartId,
                cart_id: cart.id,
              },
              transaction,
            )
              .then(() => done(null, { obj: cart, transaction }))
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.SOFT_DELETE,
              object: "Cart",
              prev_data: { CartId },
              new_data: {},
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              result.transaction.commit()
              // Return updated cart
              this.getCart(user.id)
                .then((cart) => resolve(cart))
                .catch((error) => reject(error))
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static clearCart = (user: User): Promise<any> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.findOne({ where: { user_id: user.id } })
              .then((cart) => {
                if (cart) {
                  done(null, transaction, cart)
                } else {
                  done(new NotFoundError("Cart not found"), {
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
          (transaction: Transaction, cart: Cart, done: Function) => {
            CartDAL.bulk_delete({ cart_id: cart.id }, transaction)
              .then(() => done(null, { obj: cart, transaction }))
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                }),
              )
          },
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.SOFT_DELETE,
              object: ModelName,
              prev_data: {},
              new_data: { action: "clear_cart" },
              user_id: user.id,
            })
            done(null, result)
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              result.transaction.commit()
              // Return updated cart
              this.getCart(user.id)
                .then((cart) => resolve(cart))
                .catch((error) => reject(error))
            } else {
              reject(new InternalServerError("Dead End"))
            }
          } else {
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static create = (user: User, payload: Omit<Cart, NullishPropertiesOf<Cart>>): Promise<Cart> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.create(payload, transaction)
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
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static findMany = (options: any, paranoid?: boolean): Promise<{ rows: Cart[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        Cart: [["name", "ASC"]],
      }

      CartDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }

  static findById = (id: string, options?: any, paranoid?: boolean): Promise<Cart | null> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
      }

      CartDAL.findById(id, queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static findOne = (options: any, paranoid?: boolean): Promise<Cart | null> => {
    return new Promise((resolve, reject) => {
      CartDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => reject(new InternalServerError(error)))
    })
  }

  static update = (
    user: User,
    id: string,
    payload: Omit<Cart, NullishPropertiesOf<Cart>>,
    options?: any,
  ): Promise<Cart> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)))
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.findById(id, options)
              .then((Cart) => {
                if (Cart) {
                  done(null, transaction, Cart)
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
          (transaction: Transaction, Cart: Cart, done: Function) => {
            const _Cart = { ...Cart.toJSON() }
            CartDAL.update(Cart, payload, transaction)
              .then((result) => {
                done(null, _Cart, { obj: result, transaction: transaction })
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
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
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
            CartDAL.findById(id, options, force)
              .then((Cart) => {
                if (Cart) {
                  done(null, transaction, Cart)
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  })
                }
              })
              .catch((error) => done(new InternalServerError(error)))
          },
          (transaction: Transaction, Cart: Cart, done: Function) => {
            CartDAL.delete({ id: Cart.id }, transaction, force)
              .then((result) => {
                done(null, Cart, { obj: result, transaction: transaction })
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
            reject(error)
            if (result && result.transaction) {
              result.transaction.rollback()
            } else {
              reject(new InternalServerError("Dead End"))
            }
          }
        },
      )
    })
  }

  static findMy = (user: User, options: any, paranoid?: boolean): Promise<{ rows: Cart[]; count: number }> => {
    return new Promise((resolve, reject) => {

      const queryOptions = {
        ...options,
        where: {
          ...options?.where,
          user_id: user.id
        },
        include: [
          ...(options?.include || []),
          {
            model: CartItem
          }
        ]
      }

      CartDAL.findMany(queryOptions, paranoid)
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        })
    })
  }
}

export default CartService

