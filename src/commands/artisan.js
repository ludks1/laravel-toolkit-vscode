const vscode = require("vscode");
const { executeArtisanCommand, showInputBox } = require("../utils/helpers");

/**
 * Command: php artisan make:model
 */
async function makeModel() {
  const modelName = await showInputBox({
    prompt: "Model name (e.g: User, Product)",
    placeHolder: "Product",
    validateInput: (value) => {
      if (!value) return "Model name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase (e.g: Product)";
      }
      return null;
    },
  });

  if (!modelName) return;

  const options = await vscode.window.showQuickPick(
    [
      { label: "Model only", value: "" },
      { label: "Model + Migration", value: "-m" },
      { label: "Model + Migration + Controller", value: "-mc" },
      { label: "Model + Migration + Controller + Resource", value: "-mcr" },
      { label: "Complete Model (Migration, Factory, Seeder)", value: "-mfs" },
      {
        label: "All (Migration, Factory, Seeder, Controller Resource)",
        value: "-a",
      },
    ],
    { placeHolder: "Select options for the model" }
  );

  if (!options) return;

  const command = `make:model ${modelName} ${options.value}`.trim();

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(
      `✅ Model ${modelName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating model: ${error.message}`
    );
  }
}

/**
 * Command: php artisan make:controller
 */
async function makeController() {
  const controllerName = await showInputBox({
    prompt: "Controller name (e.g: ProductController)",
    placeHolder: "ProductController",
    validateInput: (value) => {
      if (!value) return "Controller name is required";
      return null;
    },
  });

  if (!controllerName) return;

  const type = await vscode.window.showQuickPick(
    [
      { label: "Simple Controller", value: "" },
      { label: "Resource Controller", value: "--resource" },
      { label: "API Controller", value: "--api" },
      { label: "Invokable Controller", value: "--invokable" },
      { label: "Controller with Model", value: "--model" },
    ],
    { placeHolder: "Controller type" }
  );

  if (!type) return;

  let command = `make:controller ${controllerName} ${type.value}`.trim();

  // If controller with model was selected, ask for model name
  if (type.value === "--model") {
    const modelName = await showInputBox({
      prompt: "Associated model name",
      placeHolder: "Product",
    });

    if (modelName) {
      command = `make:controller ${controllerName} --model=${modelName}`;
    }
  }

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(
      `✅ Controller ${controllerName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating controller: ${error.message}`
    );
  }
}

/**
 * Command: php artisan make:migration
 */
async function makeMigration() {
  const migrationName = await showInputBox({
    prompt: "Migration name (e.g: create_products_table)",
    placeHolder: "create_products_table",
    validateInput: (value) => {
      if (!value) return "Migration name is required";
      return null;
    },
  });

  if (!migrationName) return;

  const command = `make:migration ${migrationName}`;

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(
      `✅ Migration ${migrationName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating migration: ${error.message}`
    );
  }
}

/**
 * Command: php artisan migrate
 */
async function migrate() {
  const options = await vscode.window.showQuickPick(
    [
      { label: "Run migrations", value: "" },
      { label: "Run migrations (fresh)", value: "--fresh" },
      { label: "Run migrations (fresh + seed)", value: "--fresh --seed" },
      { label: "Rollback last migration", value: "--rollback" },
      { label: "Rollback all migrations", value: "--reset" },
      { label: "Rollback + Migrate", value: "--refresh" },
      { label: "Rollback + Migrate + Seed", value: "--refresh --seed" },
    ],
    { placeHolder: "Select a migration option" }
  );

  if (!options) return;

  let command = "migrate";
  if (options.value === "--rollback") {
    command = "migrate:rollback";
  } else if (options.value === "--reset") {
    command = "migrate:reset";
  } else if (
    options.value === "--refresh" ||
    options.value === "--refresh --seed"
  ) {
    command = `migrate:refresh ${
      options.value.includes("--seed") ? "--seed" : ""
    }`;
  } else {
    command = `migrate ${options.value}`.trim();
  }

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(`✅ Migration executed successfully`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error executing migration: ${error.message}`
    );
  }
}

/**
 * Command: php artisan make:seeder
 */
async function makeSeeder() {
  const seederName = await showInputBox({
    prompt: "Seeder name (e.g: ProductSeeder)",
    placeHolder: "ProductSeeder",
    validateInput: (value) => {
      if (!value) return "Seeder name is required";
      return null;
    },
  });

  if (!seederName) return;

  try {
    await executeArtisanCommand(`make:seeder ${seederName}`);
    vscode.window.showInformationMessage(
      `✅ Seeder ${seederName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating seeder: ${error.message}`
    );
  }
}

/**
 * Command: php artisan db:seed
 */
async function dbSeed() {
  const runAll = await vscode.window.showQuickPick(
    [
      { label: "Run all seeders", value: true },
      { label: "Run a specific seeder", value: false },
    ],
    { placeHolder: "Select an option" }
  );

  if (!runAll) return;

  let command = "db:seed";

  if (!runAll.value) {
    const seederName = await showInputBox({
      prompt: "Seeder name to run",
      placeHolder: "DatabaseSeeder",
    });

    if (!seederName) return;
    command = `db:seed --class=${seederName}`;
  }

  try {
    await executeArtisanCommand(command);
    vscode.window.showInformationMessage(`✅ Seeder executed successfully`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error executing seeder: ${error.message}`
    );
  }
}

/**
 * Command: php artisan make:request
 */
async function makeRequest() {
  const requestName = await showInputBox({
    prompt: "Form Request name (e.g: StoreProductRequest)",
    placeHolder: "StoreProductRequest",
  });

  if (!requestName) return;

  try {
    await executeArtisanCommand(`make:request ${requestName}`);
    vscode.window.showInformationMessage(
      `✅ Request ${requestName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating request: ${error.message}`
    );
  }
}

/**
 * Command: php artisan make:middleware
 */
async function makeMiddleware() {
  const middlewareName = await showInputBox({
    prompt: "Middleware name (e.g: CheckUserRole)",
    placeHolder: "CheckUserRole",
  });

  if (!middlewareName) return;

  try {
    await executeArtisanCommand(`make:middleware ${middlewareName}`);
    vscode.window.showInformationMessage(
      `✅ Middleware ${middlewareName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating middleware: ${error.message}`
    );
  }
}

/**
 * Command: php artisan route:list
 */
async function routeList() {
  try {
    await executeArtisanCommand("route:list");
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error listing routes: ${error.message}`
    );
  }
}

/**
 * Command: php artisan cache:clear
 */
async function cacheClear() {
  try {
    await executeArtisanCommand("cache:clear", false);
    vscode.window.showInformationMessage(`✅ Cache cleared successfully`);
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error clearing cache: ${error.message}`
    );
  }
}

/**
 * Command: php artisan config:clear
 */
async function configClear() {
  try {
    await executeArtisanCommand("config:clear", false);
    vscode.window.showInformationMessage(
      `✅ Configuration cleared successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error clearing configuration: ${error.message}`
    );
  }
}

/**
 * Command: php artisan optimize
 */
async function optimize() {
  try {
    await executeArtisanCommand("optimize");
    vscode.window.showInformationMessage(
      `✅ Application optimized successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error optimizing: ${error.message}`);
  }
}

module.exports = {
  makeModel,
  makeController,
  makeMigration,
  migrate,
  makeSeeder,
  dbSeed,
  makeRequest,
  makeMiddleware,
  routeList,
  cacheClear,
  configClear,
  optimize,
};
