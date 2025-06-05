import type { Request, Response } from "express"
import Joi from "joi"
import { User } from "../../models/User";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";
import { ProductService } from "../../services/MarketPlace";

const ModelName = "Product"

class ProductController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    ProductService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    ProductService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      ProductService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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

  static getFeaturedProducts(request: Request, response: Response) {
    const startTime = new Date()
    const limit = Number.parseInt(request.query.limit as string) || 4

    ProductService.getFeaturedProducts(limit)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static getTrendingProducts(request: Request, response: Response) {
    const startTime = new Date()
    const limit = Number.parseInt(request.query.limit as string) || 8

    ProductService.getTrendingProducts(limit)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  static searchProducts(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      query: Joi.string().required(),
      limit: Joi.number().optional(),
    })

    const { error } = schema.validate(request.query)

    if (!error) {
      const query = request.query.query as string
      const limit = Number.parseInt(request.query.limit as string) || 10

      ProductService.searchProducts(query, limit)
        .then((result) => {
          ServerResponse(request, response, 200, result, "", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static create(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      price: Joi.number().required(),
      stock: Joi.number().required(),
      category_id: Joi.string().guid().required(),
      featured: Joi.boolean().optional(),
      trending: Joi.boolean().optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      ProductService.create(user, request.body)
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
      price: Joi.number().optional(),
      stock: Joi.number().optional(),
      category_id: Joi.string().guid().optional(),
      featured: Joi.boolean().optional(),
      trending: Joi.boolean().optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const data: any = request.body
      const user: User = request.user
      ProductService.update(user, id, data)
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
      ProductService.delete(user, id, null, force)
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

export default ProductController
