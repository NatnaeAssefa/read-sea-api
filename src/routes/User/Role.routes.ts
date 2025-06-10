import express from "express";
import { RoleController } from "../../controllers/User";

import { AuthenticateUser, AuthorizeAccess } from "../../middleware/Auth/Auth";

const routes = () => {
  /**
   * @swagger
   * tags:
   *   name: Role
   *   description: Role management APIs
   */

  const router = express.Router();

  /**
   * public roles
   */

  router.get(
    "/selected-roles",
    RoleController.findSelectedRole
  );

  /**
   * @swagger
   * /roles/get:
   *   get:
   *     summary: Fetch a Role
   *     tags: [Role]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get(
    "/get",
    AuthenticateUser,
    AuthorizeAccess(["read_role"]),
    RoleController.findOne
  );

  /**
   * @swagger
   * /roles:
   *   get:
   *     summary: Fetch Roles
   *     tags: [Role]
   *     parameters:
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   */
  router.get(
    "/",
    AuthenticateUser,
    // AuthorizeAccess(["read_role"]),
    RoleController.findMany
  );

  /**
   * @swagger
   * /roles/{id}:
   *   get:
   *     summary: Fetch Role by ID
   *     tags: [Role]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: Role ID
   *       - in: query
   *         name: query
   *         description: query
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Input Validation Error
   *       404:
   *         description: Role Not Found
   */
  router.get(
    "/:id",
    AuthenticateUser,
    AuthorizeAccess(["read_role"]),
    RoleController.findById
  );

  

  /**
   * @swagger
   * /roles:
   *   post:
   *     summary: Create Role
   *     tags: [Role]
   *     responses:
   *       201:
   *         description: Success
   */
  router.post(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.create
  );

  /**
   * @swagger
   * /roles:
   *   put:
   *     summary: Update Role
   *     tags: [Role]
   *     responses:
   *       200:
   *         description: Success
   */
  router.put(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.update
  );

  /**
   * @swagger
   * /roles/restore:
   *   patch:
   *     summary: Restore Role
   *     tags: [Role]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Role Not Found
   */
  router.patch(
    "/restore",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.restore
  );

  /**
   * @swagger
   * /roles:
   *   delete:
   *     summary: Delete Role
   *     tags: [Role]
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Role Not Found
   */
  router.delete(
    "/",
    AuthenticateUser,
    AuthorizeAccess(["delete_role"]),
    RoleController.delete
  );

  router.post(
    "/update-user-role",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.updateUserRolePermissions
  );

  /**
   * @swagger
   * /roles/update-admin-permissions:
   *   post:
   *     summary: Update Admin role permissions
   *     tags: [Role]
   *     responses:
   *       200:
   *         description: Success
   */
  router.post(
    "/update-admin-permissions",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.updateAdminPermissions
  );

  /**
   * @swagger
   * /roles/add-product-image-access:
   *   post:
   *     summary: Add product image access to Admin role
   *     tags: [Role]
   *     responses:
   *       200:
   *         description: Success
   */
  router.post(
    "/add-product-image-access",
    AuthenticateUser,
    AuthorizeAccess(["write_role"]),
    RoleController.addProductImageAccess
  );

  return router;
};

export default routes;
