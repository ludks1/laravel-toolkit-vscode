const vscode = require("vscode");
const { executeArtisanCommand, showInputBox } = require("../utils/helpers");

/**
 * Additional Laravel Commands
 */

/**
 * Create a Factory
 */
async function makeFactory() {
  const factoryName = await showInputBox({
    prompt: "Factory name (e.g: ProductFactory)",
    placeHolder: "ProductFactory",
  });

  if (!factoryName) return;

  try {
    await executeArtisanCommand(`make:factory ${factoryName}`);
    vscode.window.showInformationMessage(
      `✅ Factory ${factoryName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Resource
 */
async function makeResource() {
  const resourceName = await showInputBox({
    prompt: "Resource name (e.g: ProductResource)",
    placeHolder: "ProductResource",
  });

  if (!resourceName) return;

  const isCollection = await vscode.window.showQuickPick(
    [
      { label: "Simple Resource", value: false },
      { label: "Resource Collection", value: true },
    ],
    { placeHolder: "Resource type" }
  );

  if (isCollection === undefined) return;

  const command = isCollection.value
    ? `make:resource ${resourceName} --collection`
    : `make:resource ${resourceName}`;

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(
      `✅ Resource ${resourceName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Policy
 */
async function makePolicy() {
  const policyName = await showInputBox({
    prompt: "Policy name (e.g: ProductPolicy)",
    placeHolder: "ProductPolicy",
  });

  if (!policyName) return;

  try {
    await executeArtisanCommand(`make:policy ${policyName}`);
    vscode.window.showInformationMessage(
      `✅ Policy ${policyName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create an Event
 */
async function makeEvent() {
  const eventName = await showInputBox({
    prompt: "Event name (e.g: OrderShipped)",
    placeHolder: "OrderShipped",
  });

  if (!eventName) return;

  try {
    await executeArtisanCommand(`make:event ${eventName}`);
    vscode.window.showInformationMessage(
      `✅ Event ${eventName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Listener
 */
async function makeListener() {
  const listenerName = await showInputBox({
    prompt: "Listener name (e.g: SendShipmentNotification)",
    placeHolder: "SendShipmentNotification",
  });

  if (!listenerName) return;

  const eventName = await showInputBox({
    prompt: "Associated Event name (optional)",
    placeHolder: "OrderShipped",
  });

  const command = eventName
    ? `make:listener ${listenerName} --event=${eventName}`
    : `make:listener ${listenerName}`;

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(
      `✅ Listener ${listenerName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Job
 */
async function makeJob() {
  const jobName = await showInputBox({
    prompt: "Job name (e.g: ProcessPodcast)",
    placeHolder: "ProcessPodcast",
  });

  if (!jobName) return;

  try {
    await executeArtisanCommand(`make:job ${jobName}`);
    vscode.window.showInformationMessage(
      `✅ Job ${jobName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Mail
 */
async function makeMail() {
  const mailName = await showInputBox({
    prompt: "Mail name (e.g: OrderShipped)",
    placeHolder: "OrderShipped",
  });

  if (!mailName) return;

  try {
    await executeArtisanCommand(`make:mail ${mailName}`);
    vscode.window.showInformationMessage(
      `✅ Mail ${mailName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Notification
 */
async function makeNotification() {
  const notificationName = await showInputBox({
    prompt: "Notification name (e.g: InvoicePaid)",
    placeHolder: "InvoicePaid",
  });

  if (!notificationName) return;

  try {
    await executeArtisanCommand(`make:notification ${notificationName}`);
    vscode.window.showInformationMessage(
      `✅ Notification ${notificationName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Command
 */
async function makeCommand() {
  const commandName = await showInputBox({
    prompt: "Command name (e.g: SendEmails)",
    placeHolder: "SendEmails",
  });

  if (!commandName) return;

  try {
    await executeArtisanCommand(`make:command ${commandName}`);
    vscode.window.showInformationMessage(
      `✅ Command ${commandName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Create a Rule
 */
async function makeRule() {
  const ruleName = await showInputBox({
    prompt: "Rule name (e.g: Uppercase)",
    placeHolder: "Uppercase",
  });

  if (!ruleName) return;

  try {
    await executeArtisanCommand(`make:rule ${ruleName}`);
    vscode.window.showInformationMessage(
      `✅ Rule ${ruleName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

module.exports = {
  makeFactory,
  makeResource,
  makePolicy,
  makeEvent,
  makeListener,
  makeJob,
  makeMail,
  makeNotification,
  makeCommand,
  makeRule,
};
