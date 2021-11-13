import { window, Progress } from 'vscode';
import * as pip from './installers/pip';
import { getPythonPath } from './pythonPath';
import exec from './exec';
import * as poetry from './installers/poetry';



export async function getBoto3Version(): Promise<string> {
    try {
        return (await exec(`${getPythonPath()} -c "import boto3; print(boto3.__version__)"`)).stdout;
    } catch (e) {
        return '';
    }
}

export async function getOrInstallBoto3Version(progress?: Progress<unknown>): Promise<string> {
    if (progress) { progress.report({ message: 'Getting boto3 version' }); }
    const boto3Version = await getBoto3Version();
    if (boto3Version) {
        return boto3Version;
    }

    const actions = [
        ...(poetry.isPresent() ? ['Install with Poetry'] : []),
        'Install with Pip',
    ];

    const action = await window.showErrorMessage(
        `boto3 is not installed in ${getPythonPath()}!`,
        ...actions,
    );
    if (!action) { return ""; }

    if (action === 'Install with Poetry') {
        if (progress) { progress.report({ message: 'Installing boto3 with Poetry' }); }
        await poetry.installPackage('boto3', undefined, [], false);
    }

    if (action === 'Install with Pip') {
        if (progress) { progress.report({ message: 'Installing boto3' }); }
        await pip.installPackage('boto3');
    }

    return await getBoto3Version();
}


export async function updateBoto3Version(version: string, progress?: Progress<unknown>): Promise<string> {
    if (progress) { progress.report({ message: 'Please update boto3 or dismiss...' }); }
    const actions = [
        ...(poetry.isPresent() ? ['Update with Poetry'] : []),
        'Update with Pip',
    ];

    const action = await window.showInformationMessage(
        `New boto3 version ${version} available!`,
        ...actions,
    );
    if (!action) { return ""; }

    if (action === 'Update with Poetry') {
        if (progress) { progress.report({ message: 'Updating boto3 with Poetry' }); }
        await poetry.installPackage('boto3', version, [], false);
    }

    if (action === 'Install with Pip') {
        if (progress) { progress.report({ message: 'Updating boto3' }); }
        await pip.installPackage('boto3');
    }
    return version;
}