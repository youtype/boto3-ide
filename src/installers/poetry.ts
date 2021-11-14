import * as path from 'path';
import * as fs from 'fs';
import { BaseInstaller } from './base';


export default class PoetryInstaller extends BaseInstaller {
    async installPackage(name: string, version: string, extras: string[], dev: boolean): Promise<void> {
        const packageName = this.buildPackageName(name, extras);
        const versionConstraint = version ? this.buildVersionConstraint(version) : '@latest';
        const cmd = `${this.pythonPath} -m poetry add -n ${dev ? '--dev' : ''} "${packageName}${versionConstraint}"`;
        await this.exec(cmd);
    }

    async removePackage(name: string, dev: boolean): Promise<void> {
        const cmd = `${this.pythonPath} -m poetry remove -n ${dev ? '--dev' : ''} "${name}"`;
        await this.exec(cmd);
    }

    isInUse(): boolean {
        if (!this.lockFileExists()) { return false; }
        const lockFilePath = path.join(this.workDir, 'poetry.lock');
        const data = fs.readFileSync(lockFilePath, { encoding: 'utf-8' });
        if (data.includes('"mypy-boto3')) { return true; }
        if (data.includes('"boto3-stubs"')) { return true; }
        return false;
    }

    lockFileExists(): boolean {
        return fs.existsSync(path.join(this.workDir, 'poetry.lock'));
    }
}
