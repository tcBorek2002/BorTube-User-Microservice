import { Connection, Envelope } from 'rabbitmq-client';
import { ErrorDto } from '../dtos/ErrorDto';
import { NotFoundError } from '../errors/NotFoundError';
import { User } from '@prisma/client';
import { ResponseDto } from '../dtos/ResponseDto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { IUserService } from '../services/IUserService';

async function rabbitReply(reply: (body: any, envelope?: Envelope | undefined) => Promise<void>, response: ResponseDto<any>): Promise<void> {
    await reply(response);
}

export class UserRouterRabbit {
    private rabbit: Connection;
    private userService: IUserService;

    constructor(rabbit: Connection, userService: IUserService) {
        this.rabbit = rabbit;
        this.userService = userService;
    }

    public start(): void {

        const authenticateUserServer = this.rabbit.createConsumer(
            {
                queue: 'authenticate-user',
            },
            async (req, reply) => {
                console.log('Authenticate user request:', req.body);
                const { email, password } = req.body;
                if (!email || !password) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Email and password are required.')));
                }

                this.userService.authenticateUser(email, password).then(async (user) => {
                    return await rabbitReply(reply, new ResponseDto<User>(true, user));
                }).catch(async (error) => {
                    if (error instanceof NotFoundError) {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(401, 'NotFoundError', 'Invalid email or password.')));
                    }
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                });
            }
        );


        const getAllUsersServer = this.rabbit.createConsumer(
            {
                queue: 'get-all-users',
            },
            async (req, reply) => {
                console.log('Get all users request:', req.body);
                const users = await this.userService.getAllUsers();
                rabbitReply(reply, new ResponseDto<User[]>(true, users));
            }
        );

        const getUserByIdServer = this.rabbit.createConsumer(
            {
                queue: 'get-user-by-id',
            },
            async (req, reply) => {
                console.log('Get user by id:', req.body.id);
                let userId = req.body.id;
                if (userId == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'User ID is required.')));
                }

                try {
                    const user = await this.userService.getUserById(userId);
                    rabbitReply(reply, new ResponseDto<User>(true, user));
                } catch (error) {
                    if (error instanceof NotFoundError) {
                        rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'User not found.')));
                    }
                }
            }
        );

        const createUserServer = this.rabbit.createConsumer(
            {
                queue: 'create-user',
            },
            async (req, reply) => {
                console.log('Create user request:', req.body);

                if (req.body == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Email, password and displayName are required.')));
                }

                const { email, password, displayName } = req.body;
                if (!email || !password || !displayName) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Email, password and displayName are required.')));
                }

                let createdObject = await this.userService.createUser(email, password, displayName).catch(async (error) => {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error. ' + error.message)));
                });

                if (createdObject == null) return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                await rabbitReply(reply, new ResponseDto<User>(true, createdObject));
            }
        );

        const updateUserServer = this.rabbit.createConsumer(
            {
                queue: 'update-user',
            },
            async (req, reply) => {
                console.log('Update user request:', req.body);

                // Check if the video ID is a valid number
                const { id, email, password, displayName } = req.body;

                if (id == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'User ID is required.')));
                }

                // Update the video in the database
                this.userService.updateUser({ id: id, email: email, password: password, displayName: displayName }).then(async (updatedUser) => {
                    if (updatedUser != null) { return await rabbitReply(reply, new ResponseDto<User>(true, updatedUser)) }
                    else {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'Video not found.')));
                    }
                }).catch(async (error) => {
                    if (error instanceof PrismaClientValidationError) {
                        console.error('Error updating video:', error);
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Invalid input.')));
                    }
                    else {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                    }
                });
            }
        );

        const deleteUserServer = this.rabbit.createConsumer(
            {
                queue: 'delete-user',
            },
            async (req, reply) => {
                console.log('Delete user request:', req.body);
                const userId = req.body.id;

                // Check if the video ID is a valid number
                if (userId == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'User ID is required.')));
                }

                this.userService.deleteUserById(userId).then(async (deletedUser) => {
                    if (deletedUser != null) { return await rabbitReply(reply, new ResponseDto<User>(true, deletedUser)) }
                    else {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'User not found.')));
                    }
                }).catch(async (error) => {
                    if (error instanceof NotFoundError) {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'User not found.')));
                    }
                    console.error('Error deleting video:', error);
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error: ' + error.message)));
                });
            }
        );

        process.on('SIGINT', async () => {
            await Promise.all([
                authenticateUserServer.close(),
                getAllUsersServer.close(),
                getUserByIdServer.close(),
                createUserServer.close(),
                updateUserServer.close(),
                deleteUserServer.close(),
            ]);
            await this.rabbit.close();
        });
    }
}