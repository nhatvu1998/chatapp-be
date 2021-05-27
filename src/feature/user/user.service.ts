import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSession } from 'src/share/interface/session.interface';
import { verify } from 'jsonwebtoken';
import { jwtConstants } from '../auth/constansts/jwt.constanst';
import { genSalt, hash } from 'bcrypt';
import { RegisterInput } from '../auth/inputs/register.input';
import { join } from 'path';
import { Storage } from '@google-cloud/storage';
import { RedisCacheService } from '../cache/redisCache.service';
const serviceKey = join(__dirname, '../../../keys.json')

const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'smooth-helper-288812',
})

export const fileBucket = storage.bucket('chatapp-vu')


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async getUserByIdOrFail(id: string) {
    try {
      return await this.userRepo.findOneOrFail(id);
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async findOne(userId: string) {
    const userCache = await this.redisCacheService.get(`user::${userId}`);
    if (userCache) {
      return userCache;
    } else {
      const user = await this.userRepo.findOne({ _id: userId });
      await this.redisCacheService.set(`user::${userId}`, user);
      return user;
    }
  }

  async findOneByName(username: string) {
    return this.userRepo.findOne({ username });
  }

  async getUsers(userId) {
    return this.userRepo.find({ where: { _id: { $not: { $in: [userId] } } } });
  }

  async decodeToken(token: string): Promise<any> {
    const decoded = verify(token, jwtConstants.secret);
    const { userId } = decoded as UserSession;
    return { userId };
  }

  async createUser(userData: RegisterInput) {
    const existedUser = await this.userRepo.findOne({
      username: userData.username,
    });
    if (existedUser) {
      throw new BadRequestException('username already existed');
    }
    if (userData.password !== userData.passwordCheck) {
      throw new BadRequestException(
        'Password and password check must be identical',
      );
    }
    const salt = await genSalt(10);
    const hashedPassword = await hash(userData.password, salt);
    const user = new UserEntity({
      username: userData.username,
      password: hashedPassword,
      fullname: userData.fullname,
      email: userData.email,
    });

    return this.userRepo.save(user);
  }

  async updateUser(
    id,
    userInfo: Pick<
      UserEntity,
      'email' | 'username' | 'fullname' | 'phone' | 'gender' | 'isOnline'
    >,
    avatarFile,
  ) {
    const { createReadStream, filename, mimetype, encoding } = await avatarFile;
    const user = await this.userRepo.findOne({ _id: id });
    if (!user) {
      throw new BadRequestException('user not found');
    }

    user.email = userInfo.email ?? user.email;
    user.username = userInfo.username ?? user.username;
    user.fullname = userInfo.fullname ?? user.fullname;
    user.phone = userInfo.phone ?? user.phone;
    user.gender = userInfo.gender ?? user.gender;
    user.isOnline = userInfo.isOnline ?? user.isOnline;
    console.log(filename);
    await new Promise((res) =>
      createReadStream()
        .pipe(
          fileBucket.file(filename).createWriteStream({
            resumable: false,
            gzip: true,
          }),
        )
        .on('finish', async () => {
          const uploadResult = (
            await fileBucket.file(filename).getMetadata()
          )[0];
          const fileInfo = {
            key: uploadResult.id,
            name: uploadResult.name,
            url: `https://storage.googleapis.com/${uploadResult.bucket}/${uploadResult.name}`,
          };
          // tslint:disable-next-line:no-unused-expression
          user.avatarFile = fileInfo;
          return this.userRepo.save(user);
        })
        .on('error', (err) => console.log(err)),
    );
  }
}
