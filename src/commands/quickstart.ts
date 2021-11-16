import { getServicePackages } from "../utils";
import { workspace, Uri, window, env, ExtensionContext } from "vscode";
import { getOrInstallBoto3Version } from '../boto3';
import modifyHandler from './modify';
import updateHandler from './update';
import autodiscoverhandler from './autodiscover';


export default async function handle(context: ExtensionContext): Promise<void> {
    const boto3Version = await getOrInstallBoto3Version(context);
    if (!boto3Version) { return; }

    const servicePackages = await getServicePackages(context);
    const pylanceEnabled = workspace.getConfiguration('python').get('languageServer') === 'Pylance';
    const typeCheckingEnabled = workspace.getConfiguration('python').get('analysis.typeCheckingMode') !== 'off';
    const autoCompleteEnabled = servicePackages.filter(x => x.installed && x.getExtraName()).length > 0;
    const messageParts = [
        `${pylanceEnabled ? '✓' : '✗'} Pylance`,
        `${autoCompleteEnabled ? '✓' : '✗'} IntelliSense`,
        `${typeCheckingEnabled ? '✓' : '✗'} Type checking`,
    ];
    const actions = [];
    if (!pylanceEnabled) { actions.push('Enable Pylance'); }
    if (!typeCheckingEnabled) { actions.push('Enable Type Checking'); }
    actions.push('Modify services', 'Auto-discover services', 'Update');
    const action = await window.showInformationMessage(messageParts.join(' | '), ...actions);
    if (action === 'Enable Pylance' || action === 'Enable Type Checking') {
        env.openExternal(Uri.parse('https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance'));
    }
    if (action === 'Modify services') {
        await modifyHandler(context);
    }
    if (action === 'Auto-discover services') {
        await autodiscoverhandler(context);
    }
    if (action === 'Update') {
        await updateHandler(context);
    }
}