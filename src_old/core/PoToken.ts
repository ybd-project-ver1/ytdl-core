import { generate } from 'youtube-po-token-generator';
import { Logger } from '@/utils/Log';

export default class PoToken {
    static async generatePoToken(): Promise<{ poToken: string; visitorData: string }> {
        return new Promise((resolve) => {
            try {
                generate()
                    .then((data: any) => {
                        Logger.success('Successfully generated a poToken.');
                        resolve(data);
                    })
                    .catch((err) => {
                        Logger.error('Failed to generate a poToken.\nDetails: ' + err);
                        resolve({
                            poToken: '',
                            visitorData: '',
                        });
                    });
            } catch (err) {
                Logger.error('Failed to generate a poToken.\nDetails: ' + err);

                resolve({
                    poToken: '',
                    visitorData: '',
                });
            }
        });
    }
}
