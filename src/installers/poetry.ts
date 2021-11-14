import * as path from 'path';
import * as fs from 'fs';
import { BaseInstaller } from './base';


export default class PoetryInstaller extends BaseInstaller {
    name = "poetry";

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

    getLockFileName(): string {
        return 'poetry.lock';
    }
}
