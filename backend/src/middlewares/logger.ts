import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Middleware } from "./interface";

/**
 * The middleware that is used to log the request ot
 */
export class LoggerMiddleWare implements Middleware {
    /**
     * Determined that the middleware should print out the information about the request
     * @param req the request
     * @param res the response
     * @param next the next ware in the pipline
     */
    getAction(req: Request, res: Response, next: NextFunction): void {
        console.log(req.ip,"has a request to", req.originalUrl,"at", new Date(),"from",req.get('User-Agent'));
        next();
    }
}