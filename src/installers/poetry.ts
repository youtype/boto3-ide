import exec from '../exec';
import { getPythonPath, getWorkDir } from '../pythonPath';
import * as path from 'path';
import * as fs from 'fs';

export function isPresent(): boolean {
    return fs.existsSync(path.join(getWorkDir(), 'poetry.lock'));
}

export async function installPackage(name: string, version?: string, extras: string[] = [], dev: boolean = true): Promise<void> {
    let nameExtras = name;
    if (extras.length) {
        const extrasStr = extras.join(',');
        nameExtras = `${nameExtras}[${extrasStr}]`;
    }
    const versionConstraint = version ? `${(version.startsWith('=') || version.startsWith('<') || version.startsWith('>')) ? '' : '=='}${version}` : '@latest';
    const cmd = `${getPythonPath()} -m poetry add -n ${dev ? '--dev' : ''} "${nameExtras}${versionConstraint}"`;
    console.log(cmd);
    const oldCwd = process.cwd();
    process.chdir(getWorkDir());
    await exec(cmd);
    process.chdir(oldCwd);
}

export async function removePackage(name: string) {
    const cmd = `${getPythonPath()} -m poetry remove -n "${name}"`;
    console.log(cmd);
    const oldCwd = process.cwd();
    process.chdir(getWorkDir());
    await exec(cmd);
    process.chdir(oldCwd);
}
