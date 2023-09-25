import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { validate } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const cacheKey = `user_${username}_${email}`;
    const cachedUser = await this.redisService.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // Check if a user with the same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    const newUser = await this.userRepository.save(user);

    await this.redisService.set(cacheKey, newUser, 3600); // Cache for 1 hour

    return newUser;
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { username, email, password } = updateUserDto;

    const cacheKey = `user_${username}_${email}`;
    const cachedUpdatedUser = await this.redisService.get<User>(cacheKey);

    if (cachedUpdatedUser) {
      return cachedUpdatedUser;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update user fields if provided
    if (username) {
      user.username = username;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      // Hash the new password before updating
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    // Update user data in Redis cache
    await this.redisService.set(cacheKey, updatedUser, 3600); // Cache for 1 hour

    return updatedUser;
  }

  async getUser(userId: number): Promise<User | undefined> {
    const cacheKey = `user:${userId}`;
    const cachedGetUser = await this.redisService.get<User>(cacheKey);

    if (cachedGetUser) {
      return cachedGetUser;
    }

    // If not found in cache, fetch from the database
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      // Store user data in Redis for caching
      await this.redisService.set(cacheKey, user, 3600);
    }

    return user;
  }
}
