const vscode = require("vscode");
const {
  isLaravelProject,
  detectFrontendFramework,
} = require("../utils/helpers");

class LaravelTreeDataProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!isLaravelProject()) {
      return Promise.resolve([]);
    }

    if (!element) {
      // Root level items
      return Promise.resolve([
        new LaravelTreeItem(
          "🚀 Artisan Commands",
          vscode.TreeItemCollapsibleState.Collapsed,
          "artisan"
        ),
        new LaravelTreeItem(
          "⚡ Generators",
          vscode.TreeItemCollapsibleState.Collapsed,
          "generators"
        ),
        new LaravelTreeItem(
          "🎨 Assets & Vite",
          vscode.TreeItemCollapsibleState.Collapsed,
          "assets"
        ),
        new LaravelTreeItem(
          "🗄️ Database",
          vscode.TreeItemCollapsibleState.Collapsed,
          "database"
        ),
        new LaravelTreeItem(
          "🛣️ Routes",
          vscode.TreeItemCollapsibleState.Collapsed,
          "routes"
        ),
        new LaravelTreeItem(
          "🧪 Testing",
          vscode.TreeItemCollapsibleState.Collapsed,
          "testing"
        ),
        new LaravelTreeItem(
          "🔧 Utilities",
          vscode.TreeItemCollapsibleState.Collapsed,
          "utilities"
        ),
      ]);
    } else {
      return Promise.resolve(this.getCategoryChildren(element.contextValue));
    }
  }

  getCategoryChildren(category) {
    switch (category) {
      case "artisan":
        return [
          new LaravelTreeItem(
            "📦 Create Model",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeModel",
              title: "Create Model",
            }
          ),
          new LaravelTreeItem(
            "🎮 Create Controller",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeController",
              title: "Create Controller",
            }
          ),
          new LaravelTreeItem(
            "📝 Create Migration",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeMigration",
              title: "Create Migration",
            }
          ),
          new LaravelTreeItem(
            "📋 Create Form Request",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeRequest",
              title: "Create Form Request",
            }
          ),
          new LaravelTreeItem(
            "🛡️ Create Middleware",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeMiddleware",
              title: "Create Middleware",
            }
          ),
          new LaravelTreeItem(
            "🌱 Create Seeder",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.makeSeeder",
              title: "Create Seeder",
            }
          ),
          new LaravelTreeItem(
            "📍 List Routes",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.routeList",
              title: "List Routes",
            }
          ),
        ];

      case "generators":
        const framework = detectFrontendFramework() || "Blade";
        return [
          new LaravelTreeItem(
            "🔥 Advanced Model Generator",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateAdvancedModel",
              title: "Generate Advanced Model",
            }
          ),
          new LaravelTreeItem(
            "🎮 Advanced Controller Generator",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateAdvancedController",
              title: "Generate Advanced Controller",
            }
          ),
          new LaravelTreeItem(
            "🗄️ Advanced Migration Builder",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateAdvancedMigration",
              title: "Generate Advanced Migration",
            }
          ),
          new LaravelTreeItem(
            `📦 Complete CRUD (${framework})`,
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateCRUD",
              title: "Generate Complete CRUD",
            }
          ),
          new LaravelTreeItem(
            "📦 Generate REST API",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateAPI",
              title: "Generate REST API",
            }
          ),
          new LaravelTreeItem(
            "💚 Vue 3 CRUD (Complete SPA)",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateVueCRUD",
              title: "Generate Vue 3 CRUD",
            }
          ),
          new LaravelTreeItem(
            "⚛️ React CRUD (Complete SPA)",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateReactCRUD",
              title: "Generate React CRUD",
            }
          ),
          new LaravelTreeItem(
            "⚛️ React Component",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateReactComponent",
              title: "Generate React Component",
            }
          ),
          new LaravelTreeItem(
            "💚 Vue Component",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateVueComponent",
              title: "Generate Vue Component",
            }
          ),
          new LaravelTreeItem(
            "⚡ Livewire Component",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateLivewireComponent",
              title: "Generate Livewire Component",
            }
          ),
          new LaravelTreeItem(
            "📄 React View/Page",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateReactView",
              title: "Generate React View/Page",
            }
          ),
          new LaravelTreeItem(
            "📄 Vue View/Page",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateVueView",
              title: "Generate Vue View/Page",
            }
          ),
        ];

      case "assets":
        return [
          new LaravelTreeItem(
            "📄 JS File",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateJS",
              title: "Generate JS File",
            }
          ),
          new LaravelTreeItem(
            "🎨 CSS/SCSS File",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateCSS",
              title: "Generate CSS File",
            }
          ),
          new LaravelTreeItem(
            "⚙️ Setup Vite",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.setupVite",
              title: "Setup Vite",
            }
          ),
          new LaravelTreeItem(
            "📁 JS Structure",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.setupJSStructure",
              title: "Setup JS Structure",
            }
          ),
          new LaravelTreeItem(
            "🔥 Dev Server",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.viteStart",
              title: "Start Vite Dev Server",
            }
          ),
          new LaravelTreeItem(
            "📦 Build Production",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.viteBuild",
              title: "Build for Production",
            }
          ),
        ];

      case "database":
        return [
          new LaravelTreeItem(
            "▶️ Run Migrations",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.migrate",
              title: "Run Migrations",
            }
          ),
          new LaravelTreeItem(
            "🔄 Refresh Migrations",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.migrateRefresh",
              title: "Refresh Migrations",
            }
          ),
          new LaravelTreeItem(
            "🌱 Run Seeders",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.dbSeed",
              title: "Run Seeders",
            }
          ),
          new LaravelTreeItem(
            "🔧 Fresh + Seed",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.migrateFreshSeed",
              title: "Fresh + Seed",
            }
          ),
          new LaravelTreeItem(
            "🗄️ Open Tinker",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.tinker",
              title: "Open Tinker",
            }
          ),
        ];

      case "routes":
        return [
          new LaravelTreeItem(
            "📝 Generate Route File",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateRoutes",
              title: "Generate Route File",
            }
          ),
          new LaravelTreeItem(
            "⚡ Generate Resource Routes",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateResourceRoutes",
              title: "Generate Resource Routes",
            }
          ),
          new LaravelTreeItem(
            "📋 List Modular Routes",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.listRoutes",
              title: "List Modular Routes",
            }
          ),
          new LaravelTreeItem(
            "⚙️ Setup Modular System",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.setupModularRoutes",
              title: "Setup Modular Routes System",
            }
          ),
        ];

      case "utilities":
        return [
          new LaravelTreeItem(
            "🗑️ Clear Cache",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.cacheClear",
              title: "Clear Cache",
            }
          ),
          new LaravelTreeItem(
            "⚙️ Clear Config",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.configClear",
              title: "Clear Config",
            }
          ),
          new LaravelTreeItem(
            "🚀 Optimize Application",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.optimize",
              title: "Optimize Application",
            }
          ),
          new LaravelTreeItem(
            "🔍 Composer Install",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.composerInstall",
              title: "Composer Install",
            }
          ),
          new LaravelTreeItem(
            "📦 NPM Install",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.npmInstall",
              title: "NPM Install",
            }
          ),
          new LaravelTreeItem(
            "🌐 Start Server",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.serve",
              title: "Start Development Server",
            }
          ),
        ];

      case "testing":
        return [
          new LaravelTreeItem(
            "🧪 Generate Test",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateTest",
              title: "Generate Test",
            }
          ),
          new LaravelTreeItem(
            "⚙️ Generate Service",
            vscode.TreeItemCollapsibleState.None,
            "command",
            {
              command: "laravel-toolkit.generateService",
              title: "Generate Service Class",
            }
          ),
        ];

      default:
        return [];
    }
  }
}

class LaravelTreeItem extends vscode.TreeItem {
  constructor(label, collapsibleState, contextValue, command) {
    super(label, collapsibleState);
    this.contextValue = contextValue;
    if (command) {
      this.command = command;
    }
  }
}

module.exports = {
  LaravelTreeDataProvider,
};
