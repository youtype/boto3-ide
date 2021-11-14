import { workspace, Uri } from "vscode";


const SERVICE_RE = /(boto3|session)\.(client|resource)\(\s*['"]+(\S+)['"]+\s*\)/g;

export default class SourceScanner {
    async findPythonFiles(): Promise<Uri[]> {
        const exclude = [
            ...Object.keys(await workspace.getConfiguration('search', null).get('exclude') || {}),
            ...Object.keys(await workspace.getConfiguration('files', null).get('exclude') || {}),
            "**/.venv/**",
            "**/typings/**",
            "**/tests/**",
        ].join(',');
        return workspace.findFiles('**/*.py', `{${exclude}}`);
    }

    findServices(text: string): Set<string> {
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