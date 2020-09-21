import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { MongoRepository, Repository } from 'typeorm';
import { LoginInput } from './inputs/login.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepo: MongoRepository<UserEntity>,
  ) {}

  async createToken(userData: LoginInput): Promise<any> {
    const user = await this.userService.findOneByName(userData.username);
    if (!user) throw new UnauthorizedException('Invalid username or password');
    const isPasswordValid = await compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = this.jwtService.sign({
      userId: user._id,
      // role: user.role,
    });
    await this.userRepo.updateOne(
      {_id: user._id},
      {
        $set: {
          isOnline: true,
        },
    });
    return { token };
  }

  async logout(id: string): Promise<any> {
    const user = await this.userService.findOne(id);
    if (!user) throw new UnauthorizedException('User not found!');
    return this.userRepo.updateOne(
      {_id: id},
      {
        $set: {
          isOnline: false,
        },
      });
  }
}
