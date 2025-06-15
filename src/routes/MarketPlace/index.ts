import express from "express";
import cartRoutes from "./Cart.routes";
import categoryRoutes from "./Category.routes";
import productRoutes from "./Product.routes";
import addressRoutes from "./Address.routes";
import appSettingRoutes from "./AppSetting.routes";
import cartItemRoutes from "./CartItem.routes";
import favoriteRoutes from "./Favorite.routes";
import orderRoutes from "./Order.routes";
import orderItemRoutes from "./OrderItem.routes";
import orderTrackingRoutes from "./OrderTracking.routes";
import paymentMethodRoutes from "./PaymentMethod.routes";
import productImageRoutes from "./ProductImage.routes";
import searchHistoryRoutes from "./SearchHistory.routes";
import promoCodeRoutes from "./PromoCode.routes";


const routes = () => {
  const router = express.Router();

// Mount all routes
router.use("/products", productRoutes())
router.use("/carts", cartRoutes())
router.use("/categories", categoryRoutes())
router.use("/addresses", addressRoutes())
router.use("/app-settings", appSettingRoutes())
router.use("/cart-items", cartItemRoutes())
router.use("/favorites", favoriteRoutes())
router.use("/orders", orderRoutes())
router.use("/order-items", orderItemRoutes())
router.use("/order-tracking", orderTrackingRoutes())
router.use("/payment-method", paymentMethodRoutes())
router.use("/product-images", productImageRoutes())
router.use("/search-histories", searchHistoryRoutes())
router.use("/promo-codes", promoCodeRoutes())


  return router;
};

export default routes;

