const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const {
  getLaravelRootPath,
  showInputBox,
  toSnakeCase,
  ensureDirectoryExists,
  executeArtisanCommand,
} = require("../utils/helpers");

/**
 * Advanced Migration Generator with field builder
 */
async function generateMigration() {
  const migrationType = await vscode.window.showQuickPick(
    [
      {
        label: "$(add) Create Table",
        description: "Create a new database table",
        value: "create",
      },
      {
        label: "$(edit) Modify Table",
        description: "Add/modify columns in existing table",
        value: "update",
      },
      {
        label: "$(trash) Drop Table",
        description: "Remove a table from database",
        value: "drop",
      },
      {
        label: "$(symbol-field) Add Column",
        description: "Add single column to table",
        value: "add_column",
      },
      {
        label: "$(close) Drop Column",
        description: "Remove column from table",
        value: "drop_column",
      },
      {
        label: "$(references) Add Foreign Key",
        description: "Add foreign key constraint",
        value: "add_foreign",
      },
      {
        label: "$(search) Add Index",
        description: "Add database index",
        value: "add_index",
      },
    ],
    { placeHolder: "Select migration type" }
  );

  if (!migrationType) return;

  const tableName = await showInputBox({
    prompt: "Table name (e.g., products, blog_posts)",
    placeHolder: "products",
    validateInput: (value) => {
      if (!value) return "Table name is required";
      if (!/^[a-z_]+$/.test(value)) {
        return "Table name must be lowercase with underscores";
      }
      return null;
    },
  });

  if (!tableName) return;

  let fields = [];
  let migrationName = "";

  if (migrationType.value === "create") {
    migrationName = `create_${tableName}_table`;

    // Ask if user wants to use field builder
    const useBuilder = await vscode.window.showQuickPick(
      [
        {
          label: "$(wand) Interactive Field Builder",
          description: "Build fields step by step",
          value: true,
        },
        {
          label: "$(edit) Manual Definition",
          description: "Define fields manually",
          value: false,
        },
      ],
      { placeHolder: "How do you want to define table fields?" }
    );

    if (!useBuilder) return;

    if (useBuilder.value) {
      fields = await buildFields();
    } else {
      const fieldsInput = await showInputBox({
        prompt:
          "Fields (format: name:type:options, e.g., name:string, email:string:unique)",
        placeHolder: "name:string, email:string:unique, price:decimal:8,2",
      });

      if (fieldsInput) {
        fields = parseFieldsManual(fieldsInput);
      }
    }

    // Ask for common table options
    const tableOptions = await vscode.window.showQuickPick(
      [
        {
          label: "$(clock) Timestamps",
          description: "created_at and updated_at",
          picked: true,
          value: "timestamps",
        },
        {
          label: "$(trash) Soft Deletes",
          description: "deleted_at column",
          value: "softDeletes",
        },
        {
          label: "$(symbol-string) UUID Primary Key",
          description: "Use UUID instead of auto-increment",
          value: "uuid",
        },
        {
          label: "$(database) Remember Token",
          description: "For user authentication",
          value: "rememberToken",
        },
      ],
      {
        placeHolder: "Select table options (multi-select)",
        canPickMany: true,
      }
    );

    if (tableOptions) {
      tableOptions.forEach((opt) => {
        fields.push({ name: opt.value, type: "special", special: opt.value });
      });
    }
  } else if (migrationType.value === "update") {
    migrationName = `add_fields_to_${tableName}_table`;
    fields = await buildFields();
  } else if (migrationType.value === "drop") {
    migrationName = `drop_${tableName}_table`;
  } else if (migrationType.value === "add_column") {
    const columnName = await showInputBox({
      prompt: "Column name",
      placeHolder: "status",
    });

    if (!columnName) return;

    migrationName = `add_${columnName}_to_${tableName}_table`;

    const field = await buildSingleField(columnName);
    if (field) fields.push(field);
  } else if (migrationType.value === "drop_column") {
    const columnName = await showInputBox({
      prompt: "Column name to drop",
      placeHolder: "status",
    });

    if (!columnName) return;

    migrationName = `remove_${columnName}_from_${tableName}_table`;
    fields.push({ name: columnName, type: "drop" });
  } else if (migrationType.value === "add_foreign") {
    const columnName = await showInputBox({
      prompt: "Foreign key column name",
      placeHolder: "user_id",
    });

    if (!columnName) return;

    const referencedTable = await showInputBox({
      prompt: "Referenced table name",
      placeHolder: "users",
    });

    if (!referencedTable) return;

    migrationName = `add_${columnName}_foreign_to_${tableName}_table`;

    fields.push({
      name: columnName,
      type: "foreignId",
      constrained: referencedTable,
      cascadeOnDelete: true,
    });
  } else if (migrationType.value === "add_index") {
    const columnNames = await showInputBox({
      prompt: "Column names for index (comma-separated)",
      placeHolder: "email, username",
    });

    if (!columnNames) return;

    const indexType = await vscode.window.showQuickPick(
      [
        { label: "Index", value: "index" },
        { label: "Unique", value: "unique" },
        { label: "Full Text", value: "fulltext" },
      ],
      { placeHolder: "Index type" }
    );

    if (!indexType) return;

    migrationName = `add_${indexType.value}_to_${tableName}_table`;

    fields.push({
      name: columnNames,
      type: "index",
      indexType: indexType.value,
    });
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating migration: ${migrationName}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({
          increment: 30,
          message: "Creating migration file...",
        });

        await createMigrationFile(
          migrationName,
          tableName,
          migrationType.value,
          fields
        );

        progress.report({ increment: 70, message: "Completed!" });
      }
    );

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
 * Interactive field builder
 */
