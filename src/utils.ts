import { window, ProgressLocation, Progress, QuickPickItem } from 'vscode';
import { servicePackages } from './servicePaсkages';
import { Boto3StubsPackage, PypiPackage } from './pypi';
import { getBoto3Version } from './boto3';
import { listPackages } from './installers/pip';

export function showProgress(message: string, progressCallback: (progress: Progress<unknown>) => Promise<void>): void {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: message,
        cancellable: true
    }, async progress => {
        await progressCallback(progress);
    });
}


export async function getServicePackages(recommended: string[] = []): Promise<PypiPackage[]> {
    const boto3Version = await getBoto3Version();
    const installedPackages = await listPackages();

    const masterPackage = new Boto3StubsPackage();
    masterPackage.version = boto3Version;
    const masterPackageData = installedPackages.find(x => x.name === masterPackage.moduleName);
    if (masterPackageData) {
        masterPackage.installed = true;
        masterPackage.version = masterPackageData.version;
    }

    servicePackages.forEach(sp => {
        const installedPackage = installedPackages.find(x => x.name === sp.moduleName);
        sp.installed = installedPackage ? true : false;
        sp.version = installedPackage ? installedPackage.version : boto3Version;
        sp.recommended = !sp.getExtraName().length || recommended.includes(sp.getExtraName());
    });
    servicePackages.sort((a, b) => b.downloads - a.downloads);
    servicePackages.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    servicePackages.sort((a, b) => (b.installed ? 1 : 0) - (a.installed ? 1 : 0));
    return [
        masterPackage,
        ...servicePackages,
    ];
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