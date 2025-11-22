const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toCamelCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Generates a complete Vue CRUD
 */
async function generateVueCRUD() {
  const modelName = await showInputBox({
    prompt: "Model name for Vue CRUD (e.g: Product)",
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

  const fields = await showInputBox({
    prompt: "Model fields (comma separated: name:string,price:decimal,description:text)",
    placeHolder: "name:string,price:decimal,stock:integer",
  });

  if (!fields) return;

  const parsedFields = parseFields(fields);

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating Vue CRUD for ${modelName}`,
        cancellable: false,
      },
      async (progress) => {
        const rootPath = getLaravelRootPath();

        progress.report({ increment: 10, message: "Creating Model..." });
        await createModel(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating Migration..." });
        await createMigration(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating API Controller..." });
        await createAPIController(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating API Resource..." });
        await createAPIResource(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating Form Requests..." });
        await createFormRequests(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating Vue Components..." });
        await createVueComponents(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating Vue Composables..." });
        await createVueComposables(rootPath, modelName);

        progress.report({ increment: 10, message: "Creating API Routes..." });
        await createAPIRoutes(rootPath, modelName);

        progress.report({ increment: 5, message: "Registering Vue Routes..." });
        await registerVueRoutes(rootPath, modelName);

        progress.report({ increment: 10, message: "Done!" });
      }
    );

    vscode.window.showInformationMessage(
      `✅ Vue CRUD for ${modelName} generated successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generates a complete React CRUD
 */
async function generateReactCRUD() {
  const modelName = await showInputBox({
    prompt: "Model name for React CRUD (e.g: Product)",
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

  const fields = await showInputBox({
    prompt: "Model fields (comma separated: name:string,price:decimal,description:text)",
    placeHolder: "name:string,price:decimal,stock:integer",
  });

  if (!fields) return;

  const parsedFields = parseFields(fields);

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating React CRUD for ${modelName}`,
        cancellable: false,
      },
      async (progress) => {
        const rootPath = getLaravelRootPath();

        progress.report({ increment: 10, message: "Creating Model..." });
        await createModel(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating Migration..." });
        await createMigration(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating API Controller..." });
        await createAPIController(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating API Resource..." });
        await createAPIResource(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating Form Requests..." });
        await createFormRequests(rootPath, modelName, parsedFields);

        progress.report({ increment: 15, message: "Creating React Components..." });
        await createReactComponents(rootPath, modelName, parsedFields);

        progress.report({ increment: 10, message: "Creating React Hooks..." });
        await createReactHooks(rootPath, modelName);

        progress.report({ increment: 10, message: "Creating API Routes..." });
        await createAPIRoutes(rootPath, modelName);

        progress.report({ increment: 5, message: "Registering React Routes..." });
        await registerReactRoutes(rootPath, modelName);

        progress.report({ increment: 10, message: "Done!" });
      }
    );

    vscode.window.showInformationMessage(
      `✅ React CRUD for ${modelName} generated successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Parse fields string into structured data
 */
function parseFields(fieldsString) {
  return fieldsString.split(",").map((field) => {
    const [name, type = "string"] = field.trim().split(":");
    return { name: name.trim(), type: type.trim() };
  });
}

/**
 * Create Laravel Model
 */
async function createModel(rootPath, modelName, fields) {
  const modelPath = path.join(rootPath, "app", "Models", `${modelName}.php`);

  const fillable = fields.map((f) => `'${f.name}'`).join(",\n        ");

  const content = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ${modelName} extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        ${fillable},
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
`;

  ensureDirectoryExists(path.dirname(modelPath));
  fs.writeFileSync(modelPath, content);
}

/**
 * Create Migration
 */
async function createMigration(rootPath, modelName, fields) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const tableName = toSnakeCase(modelName) + "s";
  const migrationPath = path.join(
    rootPath,
    "database",
    "migrations",
    `${timestamp}_create_${tableName}_table.php`
  );

  const fieldDefinitions = fields
    .map((field) => {
      const type = getMigrationType(field.type);
      return `            $table->${type}('${field.name}');`;
    })
    .join("\n");

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
        Schema::create('${tableName}', function (Blueprint $table) {
            $table->id();
${fieldDefinitions}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('${tableName}');
    }
};
`;

  ensureDirectoryExists(path.dirname(migrationPath));
  fs.writeFileSync(migrationPath, content);
}

/**
 * Get migration type from field type
 */
function getMigrationType(type) {
  const typeMap = {
    string: "string",
    text: "text",
    integer: "integer",
    bigint: "bigInteger",
    decimal: "decimal",
    float: "float",
    double: "double",
    boolean: "boolean",
    date: "date",
    datetime: "dateTime",
    timestamp: "timestamp",
    json: "json",
  };
  return typeMap[type] || "string";
}

/**
 * Create API Controller
 */
async function createAPIController(rootPath, modelName, fields) {
  const controllerPath = path.join(
    rootPath,
    "app",
    "Http",
    "Controllers",
    "Api",
    `${modelName}Controller.php`
  );

  const tableName = toSnakeCase(modelName) + "s";
  const variableName = toCamelCase(modelName);

  const content = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\Store${modelName}Request;
use App\\Http\\Requests\\Update${modelName}Request;
use App\\Http\\Resources\\${modelName}Resource;
use App\\Models\\${modelName};
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

class ${modelName}Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        $${variableName}s = ${modelName}::query()
            ->latest()
            ->paginate(15);

        return ${modelName}Resource::collection($${variableName}s);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Store${modelName}Request $request): JsonResponse
    {
        $${variableName} = ${modelName}::create($request->validated());

        return (new ${modelName}Resource($${variableName}))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(${modelName} $${variableName}): ${modelName}Resource
    {
        return new ${modelName}Resource($${variableName});
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Update${modelName}Request $request, ${modelName} $${variableName}): ${modelName}Resource
    {
        $${variableName}->update($request->validated());

        return new ${modelName}Resource($${variableName});
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(${modelName} $${variableName}): JsonResponse
    {
        $${variableName}->delete();

        return response()->json([
            'message' => '${modelName} deleted successfully'
        ], 204);
    }
}
`;

  ensureDirectoryExists(path.dirname(controllerPath));
  fs.writeFileSync(controllerPath, content);
}

/**
 * Create API Resource
 */
async function createAPIResource(rootPath, modelName, fields) {
  const resourcePath = path.join(
    rootPath,
    "app",
    "Http",
    "Resources",
    `${modelName}Resource.php`
  );

  const fieldMappings = fields
    .map((field) => `            '${field.name}' => $this->${field.name},`)
    .join("\n");

  const content = `<?php

namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${modelName}Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
${fieldMappings}
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
`;

  ensureDirectoryExists(path.dirname(resourcePath));
  fs.writeFileSync(resourcePath, content);
}

/**
 * Create Form Requests
 */
async function createFormRequests(rootPath, modelName, fields) {
  const requestsPath = path.join(rootPath, "app", "Http", "Requests");

  const validationRules = fields
    .map((field) => {
      const rules = getValidationRules(field.type);
      return `            '${field.name}' => '${rules}',`;
    })
    .join("\n");

  // Store Request
  const storeContent = `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class Store${modelName}Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \\Illuminate\\Contracts\\Validation\\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
${validationRules}
        ];
    }
}
`;

  const updateValidationRules = fields
    .map((field) => {
      const rules = getValidationRules(field.type, true);
      return `            '${field.name}' => '${rules}',`;
    })
    .join("\n");

  // Update Request
  const updateContent = `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class Update${modelName}Request extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \\Illuminate\\Contracts\\Validation\\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
${updateValidationRules}
        ];
    }
}
`;

  ensureDirectoryExists(requestsPath);
  fs.writeFileSync(
    path.join(requestsPath, `Store${modelName}Request.php`),
    storeContent
  );
  fs.writeFileSync(
    path.join(requestsPath, `Update${modelName}Request.php`),
    updateContent
  );
}

/**
 * Get validation rules for field type
 */
function getValidationRules(type, isUpdate = false) {
  const prefix = isUpdate ? "sometimes|" : "";
  const typeRules = {
    string: "required|string|max:255",
    text: "required|string",
    integer: "required|integer",
    bigint: "required|integer",
    decimal: "required|numeric",
    float: "required|numeric",
    double: "required|numeric",
    boolean: "required|boolean",
    date: "required|date",
    datetime: "required|date",
    timestamp: "required|date",
    json: "required|array",
  };
  return prefix + (typeRules[type] || "required|string|max:255");
}

/**
 * Create Vue Components (List, Form, Show)
 */
async function createVueComponents(rootPath, modelName, fields) {
  const componentsPath = path.join(
    rootPath,
    "resources",
    "js",
    "components",
    modelName
  );
  ensureDirectoryExists(componentsPath);

  const pluralName = modelName + "s";
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  // List Component
  const listComponent = generateVueListComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}List.vue`), listComponent);

  // Form Component
  const formComponent = generateVueFormComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}Form.vue`), formComponent);

  // Show Component
  const showComponent = generateVueShowComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}Show.vue`), showComponent);
}

