import express, { Request, Response } from "express";
import { Home } from "./src/routes/home";
import cors from "cors";
import { LoadCrimeMap } from "./src/routes/loadCrimeMap";
import { LoadSafetyScore } from "./src/routes/loadSafetyScore";
import bodyParser from "body-parser";
import { MapLoadingQuadtree } from "./src/models/MapLoadingQuadTree";
import { LoggerMiddleWare } from "./src/middlewares/logger";
import { User } from "./src/routes/user";
import { ErrorHandlerMiddleware } from "./src/middlewares/errorHandler";

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONT_END_URL,
    })
  );

  var mapLoadQuadTree = new MapLoadingQuadtree();

  app.use(bodyParser.json());
  app.use(new LoggerMiddleWare().getAction);

  app.use("/home/", new Home().getRouter());
  app.use("/load-crime-map/", new LoadCrimeMap().getRouter());
  
  let loadSafetyScore: LoadSafetyScore = new LoadSafetyScore();

  app.use("/safety-score/", loadSafetyScore.getRouter());

  app.use("/user/", new User().getRouter());

  app.use(new ErrorHandlerMiddleware().errorHandler);

  return app;
}
