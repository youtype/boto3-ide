import * as path from 'path';
import * as fs from 'fs';
import { BaseInstaller } from './base';


export default class PipenvInstaller extends BaseInstaller {
    name = "pipenv";
    description = 'Updates pyproject.toml and Pipfile.lock. Make sure you use https://pypi.org/simple source.';

    async installPackage(name: string, version: string, extras: string[], dev: boolean): Promise<void> {
        const packageName = this.buildPackageName(name, extras);
        const versionConstraint = version ? this.buildVersionConstraint(version) : '';
        const command = version ? 'install' : 'update';
        const installerCmd = await this.getInstallerCmd();
        const cmd = `${installerCmd} ${command} ${dev ? '--dev' : ''} "${packageName}${versionConstraint}"`;
        await this.exec(cmd);
    }

    async removePackage(name: string, dev: boolean): Promise<void> {
        const installerCmd = await this.getInstallerCmd();
        const cmd = `${installerCmd} uninstall -n ${dev ? '--dev' : ''} "${name}"`;
        await this.exec(cmd);
    }

    getLockFileName(): string {
        return 'Pipfile.lock';
    }
}
