import { LogLevel } from './LogLevel';

export class LogEntry {
    // Public Properties
    message = '';
    level: LogLevel = LogLevel.Debug;
    extraInfo: any[] = [];
    date = new Date();

    buildLogString(): string {
        let ret: string = this.date + ' - ';

        ret += 'Type: ' + this.level;
        ret += ' - Message: ' + this.message;
        if (this.extraInfo.length) {
            ret += ' - Extra Info: ' + this.formatParams(this.extraInfo);
        }

        return ret;
    }

    private formatParams(params: any[]): string {
        let ret: string = params.join(',');

        // Is there at least one object in the array?
        if (params.some(p => typeof p === 'object')) {
            let ret1 = '';

            try {
              // Build comma-delimited string
              for (const item of params) {
                  ret1 += JSON.stringify(item, this.getCircularReplacer()) + ',';
              }
              ret = ret1;
            } catch (e) {
            }
        }

        return ret;
    }

    private getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    }
}
