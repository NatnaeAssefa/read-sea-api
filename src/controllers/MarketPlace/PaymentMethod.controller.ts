import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { PaymentMethodService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";
import { PaymentMethod } from "../../utilities/constants/Constants";


const ModelName = "PaymentMethod"

class PaymentMethodController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    PaymentMethodService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    PaymentMethodService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      PaymentMethodService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
      type: Joi.string().valid(...Object.values(PaymentMethod)).required(),
      provider: Joi.string().required().max(50),
      account_number: Joi.string().required().pattern(/^\d{4}$/).message('Last 4 digits required'),
      expiry_date: Joi.string()
        .when('type', {
          is: 'credit_card',
          then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).required(),
          otherwise: Joi.string().allow(null)
        }),
      is_default: Joi.boolean().default(false),
      address_id: Joi.string().guid().allow(null)
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      PaymentMethodService.create(user, request.body)
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
      type: Joi.string().valid(...Object.values(PaymentMethod)).required(),
      provider: Joi.string().required().max(50),
      account_number: Joi.string().required().pattern(/^\d{4}$/).message('Last 4 digits required'),
      expiry_date: Joi.string()
        .when('type', {
          is: 'credit_card',
          then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).required(),
          otherwise: Joi.string().allow(null)
        }),
      is_default: Joi.boolean().default(false),
      address_id: Joi.string().guid().allow(null)
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const data: any = request.body
      const user: User = request.user
      PaymentMethodService.update(user, id, data)
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
      PaymentMethodService.delete(user, id, null, force)
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

export default PaymentMethodController
