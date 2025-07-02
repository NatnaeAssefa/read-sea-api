import type { Request, Response } from "express";
import Joi from "joi";
import { User } from "../../models/User";
import { ProductRatingService } from "../../services/MarketPlace";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import ServerResponse from "../../utilities/response/Response";

const ModelName = "ProductRating";

class ProductRatingController {
  // Create a new rating for a product
  static create(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      product_id: Joi.string().guid().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      review_title: Joi.string().max(255).allow('').optional(),
      review_text: Joi.string().allow('').optional(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const user: User = request.user;
      ProductRatingService.create(user, request.body)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  // Update an existing rating
  static update(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).optional(),
      review_title: Joi.string().max(255).allow('').optional(),
      review_text: Joi.string().allow('').optional(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const user: User = request.user;
      const { id } = request.params;

      ProductRatingService.update(user, id, request.body)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  // Delete a rating
  static delete(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const user: User = request.user;
      const { id } = request.params;

      ProductRatingService.delete(user, id)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  // Get ratings for a specific product
  static getProductRatings(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      productId: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const { productId } = request.params;
      const parsedQuery: any = ParseQuery(request.query);

      ProductRatingService.getProductRatings(productId, parsedQuery.query, parsedQuery.pagination)
        .then((result) => {
          ServerResponse(request, response, 200, result, "", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  // Get rating statistics for a product (public endpoint)
  static getProductRatingStats(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      productId: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const { productId } = request.params;

      ProductRatingService.getProductRatingStats(productId)
        .then((result) => {
          ServerResponse(request, response, 200, result, "", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  // Toggle helpfulness vote for a rating
  static toggleHelpfulness(request: any, response: Response) {
    const startTime = new Date();
    const paramsSchema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const bodySchema = Joi.object({
      is_helpful: Joi.boolean().required(),
    });

    const paramsError = paramsSchema.validate(request.params).error;
    const bodyError = bodySchema.validate(request.body).error;

    if (!paramsError && !bodyError) {
      const user: User = request.user;
      const { id } = request.params;
      const { is_helpful } = request.body;

      ProductRatingService.toggleHelpfulness(user, id, is_helpful)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      const errors = [paramsError, bodyError].filter(Boolean);
      ServerResponse(request, response, 400, { details: errors }, "Input validation error", startTime);
    }
  }

  // Get user's own ratings
  static getUserRatings(request: any, response: Response) {
    const startTime = new Date();
    const user: User = request.user;
    const parsedQuery: any = ParseQuery(request.query);

    ProductRatingService.getUserRatings(user.id, parsedQuery.query, parsedQuery.pagination)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
      });
  }

  // Get a specific rating by ID
  static getRatingById(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const { id } = request.params;
      const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

      ProductRatingService.findById(id, parsedQuery.query, parsedQuery.paranoid)
        .then((result) => {
          if (result) {
            ServerResponse(request, response, 200, result, "", startTime);
          } else {
            ServerResponse(request, response, 404, null, `${ModelName} Not Found`, startTime);
          }
        })
        .catch((error) => {
          ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
        });
    } else {
      ServerResponse(request, response, 400, { details: error.details }, "Input validation error", startTime);
    }
  }

  static findMany(request: Request, response: Response) {
    const startTime = new Date();
    const parsedQuery: any = ParseQuery(request.query);

    ProductRatingService.findMany(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(request, response, error.statusCode, error.payload, "Error", startTime);
      });
  }


}

export default ProductRatingController;
