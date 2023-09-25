// custom-rmq-transport.adapter.ts
import { RmqOptions, Transport } from '@nestjs/microservices';

export const customRMQConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'], // Replace with your RabbitMQ connection URL
    queue: 'task_queue', // Replace with the queue name you want to use
    queueOptions: {
      durable: false, // Set to true if the queue should survive broker restarts
    },
  },
};
