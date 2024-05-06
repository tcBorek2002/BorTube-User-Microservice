import dotenv from 'dotenv';
import Connection, { ConnectionOptions } from 'rabbitmq-client';
import { UserRouterRabbit } from './routes/UserRouterRabbit';
import { UserService } from './services/implementations/UserService';
import { PrismaUserRepository } from './repositories/implementations/PrismaUserRepository';

//For env File 
dotenv.config();

// RabbitMQ connection
const userName = "NodeUser";
const password = process.env.RABBITMQ_PASSWORD;
const options: ConnectionOptions = { username: userName, password: password, connectionName: 'User Microservice', hostname: "217.105.22.226" };
const rabbit = new Connection(options);

rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established')
})

const userRouterRabbit = new UserRouterRabbit(rabbit, new UserService(new PrismaUserRepository()));
userRouterRabbit.start();