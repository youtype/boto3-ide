import { PypiPackage } from "./pypi";

export class ServicePackage implements PypiPackage {
    isMaster = false;

    serviceName: string;
    moduleName: string;
    version: string;
    installed: boolean;
    recommended: boolean;
    downloads: number;

    constructor(moduleName: string, serviceName: string, downloads: number = 0) {
        this.serviceName = serviceName;
        this.moduleName = moduleName;
        this.version = '';
        this.installed = false;
        this.recommended = false;
        this.downloads = downloads;
    }

    getDetail(): string {
        return `boto3.client('${this.getExtraName()}') IntelliSense and type annotations`;
    }
    getDescription(): string {
        if (this.installed) { return '(installed)'; }
        if (this.recommended) { return '(recommended)'; }
        return '';
    }
    getShortLabel(): string {
        return this.serviceName;
    }
    getLabel(): string {
        return `${this.serviceName} ${this.version}`;
    }
    getExtraName(): string {
        return this.moduleName.replace('mypy-boto3-', '');
    }
    getDocsURL(): string {
        const linkName = this.moduleName.replace(/-/g, '_');
        return `https://vemel.github.io/boto3_stubs_docs/${linkName}/`;
    }
}