async function buildFields() {
  const fields = [];
  let addMore = true;

  while (addMore) {
    const fieldName = await showInputBox({
      prompt: "Field name (e.g., name, email, price)",
      placeHolder: "name",
    });

    if (!fieldName) break;

    const field = await buildSingleField(fieldName);
    if (!field) break;

    fields.push(field);

    const another = await vscode.window.showQuickPick(
      [
        { label: "Yes, add another field", value: true },
        { label: "No, finish", value: false },
      ],
      { placeHolder: "Add another field?" }
    );

    addMore = another?.value ?? false;
  }

  return fields;
}

/**
 * Build a single field with all options
 */
async function buildSingleField(fieldName) {
  const fieldType = await vscode.window.showQuickPick(
    [
      { label: "string", description: "VARCHAR column", value: "string" },
      { label: "text", description: "TEXT column", value: "text" },
      { label: "integer", description: "INTEGER column", value: "integer" },
      {
        label: "bigInteger",
        description: "BIGINT column",
        value: "bigInteger",
      },
      {
        label: "tinyInteger",
        description: "TINYINT column (0-255)",
        value: "tinyInteger",
      },
      { label: "boolean", description: "BOOLEAN column", value: "boolean" },
      {
        label: "decimal",
        description: "DECIMAL column (for prices)",
        value: "decimal",
      },
      { label: "float", description: "FLOAT column", value: "float" },
      { label: "double", description: "DOUBLE column", value: "double" },
      { label: "date", description: "DATE column", value: "date" },
      { label: "dateTime", description: "DATETIME column", value: "dateTime" },
      {
        label: "timestamp",
        description: "TIMESTAMP column",
        value: "timestamp",
      },
      { label: "time", description: "TIME column", value: "time" },
      { label: "json", description: "JSON column", value: "json" },
      { label: "enum", description: "ENUM column", value: "enum" },
      {
        label: "foreignId",
        description: "Foreign key (bigInteger unsigned)",
        value: "foreignId",
      },
    ],
    { placeHolder: `Select type for field: ${fieldName}` }
  );

  if (!fieldType) return null;

  const field = {
    name: fieldName,
    type: fieldType.value,
  };

  // Type-specific options
  if (fieldType.value === "string") {
    const length = await showInputBox({
      prompt: "String length (default: 255)",
      placeHolder: "255",
    });
    if (length) field.length = parseInt(length);
  }

  if (fieldType.value === "decimal") {
    const precision = await showInputBox({
      prompt: "Precision (total digits, default: 8)",
      placeHolder: "8",
    });
    const scale = await showInputBox({
      prompt: "Scale (decimal places, default: 2)",
      placeHolder: "2",
    });
    field.precision = precision ? parseInt(precision) : 8;
    field.scale = scale ? parseInt(scale) : 2;
  }

  if (fieldType.value === "enum") {
    const values = await showInputBox({
      prompt: "Enum values (comma-separated)",
      placeHolder: "pending, active, completed",
    });
    if (values) {
      field.values = values.split(",").map((v) => v.trim());
    }
  }

  if (fieldType.value === "foreignId") {
    const constrainedTable = await showInputBox({
      prompt: "Referenced table name (e.g., users)",
      placeHolder: "users",
    });
    if (constrainedTable) {
      field.constrained = constrainedTable;

      const cascade = await vscode.window.showQuickPick(
        [
          { label: "Cascade on delete", value: true },
          { label: "No cascade", value: false },
        ],
        { placeHolder: "Delete behavior" }
      );

      if (cascade?.value) {
        field.cascadeOnDelete = true;
      }
    }
  }

  // Common field modifiers
  const modifiers = await vscode.window.showQuickPick(
    [
      {
        label: "nullable",
        description: "Allow NULL values",
        value: "nullable",
      },
      { label: "unique", description: "Unique constraint", value: "unique" },
      { label: "default", description: "Set default value", value: "default" },
      {
        label: "unsigned",
        description: "Unsigned (for integers)",
        value: "unsigned",
      },
      { label: "index", description: "Add index", value: "index" },
      { label: "comment", description: "Add comment", value: "comment" },
    ],
    {
      placeHolder: "Select field modifiers (multi-select, optional)",
      canPickMany: true,
    }
  );

  if (modifiers) {
    modifiers.forEach((mod) => {
      field[mod.value] = true;
    });

    // If default was selected, ask for value
    if (modifiers.some((m) => m.value === "default")) {
      const defaultValue = await showInputBox({
        prompt: "Default value",
        placeHolder: '0, "", null, etc.',
      });
      if (defaultValue !== undefined) {
        field.defaultValue = defaultValue;
      }
    }

    // If comment was selected, ask for text
    if (modifiers.some((m) => m.value === "comment")) {
      const commentText = await showInputBox({
        prompt: "Comment text",
        placeHolder: "Field description",
      });
      if (commentText) {
        field.commentText = commentText;
      }
    }
  }

  return field;
}

