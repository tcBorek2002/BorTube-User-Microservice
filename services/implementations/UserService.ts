import { User } from "@prisma/client";
import { NotFoundError } from "../../errors/NotFoundError";
import { IUserService } from "../IUserService";
import { IUserRepository } from "../../repositories/IUserRepository";

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {

    }
    async authenticateUser(email: string, password: string): Promise<{ id: string; email: string; password: string; displayName: string | null; }> {
        let user = await this.userRepository.authenticateUser(email, password);
        if (user == null) throw new NotFoundError(401, "Invalid email or password");
        return user;
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
        let user = await this.userRepository.findUserById(id);
        if (!user) throw new NotFoundError(404, "User not found");
        else {
            return await this.userRepository.deleteUserById(id);
        }
    }
    async createUser(email: string, password: string, displayName: string): Promise<User> {
        return await this.userRepository.createUser(email, password, displayName);
    }
    async updateUser({ id, email, password, displayName }: { id: string; email?: string | undefined; password?: string | undefined; displayName?: string | undefined; }): Promise<User> {
        return await this.userRepository.updateUser(id, email, password, displayName);
    }
}
