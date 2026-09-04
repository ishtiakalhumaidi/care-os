  import { NextFunction, Request, Response } from "express";
  import { ZodError, type ZodObject } from "zod";
  import status from "http-status";
  import AppError from "../errorHelpers/AppError.js";

  export const validateRequest = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (typeof req.body.data === "string") {
          req.body = JSON.parse(req.body.data);
        }

        req.body = await schema.parseAsync(req.body);

        next();
      } catch (error) {
        if (error instanceof SyntaxError) {
          return next(
            new AppError(status.BAD_REQUEST, "Invalid JSON in request body"),
          );
        }

        if (error instanceof ZodError) {
          return next(
            new AppError(
              status.BAD_REQUEST,
              error.issues.map((issue) => issue.message).join(", "),
            ),
          );
        }

        next(error);
      }
    };
  };
