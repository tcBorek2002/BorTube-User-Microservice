import Connection from "rabbitmq-client";
import { IVideoService } from "../IVideoService";
import { ErrorDto } from "../../dtos/ErrorDto";
import { NotFoundError } from "../../errors/NotFoundError";
import { InvalidInputError } from "../../errors/InvalidInputError";
import { InternalServerError } from "../../errors/InternalServerError";

export class RabbitVideoService implements IVideoService {
    private rabbit: Connection;

    constructor(connection: Connection) {
        this.rabbit = connection;
    }

    async deleteVideosByUserId(id: string): Promise<boolean> {
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const res = await rpcClient.send('delete-videos-by-user-id', { id });
        await rpcClient.close()

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            if (error.code == 404) {
                throw new NotFoundError(404, error.message);
            }
            else if (error.code == 400) {
                throw new InvalidInputError(400, error.message);
            }
            else {
                throw new InternalServerError(500, error.message);
            }
        }
        else {
            let deleted: boolean = response.data as boolean;
            return deleted;
        }
    }
}