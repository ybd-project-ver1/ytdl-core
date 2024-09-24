const SIGNATURE_TIMESTAMP_REGEX = /signatureTimestamp:(\d+)/g;

class Signature {
    public static getSignatureTimestamp(body: string): string {
        const MATCH = body.match(SIGNATURE_TIMESTAMP_REGEX);

        if (MATCH) {
            return MATCH[0].split(':')[1];
        }

        return '0';
    }
}

export { Signature };
