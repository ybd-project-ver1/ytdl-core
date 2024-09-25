import { VERSION } from './Constants';

const OUTPUT_CONTROL_CHARACTER = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',

    reset: '\x1b[0m',
};

export class Logger {
    static logDisplay: Array<'debug' | 'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];

    private static replaceColorTags(message: string): string {
        try {
            message = message.replace(/<magenta>/g, OUTPUT_CONTROL_CHARACTER.magenta);
            message = message.replace(/<\/magenta>/g, OUTPUT_CONTROL_CHARACTER.reset);
            message = message.replace(/<debug>/g, OUTPUT_CONTROL_CHARACTER.magenta);
            message = message.replace(/<\/debug>/g, OUTPUT_CONTROL_CHARACTER.reset);

            message = message.replace(/<blue>/g, OUTPUT_CONTROL_CHARACTER.blue);
            message = message.replace(/<\/blue>/g, OUTPUT_CONTROL_CHARACTER.reset);
            message = message.replace(/<info>/g, OUTPUT_CONTROL_CHARACTER.blue);
            message = message.replace(/<\/info>/g, OUTPUT_CONTROL_CHARACTER.reset);

            message = message.replace(/<green>/g, OUTPUT_CONTROL_CHARACTER.green);
            message = message.replace(/<\/green>/g, OUTPUT_CONTROL_CHARACTER.reset);
            message = message.replace(/<success>/g, OUTPUT_CONTROL_CHARACTER.green);
            message = message.replace(/<\/success>/g, OUTPUT_CONTROL_CHARACTER.reset);

            message = message.replace(/<yellow>/g, OUTPUT_CONTROL_CHARACTER.yellow);
            message = message.replace(/<\/yellow>/g, OUTPUT_CONTROL_CHARACTER.reset);
            message = message.replace(/<warning>/g, OUTPUT_CONTROL_CHARACTER.yellow);
            message = message.replace(/<\/warning>/g, OUTPUT_CONTROL_CHARACTER.reset);

            message = message.replace(/<red>/g, OUTPUT_CONTROL_CHARACTER.red);
            message = message.replace(/<\/red>/g, OUTPUT_CONTROL_CHARACTER.reset);
            message = message.replace(/<error>/g, OUTPUT_CONTROL_CHARACTER.red);
            message = message.replace(/<\/error>/g, OUTPUT_CONTROL_CHARACTER.reset);
        } catch {}

        return message;
    }

    private static convertMessage(message: string): string {
        return this.replaceColorTags(message);
    }

    private static convertMessages(messages: Array<any>): Array<any> {
        return messages.map((m) => this.replaceColorTags(m));
    }

    public static debug(...messages: Array<any>) {
        if (VERSION.includes('dev') || VERSION.includes('beta') || VERSION.includes('test') || this.logDisplay.includes('debug')) {
            console.log(this.convertMessage('<debug>[  DEBUG  ]:</debug>'), ...this.convertMessages(messages));
        }
    }

    public static info(...messages: Array<any>) {
        if (this.logDisplay.includes('info')) {
            console.info(this.convertMessage('<info>[  INFO!  ]:</info>'), ...this.convertMessages(messages));
        }
    }

    public static success(...messages: Array<any>) {
        if (this.logDisplay.includes('success')) {
            console.log(this.convertMessage('<success>[ SUCCESS ]:</success>'), ...this.convertMessages(messages));
        }
    }

    public static warning(...messages: Array<any>) {
        if (this.logDisplay.includes('warning')) {
            console.warn(this.convertMessage('<warning>[ WARNING ]:</warning>'), ...this.convertMessages(messages));
        }
    }

    public static error(...messages: Array<any>) {
        if (this.logDisplay.includes('error')) {
            console.error(this.convertMessage('<error>[  ERROR  ]:</error>'), ...this.convertMessages(messages));
        }
    }
}
