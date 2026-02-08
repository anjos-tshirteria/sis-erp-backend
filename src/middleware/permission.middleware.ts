import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { PermissionCode } from "generated/prisma/enums";
import { prisma } from "@src/database";

export type AuthorizedRequest = Request & JwtPayload;

/**
 * Middleware que verifica se o usuário tem as permissões necessárias
 * @param requiredPermissions - Array de permissões necessárias para acessar a rota
 * @returns Middleware function
 */
export function authorize(...requiredPermissions: PermissionCode[]) {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(401).json();
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
            },
          },
        },
      });

      if (!user || !user.role) {
        return res.status(403).json();
      }

      const rolePermissions = user.role.permissions || [];
      const hasPermission = requiredPermissions.every((permission) =>
        rolePermissions.includes(permission),
      );

      if (!hasPermission) {
        return res.status(403).json();
      }

      req.userRole = user.role;
      req.userPermissions = rolePermissions;

      return next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

/**
 * Middleware que verifica se o usuário tem alguma das permissões fornecidas
 * @param permissionsToCheck - Array de permissões (o usuário deve ter pelo menos uma)
 * @returns Middleware function
 */
export function authorizeAny(...permissionsToCheck: PermissionCode[]) {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(401).json();
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
            },
          },
        },
      });

      if (!user || !user.role) {
        return res.status(403).json();
      }

      const rolePermissions = user.role.permissions || [];
      const hasPermission = permissionsToCheck.some((permission) =>
        rolePermissions.includes(permission),
      );

      if (!hasPermission) {
        return res.status(403).json();
      }

      req.userRole = user.role;
      req.userPermissions = rolePermissions;

      return next();
    } catch (error) {
      console.error("Authorization middleware error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
