import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { AddressService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";
import { LatitudeValueRegex, LongtudeValueRegex } from "../../utilities/constants/Constants";


const ModelName = "Address"

class AddressController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    AddressService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    AddressService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      AddressService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
  static findByUserId(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      userId: Joi.string().guid().required(),
    })

    const { error } = schema.validate(request.params)

    if (!error) {
      const userId: string = request.params.userId
      const parsedQuery: any = ParseQuery(request.query, ["I", "P"])
      AddressService.findByUserId(userId, parsedQuery.query, parsedQuery.paranoid)
        .then((result) => {
          ServerResponse(request, response, 200, result, "", startTime)
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
      name: Joi.string().optional().max(100),
      address_line1: Joi.string().required().max(255),
      address_line2: Joi.string().allow(null, '').optional().max(255),
      city: Joi.string().required().max(100),
      state: Joi.string().required().max(100),
      postal_code: Joi.string().required().max(20),
      country: Joi.string().required().max(100),
      lat: Joi.string().required(),
      lng: Joi.string().required(),
      is_default: Joi.boolean().default(false)
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      AddressService.create(user, request.body)
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
      name: Joi.string().optional().max(100),
      address_line1: Joi.string().optional().max(255),
      address_line2: Joi.string().allow(null, '').optional().max(255),
      city: Joi.string().optional().max(100),
      state: Joi.string().optional().max(100),
      postal_code: Joi.string().optional().max(20),
      country: Joi.string().optional().max(100),
      lat: Joi.string().optional(),
      lng: Joi.string().optional(),
      is_default: Joi.boolean().optional()
    }).min(1);  // require at least one field to update

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const id: string = request.body.id
      const data: any = request.body
      const user: User = request.user
      AddressService.update(user, id, data)
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
      AddressService.delete(user, id, null, force)
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

  static findByCoordinate(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    const schema = Joi.object({
      lat: Joi.string()
        .regex(LatitudeValueRegex)
        .required(),
      lng: Joi.string()
        .regex(LongtudeValueRegex)
        .required(),
      radius: Joi.number().min(1000).max(100000000).required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      AddressService.findByCoordinate(
        request.user,
        parsedQuery.query,
        data.lat,
        data.lng,
        data.radius,
        parsedQuery.paranoid
      )
        .then((result) => {
          ServerResponse(request, response, 200, result, "", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }
}

export default AddressController
