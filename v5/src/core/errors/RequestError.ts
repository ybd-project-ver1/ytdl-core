export default class RequestError extends Error {
    public statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = 0;
    }
}
