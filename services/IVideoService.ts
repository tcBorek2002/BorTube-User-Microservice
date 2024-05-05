import { Video, VideoState } from "@prisma/client";

export interface IVideoService {
    getAllVideos(): Promise<Video[]>;
    getAllVisibleVideos(): Promise<Video[]>;
    getVideoById(id: string): Promise<Video>;
    deleteVideoByID(id: string): Promise<Video>;
    createVideo(title: string, description: string, fileName: string): Promise<{ video: Video, sasUrl: string }>;
    updateVideo({ id, title, description, videoState }: { id: string; title?: string; description?: string; videoState?: VideoState }): Promise<Video>;
}