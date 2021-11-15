import exec from '../exec';
import PipPackage from './pipPackage';
import * as path from 'path';
import * as fs from 'fs';
import { workspace } from "vscode";

export abstract class BaseInstaller {
    abstract name: string;
    pythonPath: string;
    workDir: string;
    installerCmd: string;

    constructor(pythonPath: string, workDir: string) {
        this.pythonPath = pythonPath;
        this.workDir = workDir;
        this.installerCmd = "";
    }

    async getInstallerCmd(): Promise<string> {
        if (this.installerCmd) { return this.installerCmd; }
        const commands: string[] = [
            `${this.pythonPath} -m ${this.name}`,
            workspace.getConfiguration('python').get('defaultInterpreterPath')
                ? `${workspace.getConfiguration('python').get('defaultInterpreterPath')} -m ${this.name}`
                : '',
            workspace.getConfiguration('python').get('pythonPath')
                ? `${workspace.getConfiguration('python').get('pythonPath')} -m ${this.name}`
                : '',
            workspace.getConfiguration('python').get(`${this.name}Path`) || ''
        ];
        for (const command of commands) {
            if (!command) { continue; }
            try {
                await this.exec(command);
                this.installerCmd = command;
                return this.installerCmd;
            } catch (e) {
                console.log(`${command} - failed with ${e}`);
            }
        }
        this.installerCmd = `python -m ${this.name}`;
        return this.installerCmd;
    }

    parsePackageData(s: string): PipPackage {
        if (s.includes('==')) {
            return new PipPackage(
                s.split('==')[0],
                s.split('==')[1]
            );
        }
        return new PipPackage(s.split('@')[0].trim(), '');
    }

    getLockFileName(): string {
        return '';
    }

    isInUse(): boolean {
        if (!this.lockFileExists()) { return false; }

        const lockFileName = this.getLockFileName();
        const lockFilePath = path.join(this.workDir, lockFileName);

        const data = fs.readFileSync(lockFilePath, { encoding: 'utf-8' });
        if (data.includes('"mypy-boto3')) { return true; }
        if (data.includes('"boto3-stubs"')) { return true; }
        return false;
    }

    lockFileExists(): boolean {
        const lockFileName = this.getLockFileName();
        if (!lockFileName.length) { return false; }
        const lockFilePath = path.join(this.workDir, lockFileName);
        return fs.existsSync(lockFilePath);
    }

    buildVersionConstraint(version: string) {
        if (!version.length) { return ''; }
        if (/^[=><]/.test(version)) { return version; }
        return `==${version}`;
    }

    buildPackageName(name: string, extras: string[]): string {
        if (!extras.length) { return name; }
        return `${name}[${extras.join(',')}]`;
    }

    async listPackages(): Promise<PipPackage[]> {
        const output = (await exec(`${this.pythonPath} -m pip freeze`)).stdout;
        return (
            output
                .split(/\r?\n/)
                .map(x => this.parsePackageData(x))
        );
    }

    async exec(cmd: string): Promise<{ stdout: string, stderr: string }> {
        console.log(`Exec: ${cmd}`);
        const oldCwd = process.cwd();
        process.chdir(this.workDir);
        const result = await exec(cmd);
        process.chdir(oldCwd);
        return result;
    }

    abstract installPackage(name: string, version: string, extras: string[], dev: boolean): Promise<void>;
    abstract removePackage(name: string, dev: boolean): Promise<void>;
}