/**
 * Generate Vue List Component
 */
function generateVueListComponent(modelName, fields) {
  const pluralName = modelName + "s";
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const tableHeaders = fields
    .map(
      (field) =>
        `                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ${field.name}
                    </th>`
    )
    .join("\n");

  const tableCells = fields
    .map(
      (field) =>
        `                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ ${variableName}.${field.name} }}
                        </td>`
    )
    .join("\n");

  return `<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">${pluralName}</h1>
            <router-link
                :to="{ name: '${kebabName}-create' }"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Create ${modelName}
            </router-link>
        </div>

        <div v-if="loading" class="text-center py-4">
            <p>Loading...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {{ error }}
        </div>

        <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
${tableHeaders}
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="${variableName} in ${variableName}s" :key="${variableName}.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ ${variableName}.id }}
                        </td>
${tableCells}
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <router-link
                                :to="{ name: '${kebabName}-show', params: { id: ${variableName}.id } }"
                                class="text-blue-600 hover:text-blue-900 mr-3"
                            >
                                View
                            </router-link>
                            <router-link
                                :to="{ name: '${kebabName}-edit', params: { id: ${variableName}.id } }"
                                class="text-green-600 hover:text-green-900 mr-3"
                            >
                                Edit
                            </router-link>
                            <button
                                @click="handleDelete(${variableName}.id)"
                                class="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="pagination" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button
                        @click="loadPage(pagination.current_page - 1)"
                        :disabled="!pagination.current_page || pagination.current_page === 1"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        @click="loadPage(pagination.current_page + 1)"
                        :disabled="pagination.current_page >= pagination.total_pages"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing page <span class="font-medium">{{ pagination.current_page }}</span> of 
                            <span class="font-medium">{{ pagination.total_pages }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { use${modelName}s } from '@/composables/use${pluralName}';

const { ${variableName}s, loading, error, pagination, fetch${pluralName}, delete${modelName} } = use${modelName}s();

onMounted(() => {
    fetch${pluralName}();
});

const loadPage = (page) => {
    if (page >= 1 && page <= pagination.value.total_pages) {
        fetch${pluralName}(page);
    }
};

const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this ${modelName}?')) {
        await delete${modelName}(id);
        fetch${pluralName}();
    }
};
</script>
`;
}

