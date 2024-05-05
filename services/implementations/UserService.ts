import { User, VideoState } from "@prisma/client";
import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoService } from "../IVideoService";
import { NotFoundError } from "../../errors/NotFoundError";
import { IVideoFileService } from "../IVideoFileService";
import { IUserService } from "../IUserService";
import { IUserRepository } from "../../repositories/IUserRepository";

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {

    }
    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.findAllUsers();
    }
    async getUserById(id: string): Promise<User> {
        let video = await this.userRepository.findUserById(id);
        if (video == null) throw new NotFoundError(404, "User not found");
        return video;
    }
    async deleteUserById(id: string): Promise<User> {
        return await this.userRepository.deleteUserById(id);
    }
    async createUser(email: string, password: string, displayName: string): Promise<User> {
        return await this.userRepository.createUser(email, password, displayName);
    }
    async updateUser({ id, email, password, displayName }: { id: string; email?: string | undefined; password?: string | undefined; displayName?: string | undefined; }): Promise<User> {
        return await this.userRepository.updateUser(id, email, password, displayName);
    }
}
