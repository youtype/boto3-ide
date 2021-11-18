import { QuickPickItem } from 'vscode';
import { BaseInstaller } from './installers/base';
import { PypiPackage } from './pypi';

export class InstallerItem implements QuickPickItem {
    label: string;
    description: string;
    detail: string;
    picked: boolean;

    constructor(public installer: BaseInstaller, picked: boolean) {
        this.label = installer.name;
        this.detail = installer.description;
        this.description = picked ? '(selected)' : '';
        this.picked = picked;
    }
}

export class PypiPackageItem implements QuickPickItem {
    label: string;
    description: string;
    detail: string;
    picked: boolean;

    constructor(public pypiPackage: PypiPackage, picked: boolean) {
        this.label = pypiPackage.getLabel().trim();
        this.description = pypiPackage.getDescription().trim();
        this.detail = pypiPackage.getDetail().trim();
        this.picked = picked;
    }
}