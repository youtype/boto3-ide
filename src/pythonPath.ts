import { workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let pythonPath = '';

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

export function resetPythonPath(): void {
    pythonPath = '';
}

export function getPythonPath(): string {
    if (pythonPath.length) { return pythonPath; }
    const oldPath: string = workspace.getConfiguration('python').get('pythonPath') || '';
    if (oldPath.length) {
        pythonPath = getNormalizedPath(oldPath);
        return pythonPath;
    }
    const newPath: string = workspace.getConfiguration('python').get('defaultInterpreterPath') || '';
    if (newPath.length) {
        pythonPath = getNormalizedPath(newPath);
        return pythonPath;
    }
    pythonPath = 'python';
    return pythonPath;
}