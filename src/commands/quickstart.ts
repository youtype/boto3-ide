import { getServicePackages } from '../utils'
import { workspace, Uri, window, env, ExtensionContext } from 'vscode'
import { getOrInstallBoto3Version } from '../boto3'
import modifyHandler from './modify'
import updateHandler from './update'
import autodiscoverhandler from './autodiscover'
import { NAME } from '../constants'

export default async function handle(context: ExtensionContext): Promise<void> {
  const boto3Version = await getOrInstallBoto3Version(context)
  if (!boto3Version) {
    return
  }

  const servicePackages = await getServicePackages(context)
  const pylanceEnabled = workspace.getConfiguration('python').get('languageServer') === 'Pylance'
  const autoCompleteEnabled = servicePackages.find((x) => x.installed && x.isMaster) ? true : false
  const typeCheckingEnabled =
    workspace.getConfiguration('python').get('analysis.typeCheckingMode') !== 'off'
  const messageParts = [
    `${pylanceEnabled ? '✓' : '✗'} Pylance`,
    `${autoCompleteEnabled ? '✓' : '✗'} IntelliSense`,
    `${typeCheckingEnabled ? '✓' : '✗'} Type checking`
  ]
  const actions = []
  if (!pylanceEnabled) {
    actions.push('Enable Pylance')
  }
  if (!typeCheckingEnabled) {
    actions.push('Enable Type Checking')
  }
  actions.push('Install', 'Modify', 'Update')
  const action = await window.showInformationMessage(
    `${NAME}: ${messageParts.join(' | ')}`,
    ...actions
  )
  if (action === 'Enable Pylance' || action === 'Enable Type Checking') {
    env.openExternal(
      Uri.parse('https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance')
    )
  }
  if (action === 'Modify') {
    await modifyHandler(context)
  }
  if (action === 'Install') {
    await autodiscoverhandler(context)
  }
  if (action === 'Update') {
    await updateHandler(context)
  }
}
