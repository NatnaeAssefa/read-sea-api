import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import ChappaPaymentService from "../../services/MarketPlace/ChappaPayment.service";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";

const ModelName = "ChappaPayment"

class ChappaPaymentController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date()
    const parsedQuery: any = ParseQuery(request.query)

    ChappaPaymentService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    const { error } = schema.validate(request.params, { abortEarly: false })

    if (!error) {
      const id: string = request.params.id
      ChappaPaymentService.findById(id)
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

  static initiatePayment(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      order_id: Joi.string().guid().required(),
      payment_method_id: Joi.string().guid().required(),
      amount: Joi.number().positive().required(),
      callback_url: Joi.string().uri().required()
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      const { order_id, payment_method_id, amount, callback_url } = request.body
      
      ChappaPaymentService.initiatePayment(user, order_id, payment_method_id, amount, callback_url)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Payment initiated successfully", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static verifyPayment(request: Request, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      tx_ref: Joi.string().required()
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const { tx_ref } = request.body
      
      ChappaPaymentService.verifyPayment(tx_ref)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Payment verified", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }

  static webhookHandler(request: Request, response: Response) {
    const startTime = new Date()
    // Chappa webhook handling
    const payload = request.body
    
    // Verify the webhook signature if Chappa provides one
    // This is a simplified version - you may need to add more security
    
    if (payload && payload.tx_ref) {
      ChappaPaymentService.verifyPayment(payload.tx_ref)
        .then((result) => {
          ServerResponse(request, response, 200, { status: "success" }, "Webhook processed", startTime)
        })
        .catch((error) => {
          console.error("Webhook processing error:", error)
          // Still return 200 to Chappa to acknowledge receipt
          ServerResponse(request, response, 200, { status: "error", message: "Error processing webhook" }, "Webhook error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { status: "error", message: "Invalid webhook payload" }, "Invalid webhook", startTime)
    }
  }

    static refundPayment(request: any, response: Response) {
    const startTime = new Date()
    const schema = Joi.object({
      payment_id: Joi.string().guid().required(),
      amount: Joi.number().positive().optional(),
      reason: Joi.string().optional()
    })

    const { error } = schema.validate(request.body, { abortEarly: false })

    if (!error) {
      const user: User = request.user
      const { payment_id, amount, reason } = request.body
      
      ChappaPaymentService.refundPayment(user, payment_id, amount, reason)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Payment refunded successfully", startTime)
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime)
        })
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime)
    }
  }
}

export default ChappaPaymentController

