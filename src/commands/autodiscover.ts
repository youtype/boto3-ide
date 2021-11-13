import { showProgress, getServicePackages } from "../utils";
import { workspace, Uri } from "vscode";
import * as fs from "fs";
import * as path from "path";
import { resetPythonPath } from '../pythonPath';
import { getOrInstallBoto3Version } from '../boto3';
import modifyPackages from "../modifyPackages";


const SERVICE_RE = /(boto3|session)\.(client|resource)\(\s*['"]+(\S+)['"]+\s*\)/g;

function findAllServices(text: string): string[] {
    const result = [];
    let match;
    SERVICE_RE.lastIndex = 0;
    while (match = SERVICE_RE.exec(text)) {
        const serviceName = (match.pop() || '');
        SERVICE_RE.lastIndex = match.index + 1;
        result.push(serviceName);
    };
    return result;
}

async function findPythonFiles(): Promise<Uri[]> {
    const exclude = [
        ...Object.keys(await workspace.getConfiguration('search', null).get('exclude') || {}),
        ...Object.keys(await workspace.getConfiguration('files', null).get('exclude') || {}),
        "**/.venv/**",
        "**/typings/**",
        "**/tests/**",
    ].join(',');
    return workspace.findFiles('**/examples/*.py', `{${exclude}}`);
}

export default async function handle(): Promise<void> {
    resetPythonPath();
    showProgress("AWS boto3", async progress => {
        const boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }

        progress.report({ message: `Scanning workspace...` });
        const files = await findPythonFiles();
        progress.report({ message: `Scanning ${files.length} files...` });
        const serviceNamesSet = new Set();
        for (const file of files) {
            const data = fs.readFileSync(file.fsPath, { encoding: 'utf-8' });
            findAllServices(data).forEach(x => serviceNamesSet.add(x));
        }
        const serviceNames = [...serviceNamesSet];
        console.log(serviceNames);
        progress.report({ message: `Found ${serviceNames.length} services in use...` });

        const servicePackages = await getServicePackages();
        servicePackages.forEach(x => {
            x.recommended = serviceNames.includes(x.getExtraName());
        });
        await modifyPackages(servicePackages, progress, boto3Version);
    });
}