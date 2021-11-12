import { getPythonPath, exec } from './utils';

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