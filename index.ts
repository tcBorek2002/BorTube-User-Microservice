import dotenv from 'dotenv';
import { VideoService } from './services/implementations/VideoService';
import { PrismaVideoRepository } from './repositories/implementations/PrismaVideoRepository';
import Connection, { ConnectionOptions } from 'rabbitmq-client';
import { VideoRouterRabbit } from './routes/VideoRouterRabbit';
import { VideoFileService } from './services/implementations/VideoFileService';

//For env File 
dotenv.config();

// RabbitMQ connection
const userName = "NodeUser";
const password = process.env.RABBITMQ_PASSWORD;
const options: ConnectionOptions = { username: userName, password: password, connectionName: 'Video Microservice', hostname: "217.105.22.226" };
const rabbit = new Connection(options);

rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established')
})
const videoRouterRabbit = new VideoRouterRabbit(rabbit, new VideoService(new PrismaVideoRepository(), new VideoFileService(rabbit)), new VideoFileService(rabbit));
videoRouterRabbit.start();
