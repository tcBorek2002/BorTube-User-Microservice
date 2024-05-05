import { VideoFile } from "@prisma/client";

export interface IVideoFileService {
    getSasUrl(blobName: string): Promise<string>;
    deleteVideoFileById(videoFileId: string): Promise<VideoFile>;
    createVideoFile(blobName: string, duration: number, videoId: string): Promise<VideoFile>;
}