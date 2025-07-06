import { User } from "../../models/User";
import { Product, Order } from "../../models/MarketPlace";
import { UserDAL } from "../../dals/User";
import { ProductDAL, OrderDAL } from "../../dals/MarketPlace";
import { InternalServerError } from "../../errors/Errors";
import { Op } from "sequelize";
import { OrderStatus, GeneralStatus } from "../../utilities/constants/Constants";

class DashboardService {
  // Get statistics for dashboard
  static getDashboardStats = async (): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalProductPrice: number;
    totalRevenue: number;
  }> => {
    try {
      // Get total users
      const usersResult = await UserDAL.findMany({
        attributes: ['id'],
      });
      
      // Get total products and calculate total price
      const productsResult = await ProductDAL.findMany({});
      
      // Calculate total product price
      let totalProductPrice = 0;
      productsResult.rows.forEach(product => {
        if (product.price) {
          totalProductPrice += parseFloat(product.price.toString());
        }
      });
      
      // Get total revenue from completed orders
      const revenueResult = await OrderDAL.findMany({
        where: {
          status: {
            [Op.in]: [OrderStatus.DELIVERED, OrderStatus.PAID]
          }
        }
      });
      
      // Calculate total revenue
      let totalRevenue = 0;
      revenueResult.rows.forEach(order => {
        if (order.total) {
          totalRevenue += parseFloat(order.total.toString());
        }
      });

      return {
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalProductPrice,
        totalRevenue
      };
    } catch (error) {
      throw new InternalServerError(
        error instanceof Error ? error.message : "Failed to get dashboard statistics"
      );
    }
  };
  
  // Get order analytics
  static getOrderAnalytics = async (): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    shippedToday: number;
  }> => {
    try {
      // Get total orders
      const totalOrdersResult = await OrderDAL.findMany({});
      
      // Get pending orders (processing status)
      const pendingOrdersResult = await OrderDAL.findMany({
        where: {
          status: OrderStatus.PROCESSING
        }
      });
      
      // Get total revenue from all orders
      let totalRevenue = 0;
      totalOrdersResult.rows.forEach(order => {
        if (order.total) {
          totalRevenue += parseFloat(order.total.toString());
        }
      });
      
      // Get orders shipped today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const shippedTodayResult = await OrderDAL.findMany({
        where: {
          status: OrderStatus.SHIPPED,
          updatedAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });

      return {
        totalOrders: totalOrdersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        totalRevenue,
        shippedToday: shippedTodayResult.count || 0
      };
    } catch (error) {
      throw new InternalServerError(
        error instanceof Error ? error.message : "Failed to get order analytics"
      );
    }
  };
  
  // Get product analytics
  static getProductAnalytics = async (): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    totalRevenue: number;
  }> => {
    try {
      // Get all products
      const allProductsResult = await ProductDAL.findMany({});
      
      // Get active products (using featured as a proxy for active status)
      const activeProductsResult = await ProductDAL.findMany({
        where: {
          featured: true
        }
      });
      
      // Count products out of stock
      let outOfStock = 0;
      allProductsResult.rows.forEach(product => {
        if (product.stock !== undefined && product.stock <= 0) {
          outOfStock++;
        }
      });
      
      // Get total revenue from completed orders
      const completedOrdersResult = await OrderDAL.findMany({
        where: {
          status: {
            [Op.in]: [OrderStatus.DELIVERED, OrderStatus.PAID]
          }
        }
      });
      
      // Calculate total revenue
      let totalRevenue = 0;
      completedOrdersResult.rows.forEach(order => {
        if (order.total) {
          totalRevenue += parseFloat(order.total.toString());
        }
      });

      return {
        totalProducts: allProductsResult.count || 0,
        activeProducts: activeProductsResult.count || 0,
        outOfStock,
        totalRevenue
      };
    } catch (error) {
      throw new InternalServerError(
        error instanceof Error ? error.message : "Failed to get product analytics"
      );
    }
  };
}

export default DashboardService; 