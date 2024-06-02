import dotenv from 'dotenv';
import Connection, { ConnectionOptions } from 'rabbitmq-client';
import { UserRouterRabbit } from './routes/UserRouterRabbit';
import { UserService } from './services/implementations/UserService';
import { PrismaUserRepository } from './repositories/implementations/PrismaUserRepository';
import { RabbitVideoService } from './services/implementations/RabbitVideoService';

//For env File 
dotenv.config();

// RabbitMQ connection
const userName = "NodeUser";
const password = process.env.RABBITMQ_PASSWORD;
const hostname = process.env.RABBITMQ_HOSTNAME;
if (!password || !hostname) {
  throw new Error('RabbitMQ connection parameters not set')
}
const options: ConnectionOptions = { username: userName, password: password, connectionName: 'User Microservice', hostname: hostname };
const rabbit = new Connection(options);

rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established')
})

const userRouterRabbit = new UserRouterRabbit(rabbit, new UserService(new PrismaUserRepository(), new RabbitVideoService(rabbit)));
userRouterRabbit.start();