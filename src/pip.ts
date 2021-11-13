import exec from './exec';
import { getPythonPath } from './pythonPath';


interface PipPackage {
    name: string;
    version: string;
}

export async function installPackage(name: string, maxVersion?: string, extras: string[] = []): Promise<void> {
    let nameExtras = name;
    if (extras.length) {
        const extrasStr = extras.join(',');
        nameExtras = `${nameExtras}[${extrasStr}]`;
    }
    const versionConstraint = maxVersion ? `<=${maxVersion}` : '';
    await exec(`${getPythonPath()} -m pip install -U "${nameExtras}${versionConstraint}"`);
}

export async function installPackages(names: string[], maxVersion?: string): Promise<void> {
    const versionConstraint = maxVersion ? `<=${maxVersion}` : '';
    const namesJoined = names.map(name => `"${name}${versionConstraint}"`).join(' ');
    await exec(`${getPythonPath()} -m pip install -U ${namesJoined}`);
}

export async function uninstallPackage(...names: string[]): Promise<void> {
    const namesQuoted = names.map(x => `"${x}"`).join(' ');
    await exec(`${getPythonPath()} -m pip uninstall -y ${namesQuoted}`);
}

export async function listPackages(): Promise<PipPackage[]> {
    const output = (await exec(`${getPythonPath()} -m pip freeze`)).stdout;
    return (
        output
            .split(/\r?\n/)
            .filter(x => x.includes('=='))
            .map(x => ({
                name: x.split('==')[0],
                version: x.split('==')[1],
            }))
    );
}