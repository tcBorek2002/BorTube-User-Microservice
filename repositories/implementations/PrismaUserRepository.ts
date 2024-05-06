import { User } from "@prisma/client";
import prisma from "../../client";
import { IUserRepository } from "../IUserRepository";


export class PrismaUserRepository implements IUserRepository {
    async authenticateUser(email: string, password: string): Promise<User | null> {
        return await prisma.user.findFirst({
            where: {
                email,
                password
            }
        });
    }
    async findAllUsers(): Promise<User[]> {
        return await prisma.user.findMany();
    }
    async findUserById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({ where: { id } });
    }
    async deleteUserById(id: string): Promise<User> {
        return await prisma.user.delete({ where: { id } });
    }
    async createUser(email: string, password: string, displayName: string): Promise<User> {
        return await prisma.user.create({
            data: {
                email,
                password,
                displayName,
            }
        })

    }
    async updateUser(id: string, email?: string | undefined, password?: string | undefined, displayName?: string | undefined): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data: {
                email,
                password,
                displayName,
            }
        })
    }

}