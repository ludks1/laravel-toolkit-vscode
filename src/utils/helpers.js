const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

/**
 * Checks if the current workspace is a Laravel project
 */
function isLaravelProject() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return false;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const artisanPath = path.join(rootPath, "artisan");
  const composerPath = path.join(rootPath, "composer.json");

  return fs.existsSync(artisanPath) && fs.existsSync(composerPath);
}

/**
 * Gets the root path of the Laravel project
 */
function getLaravelRootPath() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return null;
  }
  return workspaceFolders[0].uri.fsPath;
}

/**
 * Executes an Artisan command
 */
function executeArtisanCommand(command, showOutput = true) {
  return new Promise((resolve, reject) => {
    const rootPath = getLaravelRootPath();
    if (!rootPath) {
      reject(new Error("Laravel project not found"));
      return;
    }

    const isWindows = process.platform === "win32";
    const artisanCmd = isWindows
      ? `php artisan ${command}`
      : `./artisan ${command}`;

    const terminal = vscode.window.createTerminal({
      name: "Laravel Artisan",
      cwd: rootPath,
    });

    if (showOutput) {
      terminal.show();
    }

    terminal.sendText(artisanCmd);

    // For non-interactive commands, execute with exec to capture output
    exec(artisanCmd, { cwd: rootPath }, (error, stdout, stderr) => {
      if (error && !error.message.includes("Command not found")) {
        if (showOutput) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Detects the frontend framework used in the project
 */
function detectFrontendFramework() {
  const rootPath = getLaravelRootPath();
  if (!rootPath) {
    return null;
  }

  const packageJsonPath = path.join(rootPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies["@livewire/livewire"] || dependencies["livewire"]) {
      return "livewire";
    }
    if (dependencies["react"] || dependencies["@vitejs/plugin-react"]) {
      return "react";
    }
    if (dependencies["vue"] || dependencies["@vitejs/plugin-vue"]) {
      return "vue";
    }

    return "blade"; // Default
  } catch {
    return "blade";
  }
}

/**
 * Creates a directory if it doesn't exist
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Converts a name to PascalCase format
 */
function toPascalCase(str) {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Converts a name to camelCase format
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a name to kebab-case format
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Converts a name to snake_case format
 */
function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

/**
 * Gets the extension configuration
 */
function getConfig(key) {
  return vscode.workspace.getConfiguration("laravelToolkit").get(key);
}

/**
 * Shows an input box to get user input
 */
async function showInputBox(options) {
  return await vscode.window.showInputBox(options);
}

/**
 * Shows a quick pick for selecting options
 */
async function showQuickPick(items, options) {
  return await vscode.window.showQuickPick(items, options);
}

/**
 * Checks if Vite is configured
 */
function hasViteConfig() {
  const rootPath = getLaravelRootPath();
  if (!rootPath) {
    return false;
  }

  const viteConfigPath = path.join(rootPath, "vite.config.js");
  const viteConfigTsPath = path.join(rootPath, "vite.config.ts");

  return fs.existsSync(viteConfigPath) || fs.existsSync(viteConfigTsPath);
}

/**
 * Gets the Laravel version
 */
function getLaravelVersion() {
  const rootPath = getLaravelRootPath();
  if (!rootPath) {
    return null;
  }

  const composerLockPath = path.join(rootPath, "composer.lock");
  if (!fs.existsSync(composerLockPath)) {
    return null;
  }

  try {
    const composerLock = JSON.parse(fs.readFileSync(composerLockPath, "utf8"));
    const laravelPackage = composerLock.packages?.find(
      (pkg) => pkg.name === "laravel/framework"
    );
    return laravelPackage?.version || null;
  } catch {
    return null;
  }
}

module.exports = {
  isLaravelProject,
  getLaravelRootPath,
  executeArtisanCommand,
  detectFrontendFramework,
  ensureDirectoryExists,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  getConfig,
  showInputBox,
  showQuickPick,
  hasViteConfig,
  getLaravelVersion,
};
