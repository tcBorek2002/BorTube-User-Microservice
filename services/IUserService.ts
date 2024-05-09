import { User } from "@prisma/client";
import { UserDto } from "../dtos/UserDto";

export interface IUserService {
    authenticateUser(email: string, password: string): Promise<User>;
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    getUsersByIds(ids: string[]): Promise<UserDto[]>;
    deleteUserById(id: string): Promise<User>;
    createUser(email: string, password: string, displayName: string): Promise<User>;
    updateUser({ id, email, password, displayName }: { id: string; email?: string; password?: string; displayName?: string }): Promise<User>;
}