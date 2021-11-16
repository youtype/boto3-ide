import PoetryInstaller from './poetry';
import PipInstaller from './pip';
import { PypiPackage } from '../pypi';
import { window, extensions, workspace, ExtensionContext, QuickPickItem } from 'vscode';
import PipPackage from './pipPackage';
import PipenvInstaller from './pipenv';
import { BaseInstaller } from './base';
import { showProgress } from '../utils';

const INSTALLER_KEY: string = 'installer';

export class InstallerItem implements QuickPickItem {
    label: string;
    picked: boolean;

    constructor(public installer: BaseInstaller, picked: boolean) {
        this.label = installer.name;
        this.picked = picked;
    }
}

export class SmartInstaller {
    pythonPaths: string[];
    mainPythonPath: string;
    workDir: string;
    poetry: PoetryInstaller;
    pip: PipInstaller;
    pipenv: PipenvInstaller;
    installedPackages: PipPackage[];
    context: ExtensionContext;

    constructor(pythonPaths: string[], context: ExtensionContext) {
        this.pythonPaths = pythonPaths;
        this.context = context;
        this.mainPythonPath = pythonPaths[0];
        this.workDir = this.getWorkDir();
        this.poetry = new PoetryInstaller(this.pythonPaths, this.workDir);
        this.pip = new PipInstaller(this.pythonPaths, this.workDir);
        this.pipenv = new PipenvInstaller(this.pythonPaths, this.workDir);
        this.installedPackages = [];
    }

    getInstallers(): BaseInstaller[] {
        let result = [];
        if (this.poetry.lockFileExists()) {
            result.push(this.poetry);
        }
        if (this.pipenv.lockFileExists()) {
            result.push(this.pipenv);
        }
        result.push(this.pip);
        return result;
    }

    async getInstaller(): Promise<BaseInstaller | undefined> {
        const installers = this.getInstallers();
        if (!installers.length) { return undefined; }
        if (installers.length === 1) { return installers[0]; }
        const selectedInstallerName: string = this.context.workspaceState.get(INSTALLER_KEY) || '';
        let selectedInstaller = installers.find(x => x.name === selectedInstallerName);
        if (selectedInstaller) { return selectedInstaller; }

        selectedInstaller = await this.selectInstaller(installers);
        if (!selectedInstaller) { return; }
        return selectedInstaller;
    }

    async selectInstaller(installers: BaseInstaller[]) {
        const quickPick = window.createQuickPick<InstallerItem>();
        quickPick.placeholder = 'Select installer';
        const savedInstallerName = this.context.workspaceState.get(INSTALLER_KEY) || "";
        quickPick.items = installers.map(x => new InstallerItem(x, x.name === savedInstallerName));
        quickPick.show();

        const selectedInstaller: BaseInstaller | null = await new Promise(resolve => {
            quickPick.onDidHide(() => {
                resolve(null);
                quickPick.dispose();
            });
            quickPick.onDidAccept(async () => {
                const result = quickPick.selectedItems[0];
                resolve(result.installer);
                quickPick.dispose();
            });
        });

        if (selectedInstaller) {
            this.context.workspaceState.update(INSTALLER_KEY, selectedInstaller.name);
            return selectedInstaller;
        }
    }

    async installPackages(installPackages: PypiPackage[], removePackages: PypiPackage[], version: string, dev: boolean): Promise<boolean> {
        const installer = await this.getInstaller();
        if (!installer) { return false; }

        await this._installPackages(installer, installPackages, removePackages, version, dev);
        this.resetListPackages();
        return true;
    }

    async install(name: string, version: string, dev: boolean = false) {
        const installer = await this.getInstaller();
        if (!installer) { return; }

        await showProgress(
            `Installing ${name} ${version} with ${installer.name}...`,
            async () => {
                await installer.installPackage(name, version, [], dev);
            }
        );
        this.resetListPackages();
    }

    async _installPackages(installer: BaseInstaller, packages: PypiPackage[], removePackages: PypiPackage[], version: string, dev: boolean) {
        const masterPackage = packages.find(x => !x.getExtraName().length);
        const extraPackages = packages.filter(x => x.getExtraName());

        await showProgress(
            `Installing packages...`,
            async progress => {
                if (masterPackage) {
                    const extras = extraPackages.map(x => x.getExtraName());
                    progress.report({ message: `Installing ${extraPackages.length} services with ${installer.name}...` });
                    await installer.installPackage(masterPackage.moduleName, version, extras, dev);
                } else {
                    for (const extraPackage of extraPackages) {
                        progress.report({ message: `Installing ${extraPackage.getLabel()} service with ${installer.name}...` });
                        await installer.installPackage(extraPackage.moduleName, `<=${version}`, [], dev);
                    }
                }
                for (const removePackage of removePackages) {
                    progress.report({ message: `Removing ${removePackage.getLabel()} with ${installer.name}...` });
                    await installer.removePackage(removePackage.moduleName, dev);
                }
            }
        );
    }

    async listPackages(): Promise<PipPackage[]> {
        if (this.installedPackages.length) { return this.installedPackages; }
        this.installedPackages = await this.pip.listPackages();
        return this.installedPackages;
    }

    resetListPackages(): void {
        this.installedPackages = [];
    }

    async getBoto3Version(): Promise<string> {
        try {
            return (await this.pip.exec(`${this.mainPythonPath} -c "import boto3; print(boto3.__version__)"`)).stdout.trim();
        } catch (e) {
            console.error(e);
        }
        return "";
    }

    getWorkDir(): string {
        if (workspace.workspaceFolders?.length) {
            return workspace.workspaceFolders[0].uri.fsPath;
        }
        return process.cwd();
    }
}

async function getPythonPaths(): Promise<string[]> {
    const result: string[] = [];
    const extension = extensions.getExtension('ms-python.python')!;
    if (extension) {
        if (!extension.isActive) {
            await showProgress(
                `Waiting for Python extension to activate...`,
                async () => {
                    await extension.activate();
                }
            );
        }
        const executionDetails = extension.exports.settings.getExecutionDetails();
        if (executionDetails?.execCommand.length) {
            result.push(executionDetails.execCommand[0]);
        }
    }

    const newPath: string = workspace.getConfiguration('python').get('defaultInterpreterPath') || '';
    if (newPath.length && !result.includes(newPath)) { result.push(newPath); }

    const oldPath: string = workspace.getConfiguration('python').get('pythonPath') || '';
    if (oldPath.length && !result.includes(oldPath)) { result.push(oldPath); }

    const failbackPath = 'python';
    if (!result.includes(failbackPath)) { result.push(failbackPath); }
    return result;
}

export async function createSmartInstaller(context: ExtensionContext): Promise<SmartInstaller> {
    return new SmartInstaller(await getPythonPaths(), context);
}
