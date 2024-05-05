import { User, Video, VideoState } from "@prisma/client";

export interface IUserService {
    getAllUsers(): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    deleteUserById(id: string): Promise<User>;
    createUser(email: string, password: string, displayName: string): Promise<User>;
    updateUser({ id, email, password, displayName }: { id: string; email?: string; password?: string; displayName?: string }): Promise<User>;
}