const vscode = require("vscode");
const { LaravelTreeDataProvider } = require("./dashboard/treeProvider");
const { isLaravelProject } = require("./utils/helpers");

// Import Artisan commands
const artisanCommands = require("./commands/artisan");

// Importar generadores avanzados
const { generateModel } = require("./generators/model");
const { generateController } = require("./generators/controller");
const { generateMigration } = require("./generators/migration");

// Importar generadores legacy
const { generateCRUD } = require("./generators/crud");
const {
  generateJSFile,
  setupVite,
  setupJSStructure,
} = require("./generators/assets");
const {
  generateRouteFile,
  generateResourceRoutes,
  listModularRoutes,
  createRouteServiceProvider,
} = require("./generators/routes");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Laravel Toolkit activated!");

  // Check if it's a Laravel project
  if (!isLaravelProject()) {
    vscode.window.showWarningMessage(
      "Laravel Toolkit: No Laravel project detected in current workspace"
    );
  }

  // Crear el Tree Data Provider para el sidebar
  const treeDataProvider = new LaravelTreeDataProvider();
  const treeView = vscode.window.createTreeView("laravelToolkit", {
    treeDataProvider: treeDataProvider,
    showCollapseAll: true,
  });

  context.subscriptions.push(treeView);

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand("laravel-toolkit.refresh", () => {
      treeDataProvider.refresh();
    })
  );

  // ========== ARTISAN COMMANDS ==========
  registerCommand(
    context,
    "laravel-toolkit.makeModel",
    artisanCommands.makeModel
  );
  registerCommand(
    context,
    "laravel-toolkit.makeController",
    artisanCommands.makeController
  );
  registerCommand(
    context,
    "laravel-toolkit.makeMigration",
    artisanCommands.makeMigration
  );
  registerCommand(
    context,
    "laravel-toolkit.makeRequest",
    artisanCommands.makeRequest
  );
  registerCommand(
    context,
    "laravel-toolkit.makeMiddleware",
    artisanCommands.makeMiddleware
  );
  registerCommand(
    context,
    "laravel-toolkit.makeSeeder",
    artisanCommands.makeSeeder
  );
  registerCommand(
    context,
    "laravel-toolkit.routeList",
    artisanCommands.routeList
  );
  registerCommand(context, "laravel-toolkit.migrate", artisanCommands.migrate);
  registerCommand(context, "laravel-toolkit.dbSeed", artisanCommands.dbSeed);
  registerCommand(
    context,
    "laravel-toolkit.cacheClear",
    artisanCommands.cacheClear
  );
  registerCommand(
    context,
    "laravel-toolkit.configClear",
    artisanCommands.configClear
  );
  registerCommand(
    context,
    "laravel-toolkit.optimize",
    artisanCommands.optimize
  );

  // ========== GENERADORES AVANZADOS ==========
  registerCommand(
    context,
    "laravel-toolkit.generateAdvancedModel",
    generateModel
  );
  registerCommand(
    context,
    "laravel-toolkit.generateAdvancedController",
    generateController
  );
  registerCommand(
    context,
    "laravel-toolkit.generateAdvancedMigration",
    generateMigration
  );

  // ========== GENERADORES LEGACY ==========
  registerCommand(context, "laravel-toolkit.generateCRUD", generateCRUD);
  
  const { generateAPI } = require("./generators/api");
  registerCommand(context, "laravel-toolkit.generateAPI", generateAPI);

  // ========== SPA CRUD GENERATORS ==========
  const { generateVueCRUD, generateReactCRUD } = require("./generators/crud-spa");
  registerCommand(context, "laravel-toolkit.generateVueCRUD", generateVueCRUD);
  registerCommand(context, "laravel-toolkit.generateReactCRUD", generateReactCRUD);

  // ========== ROUTE MANAGEMENT ==========
  registerCommand(context, "laravel-toolkit.generateRoutes", generateRouteFile);
  registerCommand(
    context,
    "laravel-toolkit.generateResourceRoutes",
    generateResourceRoutes
  );
  registerCommand(context, "laravel-toolkit.listRoutes", listModularRoutes);
  registerCommand(
    context,
    "laravel-toolkit.setupModularRoutes",
    createRouteServiceProvider
  );

  // ========== COMPONENT GENERATORS ==========
  const {
    generateReactComponent,
    generateVueComponent,
  } = require("./generators/components");
  
  const {
    generateReactView,
    generateVueView,
  } = require("./generators/views");
  
  registerCommand(
    context,
    "laravel-toolkit.generateReactComponent",
    generateReactComponent
  );

  registerCommand(
    context, 
    "laravel-toolkit.generateVueComponent", 
    generateVueComponent
  );
  
  registerCommand(
    context,
    "laravel-toolkit.generateReactView",
    generateReactView
  );

  registerCommand(
    context,
    "laravel-toolkit.generateVueView",
    generateVueView
  );

  registerCommand(
    context,
    "laravel-toolkit.generateLivewireComponent",
    async () => {
      const {
        executeArtisanCommand,
        showInputBox,
      } = require("./utils/helpers");

      const componentName = await showInputBox({
        prompt: "Livewire component name",
        placeHolder: "UserProfile",
      });

      if (componentName) {
        try {
          await executeArtisanCommand(`make:livewire ${componentName}`);
          vscode.window.showInformationMessage(
            `✅ Livewire component ${componentName} created`
          );
        } catch (error) {
          vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
        }
      }
    }
  );

  // ========== TESTING & SERVICES ==========
  const { generateTest, generateService } = require("./generators/tests");
  registerCommand(context, "laravel-toolkit.generateTest", generateTest);
  registerCommand(context, "laravel-toolkit.generateService", generateService);

  // ========== ASSETS & VITE ==========
  registerCommand(context, "laravel-toolkit.generateJS", generateJSFile);
  registerCommand(context, "laravel-toolkit.setupVite", setupVite);
  registerCommand(
    context,
    "laravel-toolkit.setupJSStructure",
    setupJSStructure
  );

  registerCommand(context, "laravel-toolkit.generateCSS", async () => {
    const { generateCSSFile } = require("./generators/assets");
    await generateCSSFile();
  });

  registerCommand(context, "laravel-toolkit.viteStart", async () => {
    const terminal = vscode.window.createTerminal("Vite Dev Server");
    terminal.show();
    terminal.sendText("npm run dev");
  });

  registerCommand(context, "laravel-toolkit.viteBuild", async () => {
    const terminal = vscode.window.createTerminal("Vite Build");
    terminal.show();
    terminal.sendText("npm run build");
  });

  // ========== DATABASE ==========
  registerCommand(context, "laravel-toolkit.migrateRefresh", async () => {
    const { executeArtisanCommand } = require("./utils/helpers");
    try {
      await executeArtisanCommand("migrate:refresh");
      vscode.window.showInformationMessage("✅ Migrations refreshed");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  registerCommand(context, "laravel-toolkit.migrateFreshSeed", async () => {
    const { executeArtisanCommand } = require("./utils/helpers");
    try {
      await executeArtisanCommand("migrate:fresh --seed");
      vscode.window.showInformationMessage("✅ Database recreated and seeded");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
    }
  });

  registerCommand(context, "laravel-toolkit.tinker", async () => {
    const terminal = vscode.window.createTerminal("Laravel Tinker");
    terminal.show();
    terminal.sendText("php artisan tinker");
  });

  // ========== UTILITIES ==========
  registerCommand(context, "laravel-toolkit.composerInstall", async () => {
    const terminal = vscode.window.createTerminal("Composer Install");
    terminal.show();
    terminal.sendText("composer install");
  });

  registerCommand(context, "laravel-toolkit.npmInstall", async () => {
    const terminal = vscode.window.createTerminal("NPM Install");
    terminal.show();
    terminal.sendText("npm install");
  });

  registerCommand(context, "laravel-toolkit.serve", async () => {
    const terminal = vscode.window.createTerminal("Laravel Server");
    terminal.show();
    terminal.sendText("php artisan serve");
  });

  vscode.window.showInformationMessage("✅ Laravel Toolkit ready!");
}

/**
 * Helper to register commands
 */
function registerCommand(context, commandId, callback) {
  const command = vscode.commands.registerCommand(commandId, callback);
  context.subscriptions.push(command);
}

function deactivate() {
  console.log("Laravel Toolkit deactivated");
}

module.exports = {
  activate,
  deactivate,
};
