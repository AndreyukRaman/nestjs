import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {sign} from 'jsonwebtoken'
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/login.dto';
import {compare} from 'bcrypt'

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,) {
  }
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where:{
        email: createUserDto.email,
      }
    })
    const userByUsername = await this.userRepository.findOne({
      where:{
        username: createUserDto.username,
      }
    })
    if(userByEmail || userByUsername){
      throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    const newUser = new UserEntity()
    Object.assign(newUser, createUserDto);
    console.log('newUser', newUser);
    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where:{
        email: loginUserDto.email,
      },
      select: { id: true, email: true, username: true, bio: true, image: true, password: true },
    })
    if(!user){
      throw new HttpException('Credentials not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);

    if(!isPasswordCorrect){
      throw new HttpException('Credentials not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    }

    delete (user as any).password
    return user;
  }

  generateJwt( user: UserEntity): string {
    return sign({
      id: user.id,
      username: user.username,
      email: user.email,
    }, JWT_SECRET)
  }


  buildUserResponse(user: UserEntity): UserResponseInterface {
     return {
       user: {
         ...user,
         token: this.generateJwt(user)
       }
     }
  }
}