/**
 * Generate Vue Form Component
 */
function generateVueFormComponent(modelName, fields) {
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const formFields = fields
    .map((field) => {
      const inputType = getInputType(field.type);
      return `            <div>
                <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                    ${field.name}
                </label>
                <input
                    v-model="form.${field.name}"
                    type="${inputType}"
                    id="${field.name}"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    :class="{ 'border-red-500': errors.${field.name} }"
                />
                <p v-if="errors.${field.name}" class="mt-1 text-sm text-red-600">
                    {{ errors.${field.name}[0] }}
                </p>
            </div>`;
    })
    .join("\n\n");

  const initialForm = fields
    .map((field) => `        ${field.name}: '',`)
    .join("\n");

  return `<template>
    <div class="container mx-auto px-4 py-8 max-w-2xl">
        <h1 class="text-3xl font-bold mb-6">{{ isEditing ? 'Edit' : 'Create' }} ${modelName}</h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
${formFields}

            <div class="flex gap-4">
                <button
                    type="submit"
                    :disabled="loading"
                    class="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                </button>
                <router-link
                    :to="{ name: '${kebabName}-list' }"
                    class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                    Cancel
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { use${modelName}s } from '@/composables/use${modelName}s';

const route = useRoute();
const router = useRouter();
const { create${modelName}, update${modelName}, fetch${modelName}, loading, errors } = use${modelName}s();

const isEditing = computed(() => !!route.params.id);

const form = ref({
${initialForm}
});

onMounted(async () => {
    if (isEditing.value) {
        const ${variableName} = await fetch${modelName}(route.params.id);
        if (${variableName}) {
            form.value = { ...${variableName} };
        }
    }
});

const handleSubmit = async () => {
    try {
        if (isEditing.value) {
            await update${modelName}(route.params.id, form.value);
        } else {
            await create${modelName}(form.value);
        }
        router.push({ name: '${kebabName}-list' });
    } catch (error) {
        console.error('Error saving ${modelName}:', error);
    }
};
</script>
`;
}

