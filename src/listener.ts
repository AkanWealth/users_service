import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    // Create RabbitMQ microservice
    const rmqMicroservice = await NestFactory.createMicroservice(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqps://kwtgacis:ou_O6bpIjUrfLjvvzTyvrrpC2JrU0lVZ@gerbil.rmq.cloudamqp.com/kwtgacis',
        ],
        queue: 'task_queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    // Create Redis microservice
    const redisMicroservice = await NestFactory.createMicroservice(AppModule, {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    });

    // Start RabbitMQ microservice
    await rmqMicroservice.listen();
    console.log('RabbitMQ Microservice connected successfully');

    // Start Redis microservice
    await redisMicroservice.listen();
    console.log('Redis Microservice connected successfully');
  } catch (error) {
    console.error('Error during microservice setup:', error);
  }
}

bootstrap();
