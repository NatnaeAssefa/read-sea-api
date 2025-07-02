import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { OrderService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";


const ModelName = "Order"

class OrderController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    OrderService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    OrderService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      OrderService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
      user_id: Joi.string().guid().required(),
      address_id: Joi.string().guid().required(),
      payment_method_id: Joi.string().guid().required(),
      subtotal: Joi.number().positive().precision(2).required(),
      shipping_fee: Joi.number().min(0).precision(2).default(0.0),
      tax: Joi.number().min(0).precision(2).default(0.0),
      total: Joi.number().positive().precision(2).required(),
      estimated_delivery: Joi.date().greater('now').allow(null).optional()
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      OrderService.create(user, request.body)
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
      user_id: Joi.string().guid().required(),
      address_id: Joi.string().guid().required(),
      payment_method_id: Joi.string().guid().required(),
      subtotal: Joi.number().positive().precision(2).required(),
      shipping_fee: Joi.number().min(0).precision(2).default(0.0),
      tax: Joi.number().min(0).precision(2).default(0.0),
      total: Joi.number().positive().precision(2).required(),
      estimated_delivery: Joi.date().greater('now').allow(null).optional()
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const data: any = request.body
      const user: User = request.user
      OrderService.update(user, id, data)
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
      OrderService.delete(user, id, null, force)
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
}

export default OrderController
