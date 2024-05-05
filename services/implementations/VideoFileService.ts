import { VideoFile, VideoState } from "@prisma/client";
import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoService } from "../IVideoService";
import { NotFoundError } from "../../errors/NotFoundError";
import { IVideoFileService } from "../IVideoFileService";
import Connection from "rabbitmq-client";
import { ResponseDto } from "../../dtos/ResponseDto";
import { InternalServerError } from "../../errors/InternalServerError";
import { ErrorDto } from "../../dtos/ErrorDto";

export class VideoFileService implements IVideoFileService {
    private rabbit: Connection;

    constructor(connection: Connection) {
        this.rabbit = connection;
    }
    async createVideoFile(blobName: string, duration: number, videoId: string): Promise<VideoFile> {
        console.log('Creating video file.,..');
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const body = { blobName, duration, videoId };

        const res = await rpcClient.send('create-video-file', body);
        await rpcClient.close()

        if (!res || !res.body || res.contentType !== 'application/json' || !ResponseDto.isResponseDto(res.body)) {
            throw new InternalServerError(500, 'Invalid response create-video-file: ' + res.body);
        }

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            throw new InternalServerError(500, error.message);
        }
        else {
            let videoFile = response.data as VideoFile;
            return videoFile;
        }
    }
    async deleteVideoFileById(videoFileId: string): Promise<VideoFile> {
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const body = { videoFileId: videoFileId };

        const res = await rpcClient.send('delete-video-file', body);
        await rpcClient.close()

        if (!res || !res.body || res.contentType !== 'application/json' || !ResponseDto.isResponseDto(res.body)) {
            throw new InternalServerError(500, 'Invalid response delete-video-file: ' + res.body);
        }

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            throw new InternalServerError(500, error.message);
        }
        else {
            let deletedVideoFile = (response.data as { deleteVideoFile: VideoFile }).deleteVideoFile;
            return deletedVideoFile;
        }
    }

    async getSasUrl(blobName: string): Promise<string> {
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const body = { blobName: blobName };

        const res = await rpcClient.send('get-upload-url', body);
        await rpcClient.close()

        if (!res || !res.body || res.contentType !== 'application/json' || !ResponseDto.isResponseDto(res.body)) {
            throw new InternalServerError(500, 'Invalid response get-upload-url: ' + res.body);
        }

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            throw new InternalServerError(500, error.message);
        }
        else {
            let url = (response.data as { url: string }).url;
            return url;
        }
    }
}
