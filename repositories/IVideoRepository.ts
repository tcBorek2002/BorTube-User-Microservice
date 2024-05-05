import { Video, VideoState } from "@prisma/client";

export interface IVideoRepository {
    findAllVideos(): Promise<Video[]>;
    findAllVisibleVideos(): Promise<Video[]>;
    findVideoByID(id: string): Promise<Video | null>;
    deleteVideoByID(id: string): Promise<Video>;
    createVideo(title: string, description: string, videoState: VideoState): Promise<Video>;
    updateVideo(id: string, title?: string, description?: string, videoState?: VideoState): Promise<Video>;
}