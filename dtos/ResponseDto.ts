import { ErrorDto } from "./ErrorDto";

export class ResponseDto<T> {
    success: boolean;
    data: T | ErrorDto;

    constructor(success: true, data: T);
    constructor(success: false, data: ErrorDto);
    constructor(success: boolean, data: T | ErrorDto) {
        this.success = success;
        this.data = data;
    }

    static isResponseDto<T>(object: any): object is ResponseDto<T> {
        return 'success' in object && 'data' in object;
    }
}