/**
 * Generate Vue Show Component
 */
function generateVueShowComponent(modelName, fields) {
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const fieldDisplay = fields
    .map(
      (field) => `            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">
                    ${field.name}
                </label>
                <p class="text-lg">{{ ${variableName}.${field.name} }}</p>
            </div>`
    )
    .join("\n\n");

  return `<template>
    <div class="container mx-auto px-4 py-8 max-w-2xl">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">${modelName} Details</h1>
            <div class="space-x-2">
                <router-link
                    :to="{ name: '${kebabName}-edit', params: { id: $route.params.id } }"
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Edit
                </router-link>
                <router-link
                    :to="{ name: '${kebabName}-list' }"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </router-link>
            </div>
        </div>

        <div v-if="loading" class="text-center py-4">
            <p>Loading...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {{ error }}
        </div>

        <div v-else-if="${variableName}" class="bg-white shadow-md rounded-lg p-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">
                    ID
                </label>
                <p class="text-lg">{{ ${variableName}.id }}</p>
            </div>

${fieldDisplay}

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">
                    Created At
                </label>
                <p class="text-lg">{{ new Date(${variableName}.created_at).toLocaleString() }}</p>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">
                    Updated At
                </label>
                <p class="text-lg">{{ new Date(${variableName}.updated_at).toLocaleString() }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { use${modelName}s } from '@/composables/use${modelName}s';

const route = useRoute();
const { ${variableName}, loading, error, fetch${modelName} } = use${modelName}s();

onMounted(() => {
    fetch${modelName}(route.params.id);
});
</script>
`;
}

/**
 * Get input type for field
 */
function getInputType(fieldType) {
  const typeMap = {
    string: "text",
    text: "textarea",
    integer: "number",
    bigint: "number",
    decimal: "number",
    float: "number",
    double: "number",
    boolean: "checkbox",
    date: "date",
    datetime: "datetime-local",
    timestamp: "datetime-local",
  };
  return typeMap[fieldType] || "text";
}

/**
 * Create Vue Composables
 */
