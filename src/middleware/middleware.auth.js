import j from "jsonwebtoken";
import "dotenv/config";

/**
 * Middleware for ensuring incoming token has all input roles
 * If no roles are specified, the middleware will ensure that the user has a token at least.
 * @param {string[] | null} roles
 * @returns {void}
 */
export function authorizedRoute(roles) {
  if (
    roles != undefined &&
    !(roles instanceof Array && roles.every((role) => typeof role === "string"))
  ) {
    throw new TypeError("Roles must be an array of strings");
  }
  return (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Access denied. No token provided.",
      });
    }

    /** @type {{id: string, roles: string[]}} */
    let data;
    try {
      data = j.verify(token, process.env.JWT_SECRET || "123456789");
      req.user = { id: data.id, roles: data.roles };
    } catch (error) {
      if (error instanceof j.TokenExpiredError) {
        return res.status(401).json({
          ok: false,
          message: "Token expired",
        });
      }
      throw error;
    }

    const userRoles = req.user.roles;
    if (!roles) {
      next();
      return;
    }

    const hasRole = roles.every((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.status(401).json({
        ok: false,
        message: "Access denied. User does not have required roles",
      });
    }

    next();
  };
}