/**
 * Parse fields from manual input
 */
function parseFieldsManual(input) {
  const fields = [];
  const fieldStrings = input.split(",").map((f) => f.trim());

  for (const fieldStr of fieldStrings) {
    const parts = fieldStr.split(":");
    const field = {
      name: parts[0],
      type: parts[1] || "string",
    };

    // Parse additional options
    if (parts[2]) {
      if (parts[2] === "unique") field.unique = true;
      else if (parts[2] === "nullable") field.nullable = true;
      else if (parts[1] === "decimal") {
        field.precision = parseInt(parts[2]);
        field.scale = parts[3] ? parseInt(parts[3]) : 2;
      }
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Create migration file with fields
 */
async function createMigrationFile(migrationName, tableName, type, fields) {
  const rootPath = getLaravelRootPath();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .substring(0, 17);

  const migrationDir = path.join(rootPath, "database", "migrations");
  ensureDirectoryExists(migrationDir);

  const fileName = `${timestamp}_${migrationName}.php`;
  const migrationPath = path.join(migrationDir, fileName);

  let upContent = "";
  let downContent = "";

  if (type === "create") {
    const fieldDefinitions = fields
      .map((field) => generateFieldDefinition(field))
      .join("\n            ");

    upContent = `        Schema::create('${tableName}', function (Blueprint $table) {
            $table->id();
${fieldDefinitions}
        });`;

    downContent = `        Schema::dropIfExists('${tableName}');`;
  } else if (type === "update" || type === "add_column") {
    const fieldDefinitions = fields
      .map((field) => generateFieldDefinition(field))
      .join("\n            ");

    upContent = `        Schema::table('${tableName}', function (Blueprint $table) {
${fieldDefinitions}
        });`;

    downContent = `        Schema::table('${tableName}', function (Blueprint $table) {
            // Reverse changes here
        });`;
  } else if (type === "drop") {
    upContent = `        Schema::dropIfExists('${tableName}');`;
    downContent = `        // Cannot reverse drop table`;
  }

  const content = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
${upContent}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
${downContent}
    }
};
`;

  fs.writeFileSync(migrationPath, content);
}

/**
 * Generate field definition for migration
 */
function generateFieldDefinition(field) {
  if (field.type === "special") {
    return `$table->${field.special}();`;
  }

  let definition = `$table->${field.type}('${field.name}'`;

  // Add type-specific parameters
  if (field.length) {
    definition += `, ${field.length}`;
  }

  if (field.precision && field.scale) {
    definition += `, ${field.precision}, ${field.scale}`;
  }

  if (field.values) {
    const enumValues = field.values.map((v) => `'${v}'`).join(", ");
    definition += `, [${enumValues}]`;
  }

  definition += ")";

  // Add modifiers
  if (field.unsigned) definition += "->unsigned()";
  if (field.nullable) definition += "->nullable()";
  if (field.unique) definition += "->unique()";
  if (field.index) definition += "->index()";
  if (field.defaultValue !== undefined) {
    const defaultVal =
      field.defaultValue === "null" ? "null" : `'${field.defaultValue}'`;
    definition += `->default(${defaultVal})`;
  }
  if (field.commentText) definition += `->comment('${field.commentText}')`;
  if (field.constrained) definition += `->constrained('${field.constrained}')`;
  if (field.cascadeOnDelete) definition += "->cascadeOnDelete()";

  definition += ";";

  return definition;
}

module.exports = {
  generateMigration,
};
