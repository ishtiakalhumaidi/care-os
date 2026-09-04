import { NextFunction, Request, Response } from "express";
import status from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env.js";
import AppError from "../errorHelpers/AppError.js";
import { prisma } from "../lib/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";

export const checkAuth = (...requiredRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          status.UNAUTHORIZED,
          "You are not authorized! Token is missing.",
        );
      }

      const token = authHeader.split(" ")[1];

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, envVars.ACCESS_TOKEN_SECRET) as JwtPayload;
      } catch (error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid or expired token.");
      }

      const userId = decoded.userId || decoded.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true, branch: true }, 
      });

      if (!user) {
        throw new AppError(
          status.UNAUTHORIZED,
          "User associated with this token not found.",
        );
      }

      if (user.isDeleted) {
        throw new AppError(status.FORBIDDEN, "This user account is deleted.");
      }

      if (!user.isActive) {
        throw new AppError(status.FORBIDDEN, "This user account is suspended.");
      }

      if (user.tenant) {
        if (!user.tenant.isActive) {
          throw new AppError(
            status.FORBIDDEN,
            "Your organization account has been suspended. Please contact support.",
          );
        }
      }

      if (user.branch && !user.branch.isActive) {
        throw new AppError(
          status.FORBIDDEN,
          "Your branch has been deactivated. Please contact your administrator.",
        );
      }

      if (
        user.needPasswordChange &&
        req.originalUrl !== "/api/v1/auth/resolve-password-change"
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "You must change your password before accessing the system.",
        );
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError(
          status.FORBIDDEN,
          "You do not have the required permissions to access this route.",
        );
      }

      (req as any).user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};