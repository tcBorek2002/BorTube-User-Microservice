export class NotFoundError extends Error {
    code: number;

    constructor(code: number, message: string) {
        super(message);
        this.name = 'NotFoundError';
        this.code = code;
    }
}