import { User } from "@prisma/client";
import { NotFoundError } from "../../errors/NotFoundError";
import { IUserService } from "../IUserService";
import { IUserRepository } from "../../repositories/IUserRepository";
import bcrypt from "bcrypt";

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {

    }
    async authenticateUser(email: string, password: string): Promise<User> {
        let user = await this.userRepository.findUserByEmail(email);
        if (user == null) {
            throw new NotFoundError(401, "User with this email does not exist.");
        }
        let success = await bcrypt.compare(password, user.password);
        if (success) {
            return user;
        }
        else {
            throw new NotFoundError(401, "Invalid password.");
        }
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
        let hashedPassword = await bcrypt.hash(password, 10);
        return await this.userRepository.createUser(email, hashedPassword, displayName);
    }
    async updateUser({ id, email, password, displayName }: { id: string; email?: string | undefined; password?: string | undefined; displayName?: string | undefined; }): Promise<User> {
        if (password) {
            password = await bcrypt.hash(password, 10);
        }
        return await this.userRepository.updateUser(id, email, password, displayName);
    }
}
