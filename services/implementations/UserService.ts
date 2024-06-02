import { User } from "@prisma/client";
import { NotFoundError } from "../../errors/NotFoundError";
import { IUserService } from "../IUserService";
import { IUserRepository } from "../../repositories/IUserRepository";
import bcrypt from "bcrypt";
import { UserDto } from "../../dtos/UserDto";
import * as argon2 from "argon2";
import dotenv from 'dotenv';
import { IVideoService } from "../IVideoService";

dotenv.config();

const PEPPER = process.env.PEPPER

export class UserService implements IUserService {

    constructor(private userRepository: IUserRepository, private videoService: IVideoService) {

    }


    async authenticateUser(email: string, password: string): Promise<User> {
        if (!PEPPER) {
            console.log("Pepper is not set");
            throw new Error("Pepper is not set");
        }

        let user;
        try {
            user = await this.userRepository.findUserByEmail(email);
        }
        catch (error) {
            console.log("Error finding user: ", error);
            throw new NotFoundError(401, "User with this email does not exist.");
        }
        if (user == null) {
            throw new NotFoundError(401, "User with this email does not exist.");
        }
        let success = await argon2.verify(user.password, password, { secret: Buffer.from(PEPPER) });
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
        let user = await this.userRepository.findUserById(id);
        if (user == null) throw new NotFoundError(404, "User not found");
        return user;
    }
    async getUsersByIds(ids: string[]): Promise<UserDto[]> {
        let users = await this.userRepository.findUsersByIds(ids);
        let userDtos: UserDto[] = [];
        users.forEach(user => {
            userDtos.push({ id: user.id, displayName: user.displayName });
        });
        return userDtos;
    }
    async deleteUserById(id: string): Promise<User> {
        let videosDeleted = await this.videoService.deleteVideosByUserId(id).catch((error) => {
            throw error;
        });
        console.log("Videos deleted?: ", videosDeleted);
        if (!videosDeleted) {
            throw new Error("Failed to delete videos by user");
        }
        let user = await this.userRepository.findUserById(id);
        if (!user) throw new NotFoundError(404, "User not found");
        else {
            return await this.userRepository.deleteUserById(id);
        }
    }
    async createUser(email: string, password: string, displayName: string): Promise<User> {
        if (!PEPPER) {
            throw new Error("Pepper is not set");
        }
        let hashedPassword = await argon2.hash(password, { secret: Buffer.from(PEPPER) });
        return await this.userRepository.createUser(email, hashedPassword, displayName);
    }
    async updateUser({ id, email, password, displayName }: { id: string; email?: string | undefined; password?: string | undefined; displayName?: string | undefined; }): Promise<User> {
        if (!PEPPER) {
            throw new Error("Pepper is not set");
        }
        if (password) {
            password = await argon2.hash(password, { secret: Buffer.from(PEPPER) });
        }
        return await this.userRepository.updateUser(id, email, password, displayName);
    }
}
