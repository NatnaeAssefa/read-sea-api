import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { BannerService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";
import { GeneralStatus, BannerTargetAudience } from "../../utilities/constants/Constants";

const ModelName = "Banner"

class BannerController {
  // Admin endpoints for full CRUD operations
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    BannerService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    BannerService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"])

      BannerService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
    }
  }

  static create(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      title: Joi.string().required().min(1).max(255),
      description: Joi.string().optional().allow(''),
      image_url: Joi.string().uri().required(),
      link_url: Joi.string().uri().optional().allow(''),
      start_date: Joi.date().iso().required(),
      end_date: Joi.date().iso().required().greater(Joi.ref('start_date')),
      status: Joi.string().valid(...Object.values(GeneralStatus)).optional(),
      priority: Joi.number().integer().min(0).max(999).optional(),
      target_audience: Joi.string().valid(...Object.values(BannerTargetAudience)).optional(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      BannerService.create(user, request.body)
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
      title: Joi.string().min(1).max(255).optional(),
      description: Joi.string().optional().allow(''),
      image_url: Joi.string().uri().optional(),
      link_url: Joi.string().uri().optional().allow(''),
      start_date: Joi.date().iso().optional(),
      end_date: Joi.date().iso().optional(),
      status: Joi.string().valid(...Object.values(GeneralStatus)).optional(),
      priority: Joi.number().integer().min(0).max(999).optional(),
      target_audience: Joi.string().valid(...Object.values(BannerTargetAudience)).optional(),
    }).min(2); // require at least id and one field to update

    // Custom validation for date relationship
    const { error, value } = schema.validate(request.body, { abortEarly: false })
    
    if (!error) {
      // Additional validation for date relationship if both dates are provided
      if (value.start_date && value.end_date && new Date(value.end_date) <= new Date(value.start_date)) {
        ServerResponse(request, response, 400, { details: [{ message: "End date must be after start date" }] }, "Input validation error", startTime)
        return
      }

      const id: string = request.body.id
      const user: User = request.user
      BannerService.update(user, id, request.body)
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
      force: Joi.boolean().optional(),
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const force: boolean = request.body.force ?? false
      const user: User = request.user
      BannerService.delete(user, id, null, force)
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

  // Public endpoint for active banners (time-based filtering)
  static findActiveBanners(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    BannerService.findActiveBanners(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime)
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
      })
  }

  // Admin endpoint for finding banners by date range
  static findByDateRange(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      start_date: Joi.date().iso().required(),
      end_date: Joi.date().iso().required().greater(Joi.ref('start_date')),
    })

    const { error } = schema.validate(request.query)

    if (!error) {
      const startDate = new Date(request.query.start_date as string)
      const endDate = new Date(request.query.end_date as string)
      const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"])

      BannerService.findByDateRange(startDate, endDate, parsedQuery.query, parsedQuery.paranoid)
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
}

export default BannerController
