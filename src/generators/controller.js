const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const {
  getLaravelRootPath,
  showInputBox,
  toPascalCase,
  toSnakeCase,
  toCamelCase,
  ensureDirectoryExists,
  executeArtisanCommand,
} = require("../utils/helpers");

/**
 * Advanced Controller Generator with granular control
 */
async function generateController() {
  const controllerName = await showInputBox({
    prompt: "Controller name (e.g., ProductController, Api/ProductController)",
    placeHolder: "ProductController",
    validateInput: (value) => {
      if (!value) return "Controller name is required";
      return null;
    },
  });

  if (!controllerName) return;

  // Select controller type
  const controllerType = await vscode.window.showQuickPick(
    [
      {
        label: "$(file) Empty Controller",
        description: "Basic controller with no methods",
        value: "empty",
      },
      {
        label: "$(symbol-method) Single Action (Invokable)",
        description: "Controller with single __invoke method",
        value: "invokable",
      },
      {
        label: "$(server) Resource Controller",
        description:
          "RESTful controller with 7 methods (index, create, store, show, edit, update, destroy)",
        value: "resource",
      },
      {
        label: "$(json) API Resource Controller",
        description: "API controller without create/edit views (5 methods)",
        value: "api",
      },
      {
        label: "$(link) Model Resource Controller",
        description: "Resource controller with model binding and type hints",
        value: "model",
      },
      {
        label: "$(settings-gear) Custom Methods",
        description: "Choose specific methods to include",
        value: "custom",
      },
    ],
    { placeHolder: "Select controller type" }
  );

  if (!controllerType) return;

  let modelName = "";
  let selectedMethods = [];
  let useFormRequests = false;
  let useAuthorization = false;
  let useResourceClass = false;

  // Handle model-based controllers
  if (controllerType.value === "model" || controllerType.value === "resource") {
    modelName = await showInputBox({
      prompt: "Model name (e.g., Product, Blog/Post)",
      placeHolder: "Product",
    });

    if (!modelName) return;

    // Ask for additional features
    const features = await vscode.window.showQuickPick(
      [
        {
          label: "$(shield) Use Form Requests",
          description: "Generate and use Form Request classes",
          value: "formRequests",
        },
        {
          label: "$(lock) Use Authorization",
          description: "Add policy authorization checks",
          value: "authorization",
        },
        {
          label: "$(json) Use API Resources",
          description: "Transform responses using API Resources",
          value: "resources",
        },
        {
          label: "$(database) Eager Load Relations",
          description: "Add relationship eager loading",
          value: "eagerLoad",
        },
      ],
      {
        placeHolder: "Select additional features (multi-select)",
        canPickMany: true,
      }
    );

    if (features) {
      useFormRequests = features.some((f) => f.value === "formRequests");
      useAuthorization = features.some((f) => f.value === "authorization");
      useResourceClass = features.some((f) => f.value === "resources");
    }
  }

  // Handle custom methods selection
  if (controllerType.value === "custom") {
    const methods = await vscode.window.showQuickPick(
      [
        {
          label: "index",
          description: "Display listing of resources",
          picked: true,
        },
        { label: "create", description: "Show form for creating new resource" },
        {
          label: "store",
          description: "Store newly created resource",
          picked: true,
        },
        { label: "show", description: "Display specified resource" },
        { label: "edit", description: "Show form for editing resource" },
        {
          label: "update",
          description: "Update specified resource",
          picked: true,
        },
        {
          label: "destroy",
          description: "Remove specified resource",
          picked: true,
        },
        { label: "search", description: "Search resources" },
        { label: "export", description: "Export resources to file" },
        { label: "import", description: "Import resources from file" },
        { label: "restore", description: "Restore soft-deleted resource" },
        { label: "forceDelete", description: "Permanently delete resource" },
      ],
      {
        placeHolder: "Select methods to include (multi-select)",
        canPickMany: true,
      }
    );

    if (!methods || methods.length === 0) return;
    selectedMethods = methods.map((m) => m.label);
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating ${controllerName}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 20, message: "Creating controller..." });

        if (controllerType.value === "empty") {
          await createEmptyController(controllerName);
        } else if (controllerType.value === "invokable") {
          await executeArtisanCommand(
            `make:controller ${controllerName} --invokable`,
            false
          );
        } else if (controllerType.value === "resource") {
          await executeArtisanCommand(
            `make:controller ${controllerName} --resource`,
            false
          );
        } else if (controllerType.value === "api") {
          await executeArtisanCommand(
            `make:controller ${controllerName} --api`,
            false
          );
        } else if (controllerType.value === "model") {
          await createModelController(
            controllerName,
            modelName,
            useFormRequests,
            useAuthorization,
            useResourceClass
          );
        } else if (controllerType.value === "custom") {
          await createCustomController(
            controllerName,
            selectedMethods,
            modelName
          );
        }

        // Generate Form Requests if needed
        if (useFormRequests && modelName) {
          progress.report({
            increment: 40,
            message: "Creating form requests...",
          });
          const baseModelName = modelName.split("/").pop();
          await executeArtisanCommand(
            `make:request Store${baseModelName}Request`,
            false
          );
          await executeArtisanCommand(
            `make:request Update${baseModelName}Request`,
            false
          );
        }

        // Generate Resource if needed
        if (useResourceClass && modelName) {
          progress.report({
            increment: 40,
            message: "Creating API resources...",
          });
          const baseModelName = modelName.split("/").pop();
          await executeArtisanCommand(
            `make:resource ${baseModelName}Resource`,
            false
          );
        }

        progress.report({ increment: 0, message: "Completed!" });
      }
    );

    vscode.window.showInformationMessage(
      `✅ Controller ${controllerName} generated successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error generating controller: ${error.message}`
    );
  }
}

