import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { OrderService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";
import { generateRandomCode } from "../../utilities/utilities";

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
      payment_method_id: Joi.string().guid().optional(),
      subtotal: Joi.number().positive().precision(2).optional(),
      shipping_fee: Joi.number().min(0).precision(2).default(0.0).optional(),
      tax: Joi.number().min(0).precision(2).default(0.0).optional(),
      total: Joi.number().positive().precision(2).required(),
      estimated_delivery: Joi.date().greater('now').allow(null).optional()
    });

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      
      // Generate a timestamp-based order number
      const generateOrderNumber = () => {
        // Get current timestamp
        const timestamp = Date.now();
        
        // Convert to string and take the last 7 digits
        const orderNumber = timestamp.toString().slice(-7);
        
        return orderNumber;
      };

      // Generate order number
      const orderNumber = generateOrderNumber();
      console.log("Generated timestamp-based order number:", orderNumber);

      // Add order_number to request.body
      request.body.order_number = orderNumber;

      // Create order with generated order number
      OrderService.create(user, request.body)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime)
        })
        .catch((error) => {
          console.error("Order creation error:", error);
          ServerResponse(request, response, error.statusCode || 500, error.payload || { errors: [error.message] }, "Error", startTime)
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

  static findByUserId(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      userId: Joi.string().guid().required()
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const userId = request.params.userId;
      const parsedQuery: any = ParseQuery(request.query);

      // Check if the requesting user has permission to view these orders
      const requestingUser: User = request.user;
      
      // Allow users to view their own orders or admins to view any orders
      if (requestingUser.id === userId || requestingUser.role?.access_rules?.includes('read_order')) {
        OrderService.findByUserId(userId, parsedQuery.query, parsedQuery.paranoid)
          .then((result) => {
            ServerResponse(request, response, 200, result, "", startTime);
          })
          .catch((error) => {
            ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
          });
      } else {
        ServerResponse(request, response, 403, null, "Unauthorized to view these orders", startTime);
      }
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  static findMyOrders(request: any, response: Response) {
    const startTime = new Date();
    const user: User = request.user;
    const parsedQuery: any = ParseQuery(request.query);

    OrderService.findByUserId(user.id, parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
      });
  }

  static findByCoordinates(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180),
      radius: Joi.number().required().positive()
    })

    const { error } = schema.validate(request.query)

    if (!error) {
      const latitude = parseFloat(request.query.latitude as string)
      const longitude = parseFloat(request.query.longitude as string)
      const radius = parseFloat(request.query.radius as string)
      const parsedQuery: any = ParseQuery(request.query, ["I", "P"])

      OrderService.findByCoordinates(latitude, longitude, radius, parsedQuery.query, parsedQuery.paranoid)
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

export default OrderController
