import exec from '../exec';
import PipPackage from './pipPackage';

export abstract class BaseInstaller {
    pythonPath: string;
    workDir: string;

    constructor(pythonPath: string, workDir: string) {
        this.pythonPath = pythonPath;
        this.workDir = workDir;
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

    isInUse(): boolean {
        return false;
    }

    lockFileExists(): boolean {
        return false;
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
        console.log(output.split(/\r?\n/));
        return (
            output
                .split(/\r?\n/)
                .map(x => this.parsePackageData(x))
        );
    }

    async exec(cmd: string): Promise<{ stdout: string, stderr: string }> {
        console.log(cmd);
        const oldCwd = process.cwd();
        process.chdir(this.workDir);
        const result = await exec(cmd);
        process.chdir(oldCwd);
        return result;
    }

    abstract installPackage(name: string, version: string, extras: string[], dev: boolean): Promise<void>;
    abstract removePackage(name: string, dev: boolean): Promise<void>;
}