async function createVueComposables(rootPath, modelName) {
  const composablesPath = path.join(rootPath, "resources", "js", "composables");
  ensureDirectoryExists(composablesPath);

  const pluralName = modelName + "s";
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const content = `import { ref } from 'vue';
import axios from 'axios';

export function use${modelName}s() {
    const ${variableName}s = ref([]);
    const ${variableName} = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const errors = ref({});
    const pagination = ref(null);

    const fetch${pluralName} = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(\`/api/${kebabName}s?page=\${page}\`);
            ${variableName}s.value = response.data.data;
            pagination.value = response.data.meta || {
                current_page: response.data.current_page,
                total_pages: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
            };
        } catch (err) {
            error.value = err.response?.data?.message || err.message;
        } finally {
            loading.value = false;
        }
    };

    const fetch${modelName} = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(\`/api/${kebabName}s/\${id}\`);
            ${variableName}.value = response.data.data;
            return ${variableName}.value;
        } catch (err) {
            error.value = err.response?.data?.message || err.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const create${modelName} = async (data) => {
        loading.value = true;
        error.value = null;
        errors.value = {};
        try {
            const response = await axios.post('/api/${kebabName}s', data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                errors.value = err.response.data.errors;
            }
            error.value = err.response?.data?.message || err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const update${modelName} = async (id, data) => {
        loading.value = true;
        error.value = null;
        errors.value = {};
        try {
            const response = await axios.put(\`/api/${kebabName}s/\${id}\`, data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                errors.value = err.response.data.errors;
            }
            error.value = err.response?.data?.message || err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const delete${modelName} = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            await axios.delete(\`/api/${kebabName}s/\${id}\`);
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        ${variableName}s,
        ${variableName},
        loading,
        error,
        errors,
        pagination,
        fetch${pluralName},
        fetch${modelName},
        create${modelName},
        update${modelName},
        delete${modelName},
    };
}
`;

  fs.writeFileSync(
    path.join(composablesPath, `use${modelName}s.js`),
    content
  );
}

/**
 * Create React Components (List, Form, Show)
 */
async function createReactComponents(rootPath, modelName, fields) {
  const componentsPath = path.join(
    rootPath,
    "resources",
    "js",
    "components",
    modelName
  );
  ensureDirectoryExists(componentsPath);

  const pluralName = modelName + "s";

  // List Component
  const listComponent = generateReactListComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}List.jsx`), listComponent);

  // Form Component
  const formComponent = generateReactFormComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}Form.jsx`), formComponent);

  // Show Component
  const showComponent = generateReactShowComponent(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, `${modelName}Show.jsx`), showComponent);
}

/**
 * Generate React List Component
 */
function generateReactListComponent(modelName, fields) {
  const pluralName = modelName + "s";
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const tableHeaders = fields
    .map((field) => `                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${field.name}</th>`)
    .join("\n");

  const tableCells = fields
    .map((field) => `                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{${variableName}.${field.name}}</td>`)
    .join("\n");

  return `import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { use${modelName}s } from '@/hooks/use${pluralName}';

export default function ${modelName}List() {
    const { ${variableName}s, loading, error, pagination, fetch${pluralName}, delete${modelName} } = use${modelName}s();

    useEffect(() => {
        fetch${pluralName}();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ${modelName}?')) {
            await delete${modelName}(id);
            fetch${pluralName}();
        }
    };

    const loadPage = (page) => {
        if (page >= 1 && page <= pagination.total_pages) {
            fetch${pluralName}(page);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">${pluralName}</h1>
                <Link
                    to="/${kebabName}s/create"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create ${modelName}
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
${tableHeaders}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {${variableName}s.map((${variableName}) => (
                            <tr key={${variableName}.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{${variableName}.id}</td>
${tableCells}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                        to={\`/${kebabName}s/\${${variableName}.id}\`}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={\`/${kebabName}s/\${${variableName}.id}/edit\`}
                                        className="text-green-600 hover:text-green-900 mr-3"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(${variableName}.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => loadPage(pagination.current_page - 1)}
                                disabled={!pagination.current_page || pagination.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadPage(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.total_pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                                    <span className="font-medium">{pagination.total_pages}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
`;
}

/**
 * Generate React Form Component
 */
