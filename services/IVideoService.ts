
export interface IVideoService {
    deleteVideosByUserId(userId: string): Promise<boolean>;
}