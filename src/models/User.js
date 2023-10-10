import { userRepo } from "../db/repositories/repository.user.js";
import { EntityId } from "redis-om";
import { genSalt, hash, compare } from "bcrypt";

/**
 * Represents a User in the system.
 * @class
 * @property {string} email - The email address of a user.
 * @property {string} id - The unique identifier of a user.
 * @property {string[]} roles - The roles of a user.
 */
export class User {
  /**
   * Creates a new User instance.
   * @private
   * @constructor
   * @param {string} email - The email address of the user.
   * @param {string} id - The unique identifier of the user.
   * @param {string[]} roles - The roles of the user.
   */
  constructor(email, id, roles) {
    this.email = email;
    this.id = id;
    this.roles = roles;
  }

  /**
   * Fetches a user by their email address.
   * @static
   * @async
   * @param {string} email - The email address of the user to fetch.
   * @returns {Promise<User>} A promise that resolves to a User instance if found, or null if not found.
   */
  static async fetchByEmail(email) {
    const user = await userRepo
      .search()
      .where("email")
      .equal(email)
      .return.first();

    const id =
      user[
        Object.getOwnPropertySymbols(user).find(
          (s) => s.description === EntityId.description
        )
      ];
    return new User(email, id, user.roles);
  }

  /**
   * Fetches a user by their ID.
   * @static
   * @async
   * @param {any} id - The ID of the user to fetch.
   * @returns {Promise<User>} A promise that resolves to a User instance if found, or null if not found.
   */
  static async fetchById(id) {
    const user = await userRepo.fetch(id);
    return new User(user.email, id, user.roles);
  }

  /**
   * Fetches the password hash of the user.
   * @async
   * @returns {Promise<string>} A promise that resolves to the user's password hash.
   */
  async fetchPasswordHash() {
    const user = await userRepo.fetch(this.id);
    return user.password;
  }

  /**
   * Creates a new user with the given email and password.
   * @static
   * @async
   * @param {string} email - The email address of the new user.
   * @param {string} password - The password of the new user.
   * @param {string[]} roles - The roles of the new user. Defaults to ["user"].
   * @returns {Promise<User>} A promise that resolves to a User instance representing the newly created user.
   */
  static async create(email, password, roles = ["user"]) {
    const checkUser = await User.fetchByEmail(email);
    const salt = await genSalt(15);
    const hashedPassword = await hash(password, salt);
    const user = await userRepo.save({
      email,
      password: hashedPassword,
      roles: roles || ["user"],
    });

    return new User(
      email,
      user[
        Object.getOwnPropertySymbols(user).find(
          (s) => s.description === EntityId.description
        )
      ],
      roles
    );
  }

  /**
   * Compare plain password against hashed user password.
   * @param {string} password
   * @async
   * @returns {boolean}
   */
  async verifyPassword(password) {
    const userPassword = await this.fetchPasswordHash();
    return await compare(password, userPassword);
  }

  /**
   * Update user data
   * @async
   * @param {{
   * email: string | null,
   * password: string | null,
   * roles: string[] | null
   * }} data
   * @returns {Promise<User>} A promise that resolves to the updated User instance.
   */
  async update(data) {
    const user = await userRepo.fetch(this.id);

    if (data.email) {
      user.email = data.email;
      this.email = data.email;
    }
    if (data.password) {
      const salt = await genSalt(15);
      const password = await hash(data.password, salt);

      user.password = password;
      this.password = password;
    }
    if (data.roles) {
      user.roles = data.roles;
      this.roles = data.roles;
    }

    await userRepo.save(user);

    return this;
  }
}
