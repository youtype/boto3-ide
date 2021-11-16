import * as https from 'https';

export interface PypiPackage {
    moduleName: string;
    version: string;
    installed: boolean;
    recommended: boolean;

    getShortLabel(): string;
    getLabel(): string;
    getDetail(): string;
    getDescription(): string;
    getExtraName(): string;
    getDocsURL(): string;
}

export class Boto3StubsPackage implements PypiPackage {
    moduleName: string;
    version: string;
    installed: boolean;
    recommended: boolean;

    constructor() {
        this.moduleName = 'boto3-stubs';
        this.version = '';
        this.installed = false;
        this.recommended = true;
    }

    getDescription(): string {
        if (this.installed) { return '(installed)'; }
        if (this.recommended) { return '(recommended)'; }
        return '';
    }
    getDetail(): string {
        return `boto3/botocore IntelliSense and type annotations`;
    }
    getShortLabel(): string {
        return 'boto3';
    }
    getLabel(): string {
        return `boto3 common ${this.version}`;
    }
    getExtraName(): string {
        return '';
    }
    getDocsURL(): string {
        return 'https://vemel.github.io/boto3_stubs_docs/';
    }
}

function getJSON(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    resolve(json);
                } catch (error) {
                    reject(error);
                };
            });

        }).on("error", (error) => {
            reject(error.message);
        });
    });
}

export async function getLatestBoto3Version() {
    const data = await getJSON('https://pypi.org/pypi/boto3/json');
    return data.info.version;
}