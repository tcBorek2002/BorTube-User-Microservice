import { User } from "@prisma/client";

export interface IUserRepository {
    authenticateUser(email: string, password: string): Promise<User | null>;
    findAllUsers(): Promise<User[]>;
    findUserById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    deleteUserById(id: string): Promise<User>;
    createUser(email: string, password: string, displayName: string): Promise<User>;
    updateUser(id: string, email?: string, password?: string, displayName?: string): Promise<User>;
}