export default class UnrecoverableError extends Error {
    public playabilityStatus: string | null;

    constructor(message: string, playabilityStatus: string | null = null) {
        super(message);
        this.playabilityStatus = playabilityStatus;
    }
}