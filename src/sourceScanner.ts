import { workspace, Uri } from 'vscode';
import * as fs from 'fs';


const SERVICE_RE = /(boto3|session)\.(client|resource)\(\s*['"]+(\S+)['"]+\s*\)/g;

export default class SourceScanner {
    async findPythonFiles(): Promise<Uri[]> {
        const exclude = [
            ...Object.keys(await workspace.getConfiguration('search', null).get('exclude') || {}),
            ...Object.keys(await workspace.getConfiguration('files', null).get('exclude') || {}),
            '**/.venv/**',
            '**/typings/**',
            '**/tests/**',
        ].join(',');
        return await workspace.findFiles('**/*.py', `{${exclude}}`);
    }

    async readFile(file: Uri): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(file.fsPath, { encoding: 'utf-8' }, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }

    async findServices(file: Uri): Promise<Set<string>> {
        const text = await this.readFile(file);
        const result: Set<string> = new Set();
        let match;
        SERVICE_RE.lastIndex = 0;
        while (match = SERVICE_RE.exec(text)) {
            const serviceName = (match.pop() || '');
            SERVICE_RE.lastIndex = match.index + 1;
            result.add(serviceName);
        };
        return result;
    }
}