import { workspace, extensions } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getWorkDir(): string {
    if (workspace.workspaceFolders?.length) {
        return workspace.workspaceFolders[0].uri.fsPath;
    }
    return process.cwd();
}

function getNormalizedPath(current: string): string {
    if (path.isAbsolute(current)) { return current; }
    if (path.basename(current) === current) { return current; }
    if (fs.existsSync(current)) { return current; }
    if (workspace.workspaceFolders?.length) {
        return path.join(getWorkDir(), current);
    }
    return current;
}

export function getDefaultPythonPath(): string {
    const newPath: string = workspace.getConfiguration('python').get('defaultInterpreterPath') || '';
    if (newPath.length) { return getNormalizedPath(newPath); }

    const oldPath: string = workspace.getConfiguration('python').get('pythonPath') || '';
    if (oldPath.length) { return getNormalizedPath(oldPath); }

    return "python";
}

export async function getActivePythonPath(): Promise<string> {
    const extension = extensions.getExtension('ms-python.python')!;
    if (!extension.isActive) {
        await extension.activate();
    }
    const executionDetails = extension.exports.settings.getExecutionDetails();
    if (!executionDetails?.execCommand.length) { return "python"; }
    return executionDetails.execCommand[0];
}