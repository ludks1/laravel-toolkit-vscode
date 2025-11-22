const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const {
  getLaravelRootPath,
  showInputBox,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Generates a complete REST API for a model
 */
async function generateAPI() {
  const modelName = await showInputBox({
    prompt: "Model name for REST API (e.g: Product)",
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

  // API configuration options
  const apiType = await vscode.window.showQuickPick(
    [
      {
        label: "🚀 Complete REST API",
        value: "complete",
        description:
          "Model, Controller, Resource, Request, Routes, Tests - Everything",
      },
      {
        label: "📦 Basic REST API",
        value: "basic",
        description: "Controller with CRUD operations and routes",
      },
      {
        label: "🎯 Custom REST API",
        value: "custom",
        description: "Select specific components to generate",
      },
    ],
    { placeHolder: "Select API type" }
  );

  if (!apiType) return;

  // Define what to generate based on selection
  let components = {
    model: false,
    migration: false,
    controller: true,
    resource: false,
    collection: false,
    requests: false,
    routes: true,
    tests: false,
    policy: false,
  };

  if (apiType.value === "complete") {
    components = {
      model: true,
      migration: true,
      controller: true,
      resource: true,
      collection: true,
      requests: true,
      routes: true,
      tests: true,
      policy: true,
    };
  } else if (apiType.value === "custom") {
    const selected = await vscode.window.showQuickPick(
      [
        { label: "Model", picked: false },
        { label: "Migration", picked: false },
        { label: "API Controller", picked: true },
        { label: "API Resource", picked: false },
        { label: "Resource Collection", picked: false },
        { label: "Form Requests (Store/Update)", picked: false },
        { label: "API Routes", picked: true },
        { label: "API Tests", picked: false },
        { label: "Policy", picked: false },
      ],
      {
        canPickMany: true,
        placeHolder: "Select components to generate",
      }
    );

    if (!selected || selected.length === 0) return;

    components.model = selected.some((s) => s.label === "Model");
    components.migration = selected.some((s) => s.label === "Migration");
    components.controller = selected.some((s) => s.label === "API Controller");
    components.resource = selected.some((s) => s.label === "API Resource");
    components.collection = selected.some(
      (s) => s.label === "Resource Collection"
    );
    components.requests = selected.some(
      (s) => s.label === "Form Requests (Store/Update)"
    );
    components.routes = selected.some((s) => s.label === "API Routes");
    components.tests = selected.some((s) => s.label === "API Tests");
    components.policy = selected.some((s) => s.label === "Policy");
  }

  // Additional options
  const useVersioning = await vscode.window.showQuickPick(
    [
      { label: "No versioning", value: false },
      { label: "API v1", value: "v1" },
      { label: "API v2", value: "v2" },
    ],
    { placeHolder: "API versioning?" }
  );

  if (useVersioning === undefined) return;

  const apiVersion = useVersioning.value || null;

  // Authentication
  const useAuth = await vscode.window.showQuickPick(
    [
      { label: "No authentication", value: "none" },
      { label: "Sanctum (Recommended)", value: "sanctum" },
      { label: "Passport", value: "passport" },
      { label: "JWT", value: "jwt" },
    ],
    { placeHolder: "Authentication type?" }
  );

  if (!useAuth) return;

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating REST API for ${modelName}`,
        cancellable: false,
      },
      async (progress) => {
        const rootPath = getLaravelRootPath();

        progress.report({ increment: 10, message: "Creating Model..." });
        if (components.model) {
          try {
            await createModel(rootPath, modelName, components.migration);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating model: ${error.message}`
            );
          }
        }

        progress.report({ increment: 15, message: "Creating Controller..." });
        if (components.controller) {
          try {
            await createAPIController(
              rootPath,
              modelName,
              apiVersion,
              useAuth.value
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating controller: ${error.message}`
            );
          }
        }

        progress.report({ increment: 15, message: "Creating Resource..." });
        if (components.resource) {
          try {
            await createAPIResource(rootPath, modelName, apiVersion);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating resource: ${error.message}`
            );
          }
        }

        progress.report({ increment: 15, message: "Creating Collection..." });
        if (components.collection) {
          try {
            await createAPICollection(rootPath, modelName, apiVersion);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating collection: ${error.message}`
            );
          }
        }

        progress.report({ increment: 15, message: "Creating Requests..." });
        if (components.requests) {
          try {
            await createFormRequests(rootPath, modelName);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating requests: ${error.message}`
            );
          }
        }

        progress.report({ increment: 10, message: "Creating Routes..." });
        if (components.routes) {
          try {
            await createAPIRoutes(
              rootPath,
              modelName,
              apiVersion,
              useAuth.value
            );
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating routes: ${error.message}`
            );
          }
        }

        progress.report({ increment: 10, message: "Creating Tests..." });
        if (components.tests) {
          try {
            await createAPITests(rootPath, modelName, apiVersion);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating tests: ${error.message}`
            );
          }
        }

        progress.report({ increment: 10, message: "Creating Policy..." });
        if (components.policy) {
          try {
            await createPolicy(rootPath, modelName);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error creating policy: ${error.message}`
            );
          }
        }

        progress.report({ increment: 10, message: "Done!" });
      }
    );

    vscode.window.showInformationMessage(
      `✅ REST API for ${modelName} generated successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Creates Model
 */
async function createModel(rootPath, modelName, withMigration) {
  const modelPath = path.join(rootPath, "app", "Models", `${modelName}.php`);

  // Check if model already exists
  if (fs.existsSync(modelPath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Model ${modelName} already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

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
        'name',
        // Add your fillable attributes here
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
 * Creates API Controller
 */
async function createAPIController(rootPath, modelName, version, authType) {
  const controllerPath = path.join(
    rootPath,
    "app",
    "Http",
    "Controllers",
    "Api",
    version ? version.toUpperCase() : "",
    `${modelName}Controller.php`
  );

  // Check if controller already exists
  if (fs.existsSync(controllerPath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Controller ${modelName}Controller already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

  const namespace = version
    ? `App\\Http\\Controllers\\Api\\${version.toUpperCase()}`
    : "App\\Http\\Controllers\\Api";

  const authMiddleware =
    authType === "sanctum"
      ? "auth:sanctum"
      : authType === "passport"
      ? "auth:api"
      : authType === "jwt"
      ? "jwt.auth"
      : null;

  const middlewareComment = authMiddleware
    ? `
    /**
     * Instantiate a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('${authMiddleware}');
    }
`
    : "";

  const resourceImport = version
    ? `use App\\Http\\Resources\\${version.toUpperCase()}\\${modelName}Resource;`
    : `use App\\Http\\Resources\\${modelName}Resource;`;

  const content = `<?php

namespace ${namespace};

use App\\Http\\Controllers\\Controller;
use App\\Models\\${modelName};
${resourceImport}
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

class ${modelName}Controller extends Controller
{${middlewareComment}
    /**
     * Display a listing of the resource.
     *
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $${toSnakeCase(modelName)}s = ${modelName}::query()
            ->latest()
            ->paginate(15);

        return ${modelName}Resource::collection($${toSnakeCase(modelName)}s);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Add your validation rules here
        ]);

        $${toSnakeCase(modelName)} = ${modelName}::create($validated);

        return (new ${modelName}Resource($${toSnakeCase(modelName)}))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     *
     * @param ${modelName} $${toSnakeCase(modelName)}
     * @return ${modelName}Resource
     */
    public function show(${modelName} $${toSnakeCase(
    modelName
  )}): ${modelName}Resource
    {
        return new ${modelName}Resource($${toSnakeCase(modelName)});
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param ${modelName} $${toSnakeCase(modelName)}
     * @return ${modelName}Resource
     */
    public function update(Request $request, ${modelName} $${toSnakeCase(
    modelName
  )}): ${modelName}Resource
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // Add your validation rules here
        ]);

        $${toSnakeCase(modelName)}->update($validated);

        return new ${modelName}Resource($${toSnakeCase(modelName)});
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param ${modelName} $${toSnakeCase(modelName)}
     * @return JsonResponse
     */
    public function destroy(${modelName} $${toSnakeCase(
    modelName
  )}): JsonResponse
    {
        $${toSnakeCase(modelName)}->delete();

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
 * Creates API Resource
 */
async function createAPIResource(rootPath, modelName, version) {
  const resourcePath = path.join(
    rootPath,
    "app",
    "Http",
    "Resources",
    version ? version.toUpperCase() : "",
    `${modelName}Resource.php`
  );

  // Check if resource already exists
  if (fs.existsSync(resourcePath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Resource ${modelName}Resource already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

  const namespace = version
    ? `App\\Http\\Resources\\${version.toUpperCase()}`
    : "App\\Http\\Resources";

  const content = `<?php

namespace ${namespace};

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${modelName}Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            // Add your resource attributes here
        ];
    }
}
`;

  ensureDirectoryExists(path.dirname(resourcePath));
  fs.writeFileSync(resourcePath, content);
}

/**
 * Creates API Resource Collection
 */
async function createAPICollection(rootPath, modelName, version) {
  const collectionPath = path.join(
    rootPath,
    "app",
    "Http",
    "Resources",
    version ? version.toUpperCase() : "",
    `${modelName}Collection.php`
  );

  // Check if collection already exists
  if (fs.existsSync(collectionPath)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Collection ${modelName}Collection already exists. Overwrite?`,
      "Yes",
      "No"
    );
    if (overwrite !== "Yes") {
      return;
    }
  }

  const namespace = version
    ? `App\\Http\\Resources\\${version.toUpperCase()}`
    : "App\\Http\\Resources";

  const content = `<?php

namespace ${namespace};

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\ResourceCollection;

class ${modelName}Collection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'total_pages' => $this->lastPage(),
            ],
        ];
    }
}
`;

  ensureDirectoryExists(path.dirname(collectionPath));
  fs.writeFileSync(collectionPath, content);
}

/**
 * Creates Form Requests
 */
async function createFormRequests(rootPath, modelName) {
  // Store Request
  const storeRequestPath = path.join(
    rootPath,
    "app",
    "Http",
    "Requests",
    `Store${modelName}Request.php`
  );

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
            'name' => 'required|string|max:255',
            // Add your validation rules here
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            // Add your custom messages here
        ];
    }
}
`;

  // Update Request
  const updateRequestPath = path.join(
    rootPath,
    "app",
    "Http",
    "Requests",
    `Update${modelName}Request.php`
  );

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
            'name' => 'sometimes|required|string|max:255',
            // Add your validation rules here
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            // Add your custom messages here
        ];
    }
}
`;

  ensureDirectoryExists(path.dirname(storeRequestPath));
  fs.writeFileSync(storeRequestPath, storeContent);
  fs.writeFileSync(updateRequestPath, updateContent);
}

