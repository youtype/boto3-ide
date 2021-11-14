import { showProgress, getServicePackages } from "../utils";
import * as fs from "fs";
import { resetPythonPath } from '../pythonPath';
import { getOrInstallBoto3Version } from '../boto3';
import modifyPackages from "../modifyPackages";
import SourceScanner from "../sourceScanner";

export default async function handle(): Promise<void> {
    resetPythonPath();
    showProgress("AWS boto3", async progress => {
        const boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }
        const sourceScanner = new SourceScanner();

        progress.report({ message: `Scanning workspace...` });
        const files = await sourceScanner.findPythonFiles();
        progress.report({ message: `Scanning ${files.length} files...` });
        const serviceNamesSet: Set<string> = new Set();
        for (const file of files) {
            const data = fs.readFileSync(file.fsPath, { encoding: 'utf-8' });
            sourceScanner.findServices(data).forEach(x => serviceNamesSet.add(x));
        }
        const serviceNames = [...serviceNamesSet];
        progress.report({ message: `Found ${serviceNames.length} services in use...` });

        const servicePackages = await getServicePackages(serviceNames);
        await modifyPackages(servicePackages, progress, boto3Version);
    });
}