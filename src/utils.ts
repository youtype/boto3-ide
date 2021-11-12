import { workspace, window, ProgressLocation, Progress, QuickPickItem} from 'vscode';
import { exec as _exec } from "child_process";
import { promisify } from "util";
import {servicePackages, ServicePackage} from './servicePaсkages';


export const exec = promisify(_exec);

export function getPythonPath(): string {
    return workspace.getConfiguration('python').get('defaultInterpreterPath') || 'python';
}

export async function getBoto3Version(): Promise<string> {
    try {
        return (await exec(`${getPythonPath()} -c "import boto3; print(boto3.__version__)"`)).stdout;
    } catch {
        return '';
    }
}

export function showProgress(message: string, progressCallback: (progress: Progress<unknown>) => Promise<void>): void {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: message,
        cancellable: true
    }, async progress => {
        await progressCallback(progress);
    });
}


export async function getServicePackages(): Promise<ServicePackage[]> {
    const boto3Version = await getBoto3Version();
    const output = (await exec(`${getPythonPath()} -m pip freeze`)).stdout;
    const installedPackagesData = output.split(/\r?\n/).filter(x => x.startsWith('mypy-boto3-')).map(x => ({
        moduleName: x.split('==')[0],
        version: x.split('==')[1],
    }));
    servicePackages.forEach(sp => {
        const installedPackage = installedPackagesData.find(x => x.moduleName === sp.moduleName);
        sp.installed = installedPackage ? true : false;
        sp.version = installedPackage ? installedPackage.version : boto3Version;
    });
    servicePackages.sort((a, b) => b.downloads - a.downloads);
    servicePackages.sort((a, b) => (b.installed ? 1 : 0) - (a.installed ? 1 : 0));
    return servicePackages;
}

export class ServicePackageItem implements QuickPickItem {
    label: string;
    detail: string;
    picked: boolean;
	
    constructor(public servicePackage: ServicePackage, picked: boolean) {
        this.label = servicePackage.getLabel();
        this.detail = servicePackage.getDescription();
        this.picked = picked;
	}
}