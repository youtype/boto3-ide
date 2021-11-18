import { ExtensionContext, window } from 'vscode'
import { getServicePackages, pluralize } from '../utils'
import { getOrInstallBoto3Version } from '../boto3'
import { getLatestBoto3Version } from '../pypi'
import { createSmartInstaller } from '../installers/smart'
import { NAME } from '../constants'
import autodiscoverHandler from './autodiscover'

export default async function handle(context: ExtensionContext): Promise<void> {
  let boto3Version = await getOrInstallBoto3Version(context)
  if (!boto3Version) {
    return
  }

  const latestBoto3Version = await getLatestBoto3Version()
  if (latestBoto3Version !== boto3Version) {
    const smartInstaller = await createSmartInstaller(context)
    const action = await window.showInformationMessage(
      `New boto3 version ${latestBoto3Version} available!`,
      `Update with ${smartInstaller
        .getInstallers()
        .map((x) => x.name)
        .join(' / ')}`
    )
    if (!action) {
      return
    }

    await smartInstaller.install('boto3', latestBoto3Version, false)
    boto3Version = latestBoto3Version
  }

  const servicePackages = await getServicePackages(context)
  const installedPackages = servicePackages.filter((x) => x.installed)
  if (!installedPackages.length) {
    const response = await window.showInformationMessage(
      `No ${NAME} packages detected, nothing to update.`,
      'Auto-discover required packages'
    )
    if (response) {
      await autodiscoverHandler(context)
    }
    return
  }

  const smartInstaller = await createSmartInstaller(context)
  const isInstalled = await smartInstaller.installPackages(
    installedPackages,
    [],
    boto3Version,
    true
  )
  if (isInstalled) {
    await window.showInformationMessage(`${pluralize(installedPackages.length, 'package')} updated`)
  }
}
