import { NextFunction, Request, Response } from "express";
import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";

interface DecodedJwt extends Jwt, JwtPayload {
  roleId: number;
}

interface CustomRequest extends Request {
  user?: DecodedJwt;
}

export default function (req: CustomRequest, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    const token = req.headers.authorization?.split(" ")[1] as string;
    if (!token) {
      return res.status(401).json({ message: "Не авторизован" });
    }

    req.user = jwt.verify(token, process.env.SECRET_KEY as Secret) as DecodedJwt;
    next();
  } catch (e) {
    res.status(401).json({ message: "Не авторизован" });
  }
}
