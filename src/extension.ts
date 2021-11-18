import { ExtensionContext, commands } from 'vscode'
import updateHandler from './commands/update'
import modifyHandler from './commands/modify'
import docsHandler from './commands/docs'
import autodiscoverHandler from './commands/autodiscover'
import quickstartHandler from './commands/quickstart'
import installerHandler from './commands/installer'
import welcomeHandler from './commands/welcome'

export async function activate(context: ExtensionContext) {
  console.log('boto3-ide is now active!')

  context.subscriptions.push(
    commands.registerCommand('boto3-ide.quickstart', async () => {
      return await quickstartHandler(context)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('boto3-ide.modify', async () => {
      return await modifyHandler(context)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('boto3-ide.update', async () => {
      return await updateHandler(context)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('boto3-ide.docs', async () => {
      return await docsHandler(context)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('boto3-ide.autodiscover', async () => {
      return await autodiscoverHandler(context)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('boto3-ide.installer', async () => {
      return await installerHandler(context)
    })
  )

  await welcomeHandler(context)
}

export function deactivate() {}