/**
 * Create empty controller
 */
async function createEmptyController(controllerName) {
  const rootPath = getLaravelRootPath();
  const controllerPath = path.join(
    rootPath,
    "app",
    "Http",
    "Controllers",
    `${controllerName}.php`
  );

  const namespace = "App\\Http\\Controllers";

  const content = `<?php

namespace ${namespace};

use Illuminate\\Http\\Request;

class ${controllerName} extends Controller
{
    //
}
`;

  ensureDirectoryExists(path.dirname(controllerPath));
  fs.writeFileSync(controllerPath, content);
}

/**
 * Create model-based controller with advanced features
 */
async function createModelController(
  controllerName,
  modelName,
  useFormRequests,
  useAuthorization,
  useResourceClass
) {
  const rootPath = getLaravelRootPath();

  // Parse paths
  const controllerParts = controllerName.replace("Controller", "").split("/");
  const modelParts = modelName.split("/");
  const baseModelName = modelParts[modelParts.length - 1];
  const modelVariable = toCamelCase(baseModelName);
  const modelVariablePlural = modelVariable + "s";

  const controllerDir =
    controllerParts.length > 1
      ? path.join(
          rootPath,
          "app",
          "Http",
          "Controllers",
          ...controllerParts.slice(0, -1)
        )
      : path.join(rootPath, "app", "Http", "Controllers");

  ensureDirectoryExists(controllerDir);

  const controllerPath = path.join(
    controllerDir,
    `${controllerParts[controllerParts.length - 1]}Controller.php`
  );

  const namespace =
    controllerParts.length > 1
      ? `App\\Http\\Controllers\\${controllerParts.slice(0, -1).join("\\")}`
      : "App\\Http\\Controllers";

  const modelNamespace =
    modelParts.length > 1
      ? `App\\Models\\${modelParts.join("\\")}`
      : `App\\Models\\${modelName}`;

  // Build use statements
  const useStatements = [
    `use ${modelNamespace};`,
    "use Illuminate\\Http\\Request;",
  ];

  if (useFormRequests) {
    useStatements.push(
      `use App\\Http\\Requests\\Store${baseModelName}Request;`
    );
    useStatements.push(
      `use App\\Http\\Requests\\Update${baseModelName}Request;`
    );
  }

  if (useResourceClass) {
    useStatements.push(`use App\\Http\\Resources\\${baseModelName}Resource;`);
  }

  // Build methods
  const storeRequest = useFormRequests
    ? `Store${baseModelName}Request $request`
    : "Request $request";
  const updateRequest = useFormRequests
    ? `Update${baseModelName}Request $request`
    : "Request $request";

  const authCheck = useAuthorization
    ? `\n        $this->authorize('viewAny', ${baseModelName}::class);\n`
    : "";
  const authCheckSingle = useAuthorization
    ? `\n        $this->authorize('view', $${modelVariable});\n`
    : "";
  const authCheckStore = useAuthorization
    ? `\n        $this->authorize('create', ${baseModelName}::class);\n`
    : "";
  const authCheckUpdate = useAuthorization
    ? `\n        $this->authorize('update', $${modelVariable});\n`
    : "";
  const authCheckDelete = useAuthorization
    ? `\n        $this->authorize('delete', $${modelVariable});\n`
    : "";

  const returnFormat = useResourceClass
    ? `${baseModelName}Resource::collection($${modelVariablePlural})`
    : `$${modelVariablePlural}`;

  const returnSingle = useResourceClass
    ? `new ${baseModelName}Resource($${modelVariable})`
    : `$${modelVariable}`;

  const content = `<?php

namespace ${namespace};

${useStatements.join("\n")}

class ${
    controllerParts[controllerParts.length - 1]
  }Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {${authCheck}
        $${modelVariablePlural} = ${baseModelName}::latest()->paginate(15);

        return ${returnFormat};
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {${authCheckStore}
        return view('${modelVariable}.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(${storeRequest})
    {${authCheckStore}
        $${modelVariable} = ${baseModelName}::create($request->validated());

        return redirect()
            ->route('${modelVariable}.show', $${modelVariable})
            ->with('success', '${baseModelName} created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(${baseModelName} $${modelVariable})
    {${authCheckSingle}
        return ${returnSingle};
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(${baseModelName} $${modelVariable})
    {${authCheckUpdate}
        return view('${modelVariable}.edit', compact('${modelVariable}'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(${updateRequest}, ${baseModelName} $${modelVariable})
    {${authCheckUpdate}
        $${modelVariable}->update($request->validated());

        return redirect()
            ->route('${modelVariable}.show', $${modelVariable})
            ->with('success', '${baseModelName} updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(${baseModelName} $${modelVariable})
    {${authCheckDelete}
        $${modelVariable}->delete();

        return redirect()
            ->route('${modelVariable}.index')
            ->with('success', '${baseModelName} deleted successfully');
    }
}
`;

  fs.writeFileSync(controllerPath, content);
}

