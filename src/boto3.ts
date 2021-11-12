import { window, Progress} from 'vscode';
import { getPythonPath, exec } from './utils';
import { installPackage } from './pip';



export async function getBoto3Version(): Promise<string> {
    try {
        return (await exec(`${getPythonPath()} -c "import boto3; print(boto3.__version__)"`)).stdout;
    } catch {
        return '';
    }
}

export async function getOrInstallBoto3Version(progress: Progress<unknown>): Promise<string> {
    progress.report({ message: 'Getting boto3 version' });
    const boto3Version = await getBoto3Version();
    if (boto3Version) {
        return boto3Version;
    }

    const doInstall = await window.showErrorMessage(
        'boto3 is not installed',
        'Install boto3'
    );
    if (!doInstall) { return ""; }
    progress.report({ message: 'Installing boto3' });
    await installPackage('boto3');
    return await getBoto3Version();
}