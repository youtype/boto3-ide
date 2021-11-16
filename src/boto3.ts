import { window, Progress } from 'vscode';
import { createSmartInstaller } from './installers/smart';


export async function getOrInstallBoto3Version(): Promise<string> {
    const smartInstaller = await createSmartInstaller();
    const boto3Version = await smartInstaller.getBoto3Version();
    if (boto3Version) {
        return boto3Version;
    }

    const action = await window.showErrorMessage(
        `boto3 is not installed in ${smartInstaller.mainPythonPath}!`,
        `Install with ${smartInstaller.getInstallers().map(x => x.name).join(' / ')}`,
    );
    if (!action) { return ""; }

    await smartInstaller.install("boto3", "", false);
    return await smartInstaller.getBoto3Version();
}


export async function updateBoto3Version(version: string): Promise<string> {
    const smartInstaller = await createSmartInstaller();
    const action = await window.showInformationMessage(
        `New boto3 version ${version} available!`,
        `Update with ${smartInstaller.getInstallers().map(x => x.name).join(' / ')}`,
    );
    if (!action) { return ""; }

    await smartInstaller.install("boto3", version, false);
    return version;
}