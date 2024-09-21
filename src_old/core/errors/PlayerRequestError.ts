export default class PlayerRequestError<T = unknown> extends Error {
    response: T | null;

    constructor(message: string) {
        super(message);
        this.response = null;
    }
}
