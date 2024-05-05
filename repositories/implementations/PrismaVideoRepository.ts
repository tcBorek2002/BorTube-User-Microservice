import { Video, VideoState } from "@prisma/client";
import { IVideoRepository } from "../IVideoRepository";
import prisma from "../../client";


export class PrismaVideoRepository implements IVideoRepository {
    async findAllVideos(): Promise<Video[]> {
        return await prisma.video.findMany({ include: { videoFile: true } });
    }
    async findAllVisibleVideos(): Promise<Video[]> {
        return await prisma.video.findMany({ where: { videoState: VideoState.VISIBLE }, include: { videoFile: true } });
    }
    async findVideoByID(id: string): Promise<Video | null> {
        return await prisma.video.findUnique({ where: { id }, include: { videoFile: true } });
    }
    async deleteVideoByID(id: string): Promise<Video> {
        return await prisma.video.delete({ where: { id } });
    }
    async createVideo(title: string, description: string, videoState: VideoState): Promise<Video> {
        return await prisma.video.create({
            data: {
                title,
                description,
                videoState,
            }
        })
    }
    async updateVideo(id: string, title?: string, description?: string, videoState?: VideoState): Promise<Video> {
        return await prisma.video.update({ where: { id }, data: { title, description, videoState } });
    }

}