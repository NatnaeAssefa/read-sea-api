import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { CartService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";


const ModelName = "Cart"

class CartController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    CartService.findMany(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static findOne(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"])

    CartService.findOne(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static findById(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    })

    const { error } = schema.validate(request.params)

    if (!error) {
      const id: string = request.params.id
      const parsedQuery: any = ParseQuery(request.query, ["I", "P"])
      CartService.findById(id, parsedQuery.query, parsedQuery.paranoid)
        .then((result) => {
          if (result) {
            ServerResponse(request, response, 200, result, "", startTime)
          } else {
            ServerResponse(request, response, 404, null, `${ModelName} Not Found`, startTime)
          }
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
      return
    }
  }

  static create(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      file_id: Joi.string().guid().optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      CartService.create(user, request.body)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static update(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      file_id: Joi.string().guid().optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const data: any = request.body
      const user: User = request.user
      CartService.update(user, id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static delete(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      force: Joi.boolean(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const force: boolean = request.body.force ?? false
      const user: User = request.user
      CartService.delete(user, id, null, force)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static getCart(request: any, response: Response) {
    const startTime = new Date()
    const user: User = request.user

    CartService.getCart(user.id)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static addToCart(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      productId: Joi.string().guid().required(),
      quantity: Joi.number().min(1).optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      const { productId, quantity = 1 } = request.body

      CartService.addToCart(user, productId, quantity)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static updateCartItem(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    })

    const bodySchema = Joi.object({
      quantity: Joi.number().min(0).required(),
    })

    const { error: paramError } = schema.validate(request.params)
    const { error: bodyError } = bodySchema.validate(request.body)

    if (!paramError && !bodyError) {
      const user: User = request.user
      const cartItemId: string = request.params.id
      const { quantity } = request.body

      CartService.updateCartItem(user, cartItemId, quantity)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: (paramError || bodyError)?.details },
        "Input validation error",
        startTime,
      )
    }
  }

  static removeFromCart(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    })

    const { error } = schema.validate(request.params)

    if (!error) {
      const user: User = request.user
      const cartItemId: string = request.params.id

      CartService.removeFromCart(user, cartItemId)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static clearCart(request: any, response: Response) {
    const startTime = new Date()
    const user: User = request.user

    CartService.clearCart(user)
      .then((result) => {
        ServerResponse(request, response, 200, result, "Success", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static findMy(request: any, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"])

    CartService.findMy(request.user, parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }
}

export default CartController
