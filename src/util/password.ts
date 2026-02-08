import bcrypt from "bcryptjs";
import { removeAccents } from "./util";

export default class PasswordUtil {
  public static async hashPassword(
    password: string,
    salt = 10,
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static checkPasswordRules(password: string): string | undefined {
    const minPasswordLength = 8;
    const validSymbols = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "&",
      "*",
      "+",
      "=",
      "~",
      "^",
      "-",
      "_",
    ];
    const symbolsRegex = new RegExp(`[${validSymbols.join()}]`);
    const numberRegex = /[0-9]/;
    const uppercaseLetterRegex = /[A-Z]/;
    const letterRegex = /[A-Za-z]/;

    if (!password || password.length < minPasswordLength) {
      return `Password must have at least ${minPasswordLength} characters`;
    }

    password = removeAccents(password);

    if (!letterRegex.test(password)) {
      return "Password must contain at least one letter";
    }

    if (!uppercaseLetterRegex.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!numberRegex.test(password)) {
      return "Password must contain at least one number";
    }

    if (!symbolsRegex.test(password)) {
      return `Password must contain at least one special character. Ex.: ${validSymbols.join(", ")}`;
    }

    return;
  }
}