/**
 * Creates API Routes
 */
async function createAPIRoutes(rootPath, modelName, version, authType) {
  const apiRoutesPath = path.join(rootPath, "routes", "api.php");

  if (!fs.existsSync(apiRoutesPath)) {
    vscode.window.showWarningMessage("routes/api.php not found");
    return;
  }

  const versionPrefix = version ? `/${version}` : "";
  const controllerNamespace = version
    ? `App\\Http\\Controllers\\Api\\${version.toUpperCase()}\\${modelName}Controller`
    : `App\\Http\\Controllers\\Api\\${modelName}Controller`;

  const routeGroup = `
// ${modelName} API Routes
Route::prefix('${versionPrefix}')->group(function () {
    Route::apiResource('${toKebabCase(
      modelName
    )}s', \\${controllerNamespace}::class);
});
`;

  let content = fs.readFileSync(apiRoutesPath, "utf8");

  // Add route if not already present
  if (!content.includes(`${modelName} API Routes`)) {
    content += routeGroup;
    fs.writeFileSync(apiRoutesPath, content);
  }
}

/**
 * Creates API Tests
 */
async function createAPITests(rootPath, modelName, version) {
  const testPath = path.join(
    rootPath,
    "tests",
    "Feature",
    `${modelName}ApiTest.php`
  );

  const versionPrefix = version ? `/${version}` : "";
  const endpoint = `${versionPrefix}/${toKebabCase(modelName)}s`;

  const content = `<?php

namespace Tests\\Feature;

use App\\Models\\${modelName};
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Tests\\TestCase;

class ${modelName}ApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api${endpoint}
     */
    public function test_can_list_${toSnakeCase(modelName)}s(): void
    {
        ${modelName}::factory()->count(3)->create();

        $response = $this->getJson('/api${endpoint}');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'created_at', 'updated_at']
                ]
            ]);
    }

    /**
     * Test POST /api${endpoint}
     */
    public function test_can_create_${toSnakeCase(modelName)}(): void
    {
        $data = [
            'name' => 'Test ${modelName}',
        ];

        $response = $this->postJson('/api${endpoint}', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'created_at', 'updated_at']
            ]);

        $this->assertDatabaseHas('${toSnakeCase(modelName)}s', [
            'name' => 'Test ${modelName}',
        ]);
    }

    /**
     * Test GET /api${endpoint}/{id}
     */
    public function test_can_show_${toSnakeCase(modelName)}(): void
    {
        $${toSnakeCase(modelName)} = ${modelName}::factory()->create();

        $response = $this->getJson("/api${endpoint}/{$${toSnakeCase(
    modelName
  )}->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $${toSnakeCase(modelName)}->id,
                    'name' => $${toSnakeCase(modelName)}->name,
                ]
            ]);
    }

    /**
     * Test PUT /api${endpoint}/{id}
     */
    public function test_can_update_${toSnakeCase(modelName)}(): void
    {
        $${toSnakeCase(modelName)} = ${modelName}::factory()->create();

        $data = [
            'name' => 'Updated ${modelName}',
        ];

        $response = $this->putJson("/api${endpoint}/{$${toSnakeCase(
    modelName
  )}->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $${toSnakeCase(modelName)}->id,
                    'name' => 'Updated ${modelName}',
                ]
            ]);
    }

    /**
     * Test DELETE /api${endpoint}/{id}
     */
    public function test_can_delete_${toSnakeCase(modelName)}(): void
    {
        $${toSnakeCase(modelName)} = ${modelName}::factory()->create();

        $response = $this->deleteJson("/api${endpoint}/{$${toSnakeCase(
    modelName
  )}->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('${toSnakeCase(modelName)}s', [
            'id' => $${toSnakeCase(modelName)}->id,
        ]);
    }

    /**
     * Test validation errors
     */
    public function test_validation_errors_on_create(): void
    {
        $response = $this->postJson('/api${endpoint}', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test 404 on non-existent resource
     */
    public function test_returns_404_for_non_existent_${toSnakeCase(
      modelName
    )}(): void
    {
        $response = $this->getJson('/api${endpoint}/999999');

        $response->assertStatus(404);
    }
}
`;

  ensureDirectoryExists(path.dirname(testPath));
  fs.writeFileSync(testPath, content);
}

/**
 * Creates Policy
 */
async function createPolicy(rootPath, modelName) {
  const policyPath = path.join(
    rootPath,
    "app",
    "Policies",
    `${modelName}Policy.php`
  );

  const content = `<?php

namespace App\\Policies;

use App\\Models\\${modelName};
use App\\Models\\User;

class ${modelName}Policy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ${modelName} $${toSnakeCase(
    modelName
  )}): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ${modelName} $${toSnakeCase(
    modelName
  )}): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ${modelName} $${toSnakeCase(
    modelName
  )}): bool
    {
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ${modelName} $${toSnakeCase(
    modelName
  )}): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ${modelName} $${toSnakeCase(
    modelName
  )}): bool
    {
        return true;
    }
}
`;

  ensureDirectoryExists(path.dirname(policyPath));
  fs.writeFileSync(policyPath, content);
}

module.exports = {
  generateAPI,
};
