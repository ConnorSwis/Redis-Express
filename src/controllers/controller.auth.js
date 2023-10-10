import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import "dotenv/config";

/**
 * Generates a signed JWT token for a user.
 *
 * @param {User} user - The user for whom the token is generated.
 * @returns {string} The signed JWT token.
 */
const signedToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      roles: user.roles,
    },
    process.env.JWT_SECRET || "123456789",
    { expiresIn: 5 }
  );
};

/**
 * Controller for user authentication.
 * @type {{[key: string]: (req: Request, res: Response) => Promise<any>}}
 */
export const authController = {
  /**
   * Registers a new user.
   */
  register: async (req, res) => {
    /** @type {{email: string, password: string}} */
    const { email, password } = req.body;
    const user = await User.create(email, password);

    if (!user)
      return res
        .status(400)
        .json({ ok: false, message: "User already exists." });

    const token = signedToken(user);
    res.status(201).json({
      ok: true,
      user,
      token,
    });
  },

  /**
   * Logs in a user.
   * @param {{body: {email: string, password: string}}} req
   * @param {Response} res
   */
  login: async (req, res) => {
    const { email, password } = req.body;

    const user = await User.fetchByEmail(email);

    if (!user)
      return res
        .status(400)
        .json({ ok: false, message: "Invalid email or password." });

    if (!(await user.verifyPassword(password)))
      return res
        .status(400)
        .json({ ok: false, message: "Invalid email or password." });

    const token = signedToken(user);
    res.status(200).json({
      ok: true,
      user,
      token,
    });
  },

  /**
   * Updates a user's information.
   */
  update: async (req, res) => {},

  /**
   * Deletes a user.
   */
  delete: async (req, res) => {},

  /**
   * Checks if a user is authorized.
   */
  isAuthorized: async (req, res) => {
    const token = req.headers("x-auth-token");
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Access denied. No token provided",
      });
    }
    res.status(200).json({ ok: true, message: "Authorized" });
  },

  /**
   * Gets the user's information.
   * @param {{user: User}} req
   */
  getUser: async (req, res) => {
    return res.status(200).json(req.user);
  },

  /**
   * Sets the roles for a user.
   */
  setRoles: async (req, res) => {},
};