/**
 * Create custom controller with selected methods
 */
async function createCustomController(controllerName, methods, modelName) {
  const rootPath = getLaravelRootPath();
  const controllerPath = path.join(
    rootPath,
    "app",
    "Http",
    "Controllers",
    `${controllerName}.php`
  );

  const methodImplementations = {
    index: `    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }`,
    create: `    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }`,
    store: `    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }`,
    show: `    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }`,
    edit: `    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }`,
    update: `    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }`,
    destroy: `    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }`,
    search: `    /**
     * Search for resources.
     */
    public function search(Request $request)
    {
        //
    }`,
    export: `    /**
     * Export resources to file.
     */
    public function export()
    {
        //
    }`,
    import: `    /**
     * Import resources from file.
     */
    public function import(Request $request)
    {
        //
    }`,
    restore: `    /**
     * Restore a soft-deleted resource.
     */
    public function restore(string $id)
    {
        //
    }`,
    forceDelete: `    /**
     * Permanently delete the resource.
     */
    public function forceDelete(string $id)
    {
        //
    }`,
  };

  const selectedMethodsCode = methods
    .map((method) => methodImplementations[method])
    .join("\n\n");

  const content = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class ${controllerName} extends Controller
{
${selectedMethodsCode}
}
`;

  ensureDirectoryExists(path.dirname(controllerPath));
  fs.writeFileSync(controllerPath, content);
}

module.exports = {
  generateController,
};