function generateReactFormComponent(modelName, fields) {
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const formFields = fields
    .map((field) => {
      const inputType = getInputType(field.type);
      return `            <div>
                <label htmlFor="${field.name}" className="block text-sm font-medium text-gray-700">
                    ${field.name}
                </label>
                <input
                    type="${inputType}"
                    id="${field.name}"
                    value={form.${field.name}}
                    onChange={(e) => setForm({ ...form, ${field.name}: e.target.value })}
                    className={\`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 \${errors.${field.name} ? 'border-red-500' : ''}\`}
                />
                {errors.${field.name} && (
                    <p className="mt-1 text-sm text-red-600">{errors.${field.name}[0]}</p>
                )}
            </div>`;
    })
    .join("\n\n");

  const initialForm = fields.map((field) => `        ${field.name}: '',`).join("\n");

  return `import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { use${modelName}s } from '@/hooks/use${modelName}s';

export default function ${modelName}Form() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const { create${modelName}, update${modelName}, fetch${modelName}, loading, errors } = use${modelName}s();

    const [form, setForm] = useState({
${initialForm}
    });

    useEffect(() => {
        if (isEditing) {
            const load${modelName} = async () => {
                const ${variableName} = await fetch${modelName}(id);
                if (${variableName}) {
                    setForm(${variableName});
                }
            };
            load${modelName}();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await update${modelName}(id, form);
            } else {
                await create${modelName}(form);
            }
            navigate('/${kebabName}s');
        } catch (error) {
            console.error('Error saving ${modelName}:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit' : 'Create'} ${modelName}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
${formFields}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                    </button>
                    <Link
                        to="/${kebabName}s"
                        className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
`;
}

/**
 * Generate React Show Component
 */
function generateReactShowComponent(modelName, fields) {
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const fieldDisplay = fields
    .map(
      (field) => `            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                    ${field.name}
                </label>
                <p className="text-lg">{${variableName}.${field.name}}</p>
            </div>`
    )
    .join("\n\n");

  return `import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { use${modelName}s } from '@/hooks/use${modelName}s';

export default function ${modelName}Show() {
    const { id } = useParams();
    const { ${variableName}, loading, error, fetch${modelName} } = use${modelName}s();

    useEffect(() => {
        fetch${modelName}(id);
    }, [id]);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error}
            </div>
        );
    }

    if (!${variableName}) {
        return <div>Not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">${modelName} Details</h1>
                <div className="space-x-2">
                    <Link
                        to={\`/${kebabName}s/\${id}/edit\`}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Edit
                    </Link>
                    <Link
                        to="/${kebabName}s"
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        ID
                    </label>
                    <p className="text-lg">{${variableName}.id}</p>
                </div>

${fieldDisplay}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Created At
                    </label>
                    <p className="text-lg">{new Date(${variableName}.created_at).toLocaleString()}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Updated At
                    </label>
                    <p className="text-lg">{new Date(${variableName}.updated_at).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
`;
}

/**
 * Create React Hooks
 */
async function createReactHooks(rootPath, modelName) {
  const hooksPath = path.join(rootPath, "resources", "js", "hooks");
  ensureDirectoryExists(hooksPath);

  const pluralName = modelName + "s";
  const kebabName = toKebabCase(modelName);
  const variableName = toCamelCase(modelName);

  const content = `import { useState } from 'react';
import axios from 'axios';

export function use${modelName}s() {
    const [${variableName}s, set${pluralName}] = useState([]);
    const [${variableName}, set${modelName}] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [pagination, setPagination] = useState(null);

    const fetch${pluralName} = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(\`/api/${kebabName}s?page=\${page}\`);
            set${pluralName}(response.data.data);
            setPagination(response.data.meta || {
                current_page: response.data.current_page,
                total_pages: response.data.last_page,
                per_page: response.data.per_page,
                total: response.data.total,
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetch${modelName} = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(\`/api/${kebabName}s/\${id}\`);
            set${modelName}(response.data.data);
            return response.data.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const create${modelName} = async (data) => {
        setLoading(true);
        setError(null);
        setErrors({});
        try {
            const response = await axios.post('/api/${kebabName}s', data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update${modelName} = async (id, data) => {
        setLoading(true);
        setError(null);
        setErrors({});
        try {
            const response = await axios.put(\`/api/${kebabName}s/\${id}\`, data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const delete${modelName} = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(\`/api/${kebabName}s/\${id}\`);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        ${variableName}s,
        ${variableName},
        loading,
        error,
        errors,
        pagination,
        fetch${pluralName},
        fetch${modelName},
        create${modelName},
        update${modelName},
        delete${modelName},
    };
}
`;

  fs.writeFileSync(path.join(hooksPath, `use${modelName}s.js`), content);
}

/**
 * Create API Routes
 */
