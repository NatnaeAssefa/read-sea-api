import express from "express"
import { ProductImageController, ProductRatingController } from "../../controllers/MarketPlace"
import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: ProductRating
   *   description: ProductRating management APIs
   */

  const router = express.Router()


  router.get(
    "/products/:productId/ratings",
    AuthenticateUser,
    AuthorizeAccess(["read_product_rating"]),
    ProductRatingController.getProductRatings
  );

  router.get(
    "/products/:productId/ratings/stats",
    AuthenticateUser,
    AuthorizeAccess(["read_product_rating"]),
    ProductRatingController.getProductRatingStats
  );

  router.get(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["read_product_rating"]),
    ProductRatingController.findMany
  );

  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["create_product_rating"]),
    ProductRatingController.create
  );

  router.put(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["update_product_rating"]),
    ProductRatingController.update
  );

  router.delete(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["delete_product_rating"]),
    ProductRatingController.delete
  );

  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_product_rating"]),
    ProductRatingController.getRatingById
  );

  router.post(
    "/:id/helpfulness",
    AuthenticateUser,
    AuthorizeAccess(["update_product_rating"]),
    ProductRatingController.toggleHelpfulness
  );
  

  router.get(
    "/my-ratings",
    AuthenticateUser,
    AuthorizeAccess(["read_product_rating"]),
    ProductRatingController.getUserRatings
  );


  return router
}

export default routes
