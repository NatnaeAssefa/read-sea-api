import { Request, Response } from "express";
import { DashboardService } from "../../services/System";
import ServerResponse from "../../utilities/response/Response";
import LogService from "../../services/Log/Log.service";

class DashboardController {
  /**
   * Get dashboard statistics
   * @param request
   * @param response
   */
  static getDashboardStats(request: any, response: Response) {
    const startTime = new Date();

    DashboardService.getDashboardStats()
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        LogService.LogError(error, startTime);
        ServerResponse(
          request,
          response,
          error.statusCode || 500,
          error.payload || null,
          error.message || "Error fetching dashboard statistics",
          startTime
        );
      });
  }

  /**
   * Get order analytics
   * @param request
   * @param response
   */
  static getOrderAnalytics(request: any, response: Response) {
    const startTime = new Date();

    DashboardService.getOrderAnalytics()
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        LogService.LogError(error, startTime);
        ServerResponse(
          request,
          response,
          error.statusCode || 500,
          error.payload || null,
          error.message || "Error fetching order analytics",
          startTime
        );
      });
  }

  /**
   * Get product analytics
   * @param request
   * @param response
   */
  static getProductAnalytics(request: any, response: Response) {
    const startTime = new Date();

    DashboardService.getProductAnalytics()
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        LogService.LogError(error, startTime);
        ServerResponse(
          request,
          response,
          error.statusCode || 500,
          error.payload || null,
          error.message || "Error fetching product analytics",
          startTime
        );
      });
  }
}

export default DashboardController; 