async function createAPIRoutes(rootPath, modelName) {
  const apiRoutesPath = path.join(rootPath, "routes", "api.php");

  if (!fs.existsSync(apiRoutesPath)) {
    vscode.window.showWarningMessage("routes/api.php not found");
    return;
  }

  const kebabName = toKebabCase(modelName);
  const routeCode = `
// ${modelName} API Routes
Route::apiResource('${kebabName}s', App\\Http\\Controllers\\Api\\${modelName}Controller::class);
`;

  let content = fs.readFileSync(apiRoutesPath, "utf8");
  
  if (!content.includes(`${modelName} API Routes`)) {
    content += routeCode;
    fs.writeFileSync(apiRoutesPath, content);
  }
}

/**
 * Register Vue Routes
 */
async function registerVueRoutes(rootPath, modelName) {
  const routerPath = path.join(rootPath, "resources", "js", "router.js");
  
  if (!fs.existsSync(routerPath)) {
    vscode.window.showInformationMessage(
      "router.js not found. Please add Vue routes manually."
    );
    return;
  }

  const kebabName = toKebabCase(modelName);
  const pluralName = modelName + "s";

  const routeCode = `
    // ${modelName} Routes
    {
        path: '/${kebabName}s',
        name: '${kebabName}-list',
        component: () => import('@/components/${modelName}/${modelName}List.vue'),
    },
    {
        path: '/${kebabName}s/create',
        name: '${kebabName}-create',
        component: () => import('@/components/${modelName}/${modelName}Form.vue'),
    },
    {
        path: '/${kebabName}s/:id',
        name: '${kebabName}-show',
        component: () => import('@/components/${modelName}/${modelName}Show.vue'),
    },
    {
        path: '/${kebabName}s/:id/edit',
        name: '${kebabName}-edit',
        component: () => import('@/components/${modelName}/${modelName}Form.vue'),
    },`;

  let content = fs.readFileSync(routerPath, "utf8");
  
  if (!content.includes(`${modelName} Routes`)) {
    // Find routes array and add before the closing bracket
    const routesArrayMatch = content.match(/const routes = \[([\s\S]*?)\]/);
    if (routesArrayMatch) {
      const lastRouteIndex = content.lastIndexOf("}") - 1;
      content = content.slice(0, lastRouteIndex) + routeCode + content.slice(lastRouteIndex);
      fs.writeFileSync(routerPath, content);
    }
  }
}

/**
 * Register React Routes
 */
async function registerReactRoutes(rootPath, modelName) {
  const routerPath = path.join(rootPath, "resources", "js", "router.jsx");
  
  if (!fs.existsSync(routerPath)) {
    vscode.window.showInformationMessage(
      "router.jsx not found. Please add React routes manually."
    );
    return;
  }

  const kebabName = toKebabCase(modelName);
  const pluralName = modelName + "s";

  const routeCode = `
            {/* ${modelName} Routes */}
            <Route path="/${kebabName}s" element={<${modelName}List />} />
            <Route path="/${kebabName}s/create" element={<${modelName}Form />} />
            <Route path="/${kebabName}s/:id" element={<${modelName}Show />} />
            <Route path="/${kebabName}s/:id/edit" element={<${modelName}Form />} />`;

  const importCode = `import ${modelName}List from '@/components/${modelName}/${modelName}List';
import ${modelName}Form from '@/components/${modelName}/${modelName}Form';
import ${modelName}Show from '@/components/${modelName}/${modelName}Show';
`;

  let content = fs.readFileSync(routerPath, "utf8");
  
  if (!content.includes(`${modelName} Routes`)) {
    // Add imports at the top
    const importMatch = content.match(/import.*from.*;\n/);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
      content = content.slice(0, lastImportIndex) + importCode + content.slice(lastImportIndex);
    }
    
    // Add routes
    const routesMatch = content.match(/<Routes>([\s\S]*?)<\/Routes>/);
    if (routesMatch) {
      const lastRouteIndex = content.lastIndexOf("</Route>") + "</Route>".length;
      content = content.slice(0, lastRouteIndex) + routeCode + content.slice(lastRouteIndex);
    }
    
    fs.writeFileSync(routerPath, content);
  }
}

module.exports = {
  generateVueCRUD,
  generateReactCRUD,
};
