import { window, Progress } from 'vscode';
import { getPythonPath } from './pythonPath';
import SmartInstaller from './installers/smart';


export async function getOrInstallBoto3Version(progress?: Progress<unknown>): Promise<string> {
    if (progress) { progress.report({ message: 'Getting boto3 version...' }); }
    const smartInstaller = new SmartInstaller(progress);
    const boto3Version = await smartInstaller.getBoto3Version();
    if (boto3Version) {
        return boto3Version;
    }

    const action = await window.showErrorMessage(
        `boto3 is not installed in ${getPythonPath()}!`,
        `Install with ${smartInstaller.getInstallers().map(x => x.name).join(' / ')}`,
    );
    if (!action) { return ""; }


    if (progress) { progress.report({ message: 'Installing boto3...' }); }
    smartInstaller.install("boto3", "", false);

    return await smartInstaller.getBoto3Version();
}


export async function updateBoto3Version(version: string, progress?: Progress<unknown>): Promise<string> {
    if (progress) { progress.report({ message: 'Please update boto3 or dismiss...' }); }

    const smartInstaller = new SmartInstaller(progress);
    const action = await window.showInformationMessage(
        `New boto3 version ${version} available!`,
        `Update with ${smartInstaller.getInstallers().map(x => x.name).join(' / ')}`,
    );
    if (!action) { return ""; }

    if (progress) { progress.report({ message: `Installing boto3 ${version}...` }); }
    smartInstaller.install("boto3", version, false);
    return version;
}