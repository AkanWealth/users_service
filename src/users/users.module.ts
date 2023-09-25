import { User } from './users.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/redis/redis.module';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          // urls: ['amqp://localhost:5672'],
          urls: [
            'amqps://kwtgacis:ou_O6bpIjUrfLjvvzTyvrrpC2JrU0lVZ@gerbil.rmq.cloudamqp.com/kwtgacis',
          ],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    RedisModule,
    // ClientsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
