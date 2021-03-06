import { window, ProgressLocation, Progress, ExtensionContext, workspace } from 'vscode'
import { servicePackages } from './servicePackages'
import { Boto3StubsPackage, PypiPackage } from './pypi'
import { createSmartInstaller } from './installers/smart'

export function pluralize(count: number, singular: string, plural: string = '') {
  if (count === 1) {
    return `${count} ${singular}`
  }
  const pluralText = plural || `${singular}s`
  return `${count} ${pluralText}`
}

export async function showProgress(
  message: string,
  progressCallback: (progress: Progress<unknown>) => Promise<void>
): Promise<void> {
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: 'AWS boto3 IDE',
      cancellable: true
    },
    async (progress) => {
      progress.report({ message })
      await progressCallback(progress)
    }
  )
}

export async function getServicePackages(
  context: ExtensionContext,
  recommended: string[] = []
): Promise<PypiPackage[]> {
  const smartInstaller = await createSmartInstaller(context)
  const boto3Version = await smartInstaller.getBoto3Version()
  const installedPackages = await smartInstaller.pip.listPackages()

  const masterPackage = new Boto3StubsPackage()
  masterPackage.version = boto3Version
  const masterPackageData = installedPackages.find((x) => x.name === masterPackage.moduleName)
  if (masterPackageData) {
    masterPackage.installed = true
    masterPackage.version = masterPackageData.version
  }

  servicePackages.forEach((sp) => {
    const installedPackage = installedPackages.find((x) => x.name === sp.moduleName)
    sp.installed = installedPackage ? true : false
    sp.version = installedPackage ? installedPackage.version : boto3Version
    sp.recommended = sp.isMaster || recommended.includes(sp.getExtraName())
  })
  servicePackages.sort((a, b) => b.downloads - a.downloads)
  servicePackages.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
  servicePackages.sort((a, b) => (b.installed ? 1 : 0) - (a.installed ? 1 : 0))
  return [masterPackage, ...servicePackages]
}

export function getWorkDirs(): string[] {
  if (workspace.workspaceFolders?.length) {
    return [...workspace.workspaceFolders.map((i) => i.uri.fsPath), process.cwd()]
  }
  return [process.cwd()]
}
