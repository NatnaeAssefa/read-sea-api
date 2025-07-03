import type { Sequelize } from "sequelize"
import { User } from "../User"
import { File } from "../System"
import AddressFactory, { Address } from "./Address"
import PaymentMethodFactory, { PaymentMethod } from "./PaymentMethod"
import ProductFactory, { Product } from "./Product"
import CategoryFactory, { Category } from "./Category"
import ProductImageFactory, { ProductImage } from "./ProductImage"
import CartFactory, { Cart } from "./Cart"
import CartItemFactory, { CartItem } from "./CartItem"
import OrderFactory, { Order } from "./Order"
import OrderItemFactory, { OrderItem } from "./OrderItem"
import OrderTrackingFactory, { OrderTracking } from "./OrderTracking"
import FavoriteFactory, { Favorite } from "./Favorite"
import SearchHistoryFactory, { SearchHistory } from "./SearchHistory"
import AppSettingsFactory, { AppSetting } from "./AppSetting"
import ChappaPaymentFactory, { ChappaPayment } from "./ChappaPayment"
import UserProductViewFactory, { UserProductView } from "./UserProductView";
import PromoCodeFactory, { PromoCode } from "./PromoCode";
import BannerFactory, { Banner } from "./Banner"
import ProductRatingFactory, { ProductRating } from "./ProductRating"
import RatingHelpfulnessFactory, { RatingHelpfulness } from "./RatingHelpfulness";


// Import System models
import SystemModels from "../System"

const MarketPlaceModels = (sequelize: Sequelize) => {
  AddressFactory(sequelize)
  PaymentMethodFactory(sequelize)
  ProductFactory(sequelize)
  CategoryFactory(sequelize)
  ProductImageFactory(sequelize)
  CartFactory(sequelize)
  CartItemFactory(sequelize)
  OrderFactory(sequelize)
  OrderItemFactory(sequelize)
  OrderTrackingFactory(sequelize)
  FavoriteFactory(sequelize)
  SearchHistoryFactory(sequelize)
  AppSettingsFactory(sequelize)
  ChappaPaymentFactory(sequelize)
  UserProductViewFactory(sequelize)
  PromoCodeFactory(sequelize)
  BannerFactory(sequelize)
  ProductRatingFactory(sequelize)
  RatingHelpfulnessFactory(sequelize)

  // Define associations
  User.hasMany(Address, { foreignKey: "user_id" })
  Address.belongsTo(User, { foreignKey: "user_id" })

  User.hasMany(PaymentMethod, { foreignKey: "user_id" })
  PaymentMethod.belongsTo(User, { foreignKey: "user_id" })
  PaymentMethod.belongsTo(Address, { foreignKey: "address_id" })

  Category.hasMany(Product, { foreignKey: "category_id" })
  Product.belongsTo(Category, { foreignKey: "category_id" })

  Product.hasMany(ProductImage, { foreignKey: "product_id" })
  ProductImage.belongsTo(Product, { foreignKey: "product_id" })

  User.hasOne(Cart, { foreignKey: "user_id" })
  Cart.belongsTo(User, { foreignKey: "user_id" })

  Cart.hasMany(CartItem, { foreignKey: "cart_id" })
  CartItem.belongsTo(Cart, { foreignKey: "cart_id" })
  CartItem.belongsTo(Product, { foreignKey: "product_id" })

  User.hasMany(Order, { foreignKey: "user_id" })
  Order.belongsTo(User, { foreignKey: "user_id" })
  Order.belongsTo(Address, { foreignKey: "address_id" })
  Order.belongsTo(PaymentMethod, { foreignKey: "payment_method_id" })

  Order.hasMany(OrderItem, { foreignKey: "order_id" })
  OrderItem.belongsTo(Order, { foreignKey: "order_id" })
  OrderItem.belongsTo(Product, { foreignKey: "product_id" })

  Order.hasMany(OrderTracking, { foreignKey: "order_id" })
  OrderTracking.belongsTo(Order, { foreignKey: "order_id" })

  User.hasMany(Favorite, { foreignKey: "user_id" })
  Favorite.belongsTo(User, { foreignKey: "user_id" })
  Favorite.belongsTo(Product, { foreignKey: "product_id" })

  User.hasMany(SearchHistory, { foreignKey: "user_id" })
  SearchHistory.belongsTo(User, { foreignKey: "user_id" })

  User.hasOne(AppSetting, { foreignKey: "user_id" })
  AppSetting.belongsTo(User, { foreignKey: "user_id" })

  // File - UserProfile
  File.hasOne(ProductImage, {
    foreignKey: "file_id",
  });
  ProductImage.belongsTo(File, {
    foreignKey: "file_id",
  });

  User.hasMany(ChappaPayment, { foreignKey: "user_id" })
  ChappaPayment.belongsTo(User, { foreignKey: "user_id" })
  ChappaPayment.belongsTo(PaymentMethod, { foreignKey: "payment_method_id" })
  ChappaPayment.belongsTo(Order, { foreignKey: "order_id" })


  User.hasMany(UserProductView, { foreignKey: "user_id" });
  UserProductView.belongsTo(User, { foreignKey: "user_id" });

  Product.hasMany(UserProductView, { foreignKey: "product_id" });
  UserProductView.belongsTo(Product, { foreignKey: "product_id" });

  Order.belongsTo(PromoCode, { foreignKey: "promo_code_id" })
  PromoCode.hasMany(Order, { foreignKey: "promo_code_id" })

  // Product Rating relationships
  User.hasMany(ProductRating, { foreignKey: "user_id" })
  ProductRating.belongsTo(User, { foreignKey: "user_id" })

  Product.hasMany(ProductRating, { foreignKey: "product_id" })
  ProductRating.belongsTo(Product, { foreignKey: "product_id" })

  // Rating Helpfulness relationships
  User.hasMany(RatingHelpfulness, { foreignKey: "user_id" })
  RatingHelpfulness.belongsTo(User, { foreignKey: "user_id" })

  ProductRating.hasMany(RatingHelpfulness, { foreignKey: "product_rating_id" })
  RatingHelpfulness.belongsTo(ProductRating, { foreignKey: "product_rating_id" })
}

export default (sequelize: Sequelize) => {
  // First initialize system models
  SystemModels(sequelize)

  // Then initialize user models
  MarketPlaceModels(sequelize)
}

export {
  Address,
  PaymentMethod,
  Product,
  Category,
  ProductImage,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderTracking,
  Favorite,
  SearchHistory,
  AppSetting,
  ChappaPayment,
  UserProductView,
  PromoCode,
  Banner,
  ProductRating,
  RatingHelpfulness
}

