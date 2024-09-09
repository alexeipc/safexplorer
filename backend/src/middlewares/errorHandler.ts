import { Request, Response, NextFunction } from "express";
import { Middleware } from "./interface";
import { errorHandler } from "../errorHandler/IErrorHandler";

export class ErrorHandlerMiddleware implements Middleware {
    getAction(req: Request, res: Response, next: NextFunction): void {
    }

    errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
        errorHandler.handle(err);
        res.status(500).json({
            message: `Error: ${err.message}`,
        });
    }
}