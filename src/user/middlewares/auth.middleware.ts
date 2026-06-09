import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { Response } from 'express';
import {verify} from 'jsonwebtoken'
import { JWT_SECRET } from '@app/config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService ) {}
  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];

    try{
      const decode = verify(token, JWT_SECRET) as { id: number };
      const user = await this.userService.findById(decode.id);
      req.user = user;
      next();
    }catch(err){
      req.user = null;
      next();
    }
  }
}