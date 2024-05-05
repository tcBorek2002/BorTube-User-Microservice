import { Connection, Envelope } from 'rabbitmq-client';
import { IVideoService } from '../services/IVideoService';
import { ErrorDto } from '../dtos/ErrorDto';
import { NotFoundError } from '../errors/NotFoundError';
import { User, Video, VideoState } from '@prisma/client';
import { ResponseDto } from '../dtos/ResponseDto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { IVideoFileService } from '../services/IVideoFileService';
import { InternalServerError } from '../errors/InternalServerError';
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
        const getAllVideosServer = this.rabbit.createConsumer(
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
                const videoId = req.body.id;

                // Check if the video ID is a valid number
                if (videoId == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'User ID is required.')));
                }
                const { email, password, displayName } = req.body;

                // Update the video in the database
                this.userService.updateUser({ id: videoId, email: email, password: password, displayName: displayName }).then(async (updatedUser) => {
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

        const deleteVideoServer = this.rabbit.createConsumer(
            {
                queue: 'delete-video',
            },
            async (req, reply) => {
                console.log('Delete video request:', req.body);
                const videoId = req.body.id;

                // Check if the video ID is a valid number
                if (videoId == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Video ID is required.')));
                }

                let video = await this.videoService.getVideoById(videoId).catch((error) => {
                    return new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'Video not found.'));
                });
                if (video == null) {
                    return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'Video not found.')));
                }

                const videoObj = video as { id: string; title: string; description: string; videoState: VideoState; videoFileId: number | null; };

                await this.videoFileService.deleteVideoFileById(videoObj.id).catch((error) => {
                    return new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error. ' + error.message));
                });

                this.videoService.deleteVideoByID(videoId).then(async (deleted) => {
                    return await rabbitReply(reply, new ResponseDto<Video>(true, deleted));
                }).catch(async (error) => {
                    if (error instanceof NotFoundError) {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(404, 'NotFoundError', error.message)));
                    }
                    else {
                        return await rabbitReply(reply, new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                    }
                });
            }
        );

        process.on('SIGINT', async () => {
            await Promise.all([
                getAllVideosServer.close(),
                getAllVisibleVideosServer.close(),
                getVideoByIdServer.close(),
                createVideoServer.close(),
                updateVideoServer.close(),
                deleteVideoServer.close(),
            ]);
            await this.rabbit.close();
        });
    }
}