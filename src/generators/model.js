const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const {
  getLaravelRootPath,
  showInputBox,
  toPascalCase,
  toSnakeCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Advanced Model Generator with granular control
 */
async function generateModel() {
  const modelName = await showInputBox({
    prompt: "Model name (e.g., Product, BlogPost)",
    placeHolder: "Product",
    validateInput: (value) => {
      if (!value) return "Model name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase (e.g., Product)";
      }
      return null;
    },
  });

  if (!modelName) return;

  // Select model options
  const options = await vscode.window.showQuickPick(
    [
      {
        label: "$(file) Model only",
        description: "Create just the model file",
        value: {
          migration: false,
          factory: false,
          seeder: false,
          controller: false,
          resource: false,
          policy: false,
        },
      },
      {
        label: "$(database) Model + Migration",
        description: "Model with database migration",
        value: {
          migration: true,
          factory: false,
          seeder: false,
          controller: false,
          resource: false,
          policy: false,
        },
      },
      {
        label: "$(beaker) Model + Factory",
        description: "Model with factory for testing",
        value: {
          migration: false,
          factory: true,
          seeder: false,
          controller: false,
          resource: false,
          policy: false,
        },
      },
      {
        label: "$(package) Model + Migration + Factory + Seeder",
        description: "Complete data setup",
        value: {
          migration: true,
          factory: true,
          seeder: true,
          controller: false,
          resource: false,
          policy: false,
        },
      },
      {
        label: "$(server) Model + Controller",
        description: "Model with resource controller",
        value: {
          migration: false,
          factory: false,
          seeder: false,
          controller: true,
          resource: false,
          policy: false,
        },
      },
      {
        label: "$(json) Model + API Resource",
        description: "Model with API resource transformer",
        value: {
          migration: false,
          factory: false,
          seeder: false,
          controller: false,
          resource: true,
          policy: false,
        },
      },
      {
        label: "$(shield) Model + Policy",
        description: "Model with authorization policy",
        value: {
          migration: false,
          factory: false,
          seeder: false,
          controller: false,
          resource: false,
          policy: true,
        },
      },
      {
        label: "$(star-full) Complete Model Setup",
        description:
          "Model with migration, factory, seeder, controller, resource, and policy",
        value: {
          migration: true,
          factory: true,
          seeder: true,
          controller: true,
          resource: true,
          policy: true,
        },
      },
      {
        label: "$(settings-gear) Custom configuration...",
        description: "Choose each option individually",
        value: "custom",
      },
    ],
    { placeHolder: "Select model generation options" }
  );

  if (!options) return;

  let selectedOptions = options.value;

  // If custom, ask for each option
  if (selectedOptions === "custom") {
    selectedOptions = await getCustomOptions();
    if (!selectedOptions) return;
  }

  // Advanced model features
  const modelFeatures = await vscode.window.showQuickPick(
    [
      {
        label: "$(check) Timestamps",
        description: "created_at and updated_at",
        picked: true,
        value: "timestamps",
      },
      {
        label: "$(trash) Soft Deletes",
        description: "Add soft delete support",
        value: "softDeletes",
      },
      {
        label: "$(symbol-string) UUID Primary Key",
        description: "Use UUID instead of auto-increment",
        value: "uuid",
      },
      {
        label: "$(globe) Multi-tenant (tenant_id)",
        description: "Add tenant isolation",
        value: "tenant",
      },
      {
        label: "$(search) Searchable",
        description: "Add Laravel Scout integration",
        value: "searchable",
      },
      {
        label: "$(folder) Organized in subdirectory",
        description: "Place in app/Models/subdirectory",
        value: "subdirectory",
      },
    ],
    {
      placeHolder: "Select model features (multi-select)",
      canPickMany: true,
    }
  );

  const features = modelFeatures
    ? modelFeatures.map((f) => f.value)
    : ["timestamps"];

  // If subdirectory is selected, ask for path
  let subdirectory = "";
  if (features.includes("subdirectory")) {
    subdirectory = await showInputBox({
      prompt: "Subdirectory path (e.g., Admin, Blog)",
      placeHolder: "Admin",
    });
  }

  // Ask for fillable fields
  const fillableFields = await showInputBox({
    prompt: "Fillable fields (comma-separated, e.g., name, email, price)",
    placeHolder: "name, email, phone",
  });

  // Ask for relationships
  const hasRelationships = await vscode.window.showQuickPick(
    [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    { placeHolder: "Add relationships to this model?" }
  );

  let relationships = [];
  if (hasRelationships?.value) {
    relationships = await defineRelationships();
  }

  // Build the model
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating ${modelName} model`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 10, message: "Creating model file..." });
        await createModelFile(
          modelName,
          subdirectory,
          fillableFields,
          features,
          relationships
        );

        if (selectedOptions.migration) {
          progress.report({ increment: 15, message: "Creating migration..." });
          await createMigrationForModel(modelName, fillableFields, features);
        }

        if (selectedOptions.factory) {
          progress.report({ increment: 15, message: "Creating factory..." });
          await createFactoryForModel(modelName, fillableFields);
        }

        if (selectedOptions.seeder) {
          progress.report({ increment: 15, message: "Creating seeder..." });
          await createSeederForModel(modelName);
        }

        if (selectedOptions.controller) {
          progress.report({ increment: 15, message: "Creating controller..." });
          await createControllerForModel(modelName, subdirectory);
        }

        if (selectedOptions.resource) {
          progress.report({
            increment: 15,
            message: "Creating API resource...",
          });
          await createResourceForModel(modelName, subdirectory);
        }

        if (selectedOptions.policy) {
          progress.report({ increment: 15, message: "Creating policy..." });
          await createPolicyForModel(modelName);
        }

        progress.report({ increment: 10, message: "Completed!" });
      }
    );

    vscode.window.showInformationMessage(
      `✅ Model ${modelName} generated successfully with all selected components`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error generating model: ${error.message}`
    );
  }
}

