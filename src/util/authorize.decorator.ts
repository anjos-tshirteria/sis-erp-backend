import { PermissionCode } from "generated/prisma/enums";
import { RequestHandler } from "express";
import { authorize, authorizeAny } from "@src/middleware/permission.middleware";

/**
 * Helper para proteger uma rota com autenticação e autorização
 *
 * Uso:
 * router.post("/path", protectRoute(authMiddleware, authorize(PERMISSION)), handler)
 *
 * ou para múltiplas permissões (qualquer uma):
 * router.get("/path", protectRoute(authMiddleware, authorizeAny(PERM1, PERM2)), handler)
 */
export function protectRoute(
  authMiddleware: RequestHandler,
  ...middlewares: RequestHandler[]
): RequestHandler[] {
  return [authMiddleware, ...middlewares];
}

/**
 * Cria um middleware que requer uma específica permissão
 *
 * Uso:
 * router.post("/sales", requirePermission(authMiddleware, MANAGE_PRODUCTS), handler)
 */
export function requirePermission(
  authMiddleware: RequestHandler,
  ...permissions: PermissionCode[]
): RequestHandler[] {
  return [authMiddleware, authorize(...permissions)];
}

/**
 * Cria um middleware que requer qualquer uma das permissões
 *
 * Uso:
 * router.get("/reports", requireAnyPermission(authMiddleware, VIEW_REPORTS, MANAGE_USERS), handler)
 */
export function requireAnyPermission(
  authMiddleware: RequestHandler,
  ...permissions: PermissionCode[]
): RequestHandler[] {
  return [authMiddleware, authorizeAny(...permissions)];
}
