const IPV6_REGEX = /^(([0-9a-f]{1,4}:)(:[0-9a-f]{1,4}){1,6}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4})|([0-9a-f]{1,4}:){1,7}(([0-9a-f]{1,4})|:))\/(1[0-1]\d|12[0-8]|\d{1,2})$/;

export default class IP {
    static isIPv6(ip: string): boolean {
        return IPV6_REGEX.test(ip);
    }

    static normalizeIP(ip: string): Array<number> {
        const PARTS = ip.split('::').map((part) => part.split(':')),
            PART_START = PARTS[0] || [],
            PART_END = PARTS[1] || [],
            FULL_IP = new Array(8).fill(0);

        PART_END.reverse();

        for (let i = 0; i < Math.min(PART_START.length, 8); i++) {
            FULL_IP[i] = parseInt(PART_START[i], 16) || 0;
        }

        for (let i = 0; i < Math.min(PART_END.length, 8); i++) {
            FULL_IP[7 - i] = parseInt(PART_END[i], 16) || 0;
        }

        return FULL_IP;
    }

    static getRandomIPv6(ip: string): string {
        if (!this.isIPv6(ip)) {
            throw new Error('Invalid IPv6 format');
        }

        const [rawAddr, rawMask] = ip.split('/');
        let base10Mask = parseInt(rawMask);

        if (!base10Mask || base10Mask > 128 || base10Mask < 24) {
            throw new Error('Invalid IPv6 subnet');
        }

        const BASE_10_ADDR = this.normalizeIP(rawAddr),
            RANDOM_ADDR = new Array(8).fill(1).map(() => Math.floor(Math.random() * 0xffff)),
            MERGED_ADDR = RANDOM_ADDR.map((randomItem, idx) => {
                const STATIC_BITS = Math.min(base10Mask, 16);

                base10Mask -= STATIC_BITS;

                const MASK = 0xffff - (2 ** (16 - STATIC_BITS) - 1);
                return (BASE_10_ADDR[idx] & MASK) + (randomItem & (MASK ^ 0xffff));
            });

        return MERGED_ADDR.map((x) => x.toString(16)).join(':');
    }
}
