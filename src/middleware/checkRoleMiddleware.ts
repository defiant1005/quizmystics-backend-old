import { Request, Response, NextFunction } from "express";
import jwt, { Jwt, JwtPayload, Secret } from "jsonwebtoken";

interface DecodedJwt extends Jwt, JwtPayload {
  roleId: number;
}

interface CustomRequest extends Request {
  user?: DecodedJwt;
}

export default function checkRole(roleId: number) {
  return function (req: CustomRequest, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY as Secret) as DecodedJwt;
      if (decoded.roleId !== roleId) {
        return res.status(403).json({ message: "Нет доступа" });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ message: "Не авторизован" });
    }
  };
}
