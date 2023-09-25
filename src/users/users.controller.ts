import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { EventPattern } from '@nestjs/microservices';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.userService.createUser(createUserDto);
    this.client.emit('user.created', { userId: newUser.id });
    return newUser;
  }

  @Put(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );
    this.client.emit('user_updated', { userId: updatedUser.id });
    return updatedUser;
  }

  @Get(':id')
  async getUser(@Param('id') userId: number): Promise<User | undefined> {
    const user = await this.userService.getUser(userId);
    this.client.emit('user_retriever', { userId: user.id });
    return user;
  }
}