/**
 * Get custom options from user
 */
async function getCustomOptions() {
  const options = await vscode.window.showQuickPick(
    [
      {
        label: "$(database) Migration",
        description: "Create database migration",
        value: "migration",
      },
      {
        label: "$(beaker) Factory",
        description: "Create model factory",
        value: "factory",
      },
      {
        label: "$(package) Seeder",
        description: "Create database seeder",
        value: "seeder",
      },
      {
        label: "$(server) Resource Controller",
        description: "Create resource controller",
        value: "controller",
      },
      {
        label: "$(json) API Resource",
        description: "Create API resource",
        value: "resource",
      },
      {
        label: "$(shield) Policy",
        description: "Create authorization policy",
        value: "policy",
      },
    ],
    {
      placeHolder: "Select components to generate (multi-select)",
      canPickMany: true,
    }
  );

  if (!options || options.length === 0) return null;

  const selected = {
    migration: false,
    factory: false,
    seeder: false,
    controller: false,
    resource: false,
    policy: false,
  };

  options.forEach((opt) => {
    selected[opt.value] = true;
  });

  return selected;
}

/**
 * Define model relationships
 */
async function defineRelationships() {
  const relationships = [];
  let addMore = true;

  while (addMore) {
    const relType = await vscode.window.showQuickPick(
      [
        {
          label: "hasOne",
          description: "One-to-One relationship",
          value: "hasOne",
        },
        {
          label: "hasMany",
          description: "One-to-Many relationship",
          value: "hasMany",
        },
        {
          label: "belongsTo",
          description: "Inverse One-to-Many",
          value: "belongsTo",
        },
        {
          label: "belongsToMany",
          description: "Many-to-Many relationship",
          value: "belongsToMany",
        },
        {
          label: "morphTo",
          description: "Polymorphic relationship",
          value: "morphTo",
        },
        {
          label: "morphMany",
          description: "One-to-Many polymorphic",
          value: "morphMany",
        },
      ],
      { placeHolder: "Select relationship type" }
    );

    if (!relType) break;

    const relatedModel = await showInputBox({
      prompt: `Related model name for ${relType.label}`,
      placeHolder: "Post",
    });

    if (!relatedModel) break;

    const methodName = await showInputBox({
      prompt: "Relationship method name",
      placeHolder: relatedModel.toLowerCase(),
    });

    if (!methodName) break;

    relationships.push({
      type: relType.value,
      model: relatedModel,
      method: methodName,
    });

    const another = await vscode.window.showQuickPick(
      [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      { placeHolder: "Add another relationship?" }
    );

    addMore = another?.value ?? false;
  }

  return relationships;
}

/**
 * Create the model file
 */
async function createModelFile(
  modelName,
  subdirectory,
  fillableFields,
  features,
  relationships
) {
  const rootPath = getLaravelRootPath();
  const modelDir = path.join(rootPath, "app", "Models", subdirectory);
  ensureDirectoryExists(modelDir);

  const modelPath = path.join(modelDir, `${modelName}.php`);

  const fillableArray = fillableFields
    ? fillableFields
        .split(",")
        .map((f) => `'${f.trim()}'`)
        .join(", ")
    : "";

  const namespace = subdirectory
    ? `App\\Models\\${subdirectory}`
    : "App\\Models";
  const useStatements = [];
  const traits = [];
  const properties = [];

  // Add features
  if (features.includes("softDeletes")) {
    useStatements.push("use Illuminate\\Database\\Eloquent\\SoftDeletes;");
    traits.push("SoftDeletes");
  }

  if (features.includes("uuid")) {
    useStatements.push(
      "use Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;"
    );
    traits.push("HasUuids");
  }

  if (features.includes("searchable")) {
    useStatements.push("use Laravel\\Scout\\Searchable;");
    traits.push("Searchable");
  }

  if (!features.includes("timestamps")) {
    properties.push("    public $timestamps = false;");
  }

  // Add relationships
  const relationshipMethods = relationships
    .map((rel) => {
      const relatedClass = rel.model;
      return `
    /**
     * ${rel.type} relationship with ${relatedClass}
     */
    public function ${rel.method}()
    {
        return $this->${rel.type}(${relatedClass}::class);
    }`;
    })
    .join("\n");

  const modelContent = `<?php

namespace ${namespace};

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
${useStatements.join("\n")}

class ${modelName} extends Model
{
    use HasFactory${traits.length > 0 ? ", " + traits.join(", ") : ""};

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        ${fillableArray}
    ];

${properties.join("\n")}
${relationshipMethods}
}
`;

  fs.writeFileSync(modelPath, modelContent);
}

/**
 * Create migration for model
 */
async function createMigrationForModel(modelName, fillableFields, features) {
  const { executeArtisanCommand } = require("../utils/helpers");
  const tableName = toSnakeCase(modelName) + "s";

  await executeArtisanCommand(
    `make:migration create_${tableName}_table`,
    false
  );

  // Note: We could enhance this to auto-populate migration fields
  vscode.window.showInformationMessage(
    `💡 Don't forget to add fields to the migration: ${fillableFields}`
  );
}

/**
 * Create factory for model
 */
async function createFactoryForModel(modelName, fillableFields) {
  const { executeArtisanCommand } = require("../utils/helpers");
  await executeArtisanCommand(
    `make:factory ${modelName}Factory --model=${modelName}`,
    false
  );
}

/**
 * Create seeder for model
 */
async function createSeederForModel(modelName) {
  const { executeArtisanCommand } = require("../utils/helpers");
  await executeArtisanCommand(`make:seeder ${modelName}Seeder`, false);
}

/**
 * Create controller for model
 */
async function createControllerForModel(modelName, subdirectory) {
  const { executeArtisanCommand } = require("../utils/helpers");
  const modelPath = subdirectory ? `${subdirectory}\\${modelName}` : modelName;
  await executeArtisanCommand(
    `make:controller ${modelName}Controller --model=${modelPath} --resource`,
    false
  );
}

/**
 * Create API resource for model
 */
async function createResourceForModel(modelName, subdirectory) {
  const { executeArtisanCommand } = require("../utils/helpers");
  await executeArtisanCommand(`make:resource ${modelName}Resource`, false);
  await executeArtisanCommand(`make:resource ${modelName}Collection`, false);
}

/**
 * Create policy for model
 */
async function createPolicyForModel(modelName) {
  const { executeArtisanCommand } = require("../utils/helpers");
  await executeArtisanCommand(
    `make:policy ${modelName}Policy --model=${modelName}`,
    false
  );
}

module.exports = {
  generateModel,
};
