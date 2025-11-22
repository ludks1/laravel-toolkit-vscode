const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  showQuickPick,
  toPascalCase,
  toKebabCase,
  toSnakeCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Sistema completo de gestión de rutas modulares
 */

/**
 * Generates route files organized by modules
 */
async function generateRouteFile() {
  const moduleName = await showInputBox({
    prompt: "Module/resource name for routes",
    placeHolder: "products, users, orders",
    validateInput: (value) => {
      if (!value) return "Name is required";
      return null;
    },
  });

  if (!moduleName) return;

  // Route type
  const routeType = await showQuickPick(
    [
      {
        label: "🌐 Web Routes (views)",
        value: "web",
        description: "Routes for traditional web views",
      },
      {
        label: "📡 API Routes (JSON)",
        value: "api",
        description: "Routes for REST API",
      },
      {
        label: "👤 Auth Routes",
        value: "auth",
        description: "Authentication routes",
      },
      {
        label: "👑 Admin Routes",
        value: "admin",
        description: "Administration panel routes",
      },
      {
        label: "🔒 Protected Routes",
        value: "protected",
        description: "Routes with authentication middleware",
      },
      {
        label: "🌍 Public Routes",
        value: "public",
        description: "Public routes without authentication",
      },
    ],
    { placeHolder: "Route type to generate" }
  );

  if (!routeType) return;
  
  // Extract value from the returned object
  // @ts-ignore - showQuickPick returns the selected item with value property
  const selectedRouteType = routeType.value || routeType;

  // Associated controller
  const controllerName = await showInputBox({
    prompt: "Associated Controller name",
    placeHolder: `${toPascalCase(moduleName)}Controller`,
    value: `${toPascalCase(moduleName)}Controller`,
  });

  if (!controllerName) return;

  // Select specific routes to create
  const selectedRoutes = await selectRoutesToCreate(routeType.value);
  if (!selectedRoutes || selectedRoutes.length === 0) return;

  // Additional options
  const options = await configureRouteOptions(selectedRouteType);
  if (!options) return;

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating routes for ${moduleName}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 30, message: "Creando estructura..." });

        // Create route file
        const routeFilePath = await createRouteFile(
          moduleName,
          selectedRouteType,
          controllerName,
          selectedRoutes,
          options
        );

        progress.report({
          increment: 40,
          message: "Registrando en RouteServiceProvider...",
        });

        // Actualizar RouteServiceProvider
        await updateRouteServiceProvider(
          moduleName,
          selectedRouteType,
          routeFilePath
        );
        
        // Add require to web.php or api.php
        await addRequireToMainRouteFile(
          moduleName,
          selectedRouteType,
          routeFilePath
        );

        progress.report({ increment: 30, message: "Finalizando..." });
      }
    );

    vscode.window.showInformationMessage(
      `✅ Route file ${moduleName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Allows selecting which routes to create
 */
async function selectRoutesToCreate(routeType) {
  const availableRoutes = getAvailableRoutes(routeType);

  const selected = await vscode.window.showQuickPick(availableRoutes, {
    placeHolder:
      "Select routes to create (use space to select multiple)",
    canPickMany: true,
  });

  return selected;
}

/**
 * Gets available routes based on type
 */
function getAvailableRoutes(routeType) {
  const baseRoutes = [
    {
      label: "📋 index",
      value: "index",
      method: "GET",
      description: "Listar todos los registros",
    },
    {
      label: "➕ create",
      value: "create",
      method: "GET",
      description: "Formulario de creación",
    },
    {
      label: "💾 store",
      value: "store",
      method: "POST",
      description: "Guardar nuevo registro",
    },
    {
      label: "👁️ show",
      value: "show",
      method: "GET",
      description: "Ver detalle de un registro",
    },
    {
      label: "✏️ edit",
      value: "edit",
      method: "GET",
      description: "Formulario de edición",
    },
    {
      label: "🔄 update",
      value: "update",
      method: "PUT/PATCH",
      description: "Actualizar registro",
    },
    {
      label: "🗑️ destroy",
      value: "destroy",
      method: "DELETE",
      description: "Eliminar registro",
    },
  ];

  const apiRoutes = [
    {
      label: "📋 index",
      value: "index",
      method: "GET",
      description: "GET /resource",
    },
    {
      label: "💾 store",
      value: "store",
      method: "POST",
      description: "POST /resource",
    },
    {
      label: "👁️ show",
      value: "show",
      method: "GET",
      description: "GET /resource/{id}",
    },
    {
      label: "🔄 update",
      value: "update",
      method: "PUT",
      description: "PUT /resource/{id}",
    },
    {
      label: "🗑️ destroy",
      value: "destroy",
      method: "DELETE",
      description: "DELETE /resource/{id}",
    },
    {
      label: "🔍 search",
      value: "search",
      method: "GET",
      description: "GET /resource/search",
    },
    {
      label: "📊 export",
      value: "export",
      method: "GET",
      description: "GET /resource/export",
    },
  ];

  const authRoutes = [
    {
      label: "🔐 login",
      value: "login",
      method: "GET/POST",
      description: "Login form and process",
    },
    {
      label: "📝 register",
      value: "register",
      method: "GET/POST",
      description: "Register form and process",
    },
    {
      label: "🚪 logout",
      value: "logout",
      method: "POST",
      description: "Logout user",
    },
    {
      label: "🔑 forgot-password",
      value: "forgot",
      method: "GET/POST",
      description: "Password reset request",
    },
    {
      label: "🔄 reset-password",
      value: "reset",
      method: "GET/POST",
      description: "Password reset",
    },
    {
      label: "✉️ verify-email",
      value: "verify",
      method: "GET",
      description: "Email verification",
    },
  ];

  if (routeType === "api") return apiRoutes;
  if (routeType === "auth") return authRoutes;
  return baseRoutes;
}

/**
 * Configures additional route options
 */
async function configureRouteOptions(routeType) {
  const options = {
    prefix: "",
    middleware: [],
    namespace: "",
    name: "",
  };

  // Prefijo de ruta
  const prefix = await showInputBox({
    prompt: "Prefijo para las rutas (opcional, ej: admin, v1)",
    placeHolder: routeType === "admin" ? "admin" : "",
  });
  options.prefix = prefix || "";

  // Middleware
  const middlewareOptions = await vscode.window.showQuickPick(
    [
      {
        label: "🔒 auth",
        value: "auth",
        description: "Requiere autenticación",
      },
      {
        label: "✅ verified",
        value: "verified",
        description: "Requiere email verificado",
      },
      {
        label: "👑 admin",
        value: "admin",
        description: "Solo administradores",
      },
      {
        label: "🔐 auth:sanctum",
        value: "auth:sanctum",
        description: "Autenticación con Sanctum (API)",
      },
      {
        label: "🌐 web",
        value: "web",
        description: "Middleware web (sesiones, CSRF)",
      },
      {
        label: "📡 api",
        value: "api",
        description: "Middleware API (rate limiting)",
      },
      {
        label: "🎯 throttle:60,1",
        value: "throttle:60,1",
        description: "Rate limiting personalizado",
      },
      { label: "❌ Ninguno", value: "", description: "Sin middleware" },
    ],
    {
      placeHolder: "Middleware to apply (select multiple with space)",
      canPickMany: true,
    }
  );

  if (middlewareOptions) {
    options.middleware = middlewareOptions
      .filter((m) => m.value)
      .map((m) => m.value);
  }

  // Route name prefix
  const namePrefix = await showInputBox({
    prompt: "Route name prefix (e.g: admin.products)",
    placeHolder: options.prefix ? `${options.prefix}.` : "",
  });
  options.name = name || "";

  return options;
}

/**
 * Creates the route file
 */
async function createRouteFile(
  moduleName,
  routeType,
  controllerName,
  selectedRoutes,
  options
) {
  const rootPath = getLaravelRootPath();

  // Determine folder based on type
  let routeFolder = "web";
  if (routeType === "api") routeFolder = "api";
  else if (routeType === "admin") routeFolder = "admin";
  else if (routeType === "auth") routeFolder = "auth";
  else if (routeType === "protected") routeFolder = "protected";
  else if (routeType === "public") routeFolder = "public";

  const routesPath = path.join(rootPath, "routes", "modules", routeFolder);
  ensureDirectoryExists(routesPath);

  const fileName = `${toKebabCase(moduleName)}.php`;
  const filePath = path.join(routesPath, fileName);

  // Generate file content
  const content = generateRouteFileContent(
    moduleName,
    routeType,
    controllerName,
    selectedRoutes,
    options
  );

  fs.writeFileSync(filePath, content);

  return path.relative(rootPath, filePath);
}

/**
 * Generates the route file content
 */
function generateRouteFileContent(
  moduleName,
  routeType,
  controllerName,
  selectedRoutes,
  options
) {
  const routeName = toKebabCase(moduleName);
  const variable = toSnakeCase(moduleName);

  let content = `<?php

/**
 * ${toPascalCase(moduleName)} Routes
 * 
 * @group ${moduleName}
 * @type ${routeType}
 */

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\${controllerName};

`;

  // Construir el grupo de rutas
  const groupParams = [];

  if (options.prefix) {
    groupParams.push(`'prefix' => '${options.prefix}'`);
  }

  if (options.middleware && options.middleware.length > 0) {
    const middlewareStr =
      options.middleware.length === 1
        ? `'${options.middleware[0]}'`
        : `[${options.middleware.map((m) => `'${m}'`).join(", ")}]`;
    groupParams.push(`'middleware' => ${middlewareStr}`);
  }

  if (options.name) {
    groupParams.push(`'as' => '${options.name}'`);
  }

  if (groupParams.length > 0) {
    content += `Route::group([\n    ${groupParams.join(
      ",\n    "
    )}\n], function () {\n`;
  }

  // Generate selected routes
  const indent = groupParams.length > 0 ? "    " : "";
  const routeLines = [];

  selectedRoutes.forEach((route) => {
    const routeCode = generateRouteCode(
      route,
      routeName,
      variable,
      controllerName,
      routeType,
      options
    );
    if (routeCode) {
      routeLines.push(indent + routeCode);
    }
  });

  content += routeLines.join("\n") + "\n";

  if (groupParams.length > 0) {
    content += `});\n`;
  }

  // Add comment with usage examples
  content += `\n/*\n`;
  content += ` * Generated routes for ${moduleName}:\n`;
  content += ` * \n`;
  selectedRoutes.forEach((route) => {
    const example = getRouteExample(route, routeName, options);
    if (example) {
      content += ` * ${example}\n`;
    }
  });
  content += ` */\n`;

  return content;
}

/**
 * Generates code for an individual route
 */
function generateRouteCode(
  route,
  routeName,
  variable,
  controllerName,
  routeType,
  options
) {
  const namePrefix = options.name || "";

  const routeConfig = {
    index: {
      web: `Route::get('/${routeName}', [${controllerName}::class, 'index'])->name('${namePrefix}${routeName}.index');`,
      api: `Route::get('/${routeName}', [${controllerName}::class, 'index']);`,
    },
    create: {
      web: `Route::get('/${routeName}/create', [${controllerName}::class, 'create'])->name('${namePrefix}${routeName}.create');`,
      api: null, // No aplica para API
    },
    store: {
      web: `Route::post('/${routeName}', [${controllerName}::class, 'store'])->name('${namePrefix}${routeName}.store');`,
      api: `Route::post('/${routeName}', [${controllerName}::class, 'store']);`,
    },
    show: {
      web: `Route::get('/${routeName}/{${variable}}', [${controllerName}::class, 'show'])->name('${namePrefix}${routeName}.show');`,
      api: `Route::get('/${routeName}/{${variable}}', [${controllerName}::class, 'show']);`,
    },
    edit: {
      web: `Route::get('/${routeName}/{${variable}}/edit', [${controllerName}::class, 'edit'])->name('${namePrefix}${routeName}.edit');`,
      api: null, // No aplica para API
    },
    update: {
      web: `Route::put('/${routeName}/{${variable}}', [${controllerName}::class, 'update'])->name('${namePrefix}${routeName}.update');`,
      api: `Route::put('/${routeName}/{${variable}}', [${controllerName}::class, 'update']);`,
    },
    destroy: {
      web: `Route::delete('/${routeName}/{${variable}}', [${controllerName}::class, 'destroy'])->name('${namePrefix}${routeName}.destroy');`,
      api: `Route::delete('/${routeName}/{${variable}}', [${controllerName}::class, 'destroy']);`,
    },
    search: {
      api: `Route::get('/${routeName}/search', [${controllerName}::class, 'search']);`,
    },
    export: {
      api: `Route::get('/${routeName}/export', [${controllerName}::class, 'export']);`,
    },
    login: {
      auth: `Route::get('/login', [${controllerName}::class, 'showLoginForm'])->name('login');\n    Route::post('/login', [${controllerName}::class, 'login']);`,
    },
    register: {
      auth: `Route::get('/register', [${controllerName}::class, 'showRegistrationForm'])->name('register');\n    Route::post('/register', [${controllerName}::class, 'register']);`,
    },
    logout: {
      auth: `Route::post('/logout', [${controllerName}::class, 'logout'])->name('logout');`,
    },
    forgot: {
      auth: `Route::get('/forgot-password', [${controllerName}::class, 'showForgotForm'])->name('password.request');\n    Route::post('/forgot-password', [${controllerName}::class, 'sendResetLink'])->name('password.email');`,
    },
    reset: {
      auth: `Route::get('/reset-password/{token}', [${controllerName}::class, 'showResetForm'])->name('password.reset');\n    Route::post('/reset-password', [${controllerName}::class, 'resetPassword'])->name('password.update');`,
    },
    verify: {
      auth: `Route::get('/email/verify/{id}/{hash}', [${controllerName}::class, 'verify'])->name('verification.verify');`,
    },
  };

  const type =
    routeType === "auth" ? "auth" : routeType === "api" ? "api" : "web";
  const config = routeConfig[route.value];

  return config ? config[type] : null;
}

/**
 * Generates route usage example
 */
function getRouteExample(route, routeName, options) {
  const prefix = options.prefix ? `/${options.prefix}` : "";

  const examples = {
    index: `GET ${prefix}/${routeName} - List all ${routeName}`,
    create: `GET ${prefix}/${routeName}/create - Show create form`,
    store: `POST ${prefix}/${routeName} - Store new ${routeName}`,
    show: `GET ${prefix}/${routeName}/{id} - Show ${routeName} details`,
    edit: `GET ${prefix}/${routeName}/{id}/edit - Show edit form`,
    update: `PUT ${prefix}/${routeName}/{id} - Update ${routeName}`,
    destroy: `DELETE ${prefix}/${routeName}/{id} - Delete ${routeName}`,
    search: `GET ${prefix}/${routeName}/search?q=term - Search ${routeName}`,
    export: `GET ${prefix}/${routeName}/export - Export ${routeName}`,
    login: `GET/POST ${prefix}/login - Login`,
    register: `GET/POST ${prefix}/register - Register`,
    logout: `POST ${prefix}/logout - Logout`,
    forgot: `GET/POST ${prefix}/forgot-password - Forgot password`,
    reset: `GET/POST ${prefix}/reset-password - Reset password`,
    verify: `GET ${prefix}/email/verify - Verify email`,
  };

  return examples[route.value];
}

/**
 * Actualiza RouteServiceProvider para incluir las rutas modulares
 */
async function updateRouteServiceProvider(
  moduleName,
  routeType,
  routeFilePath
) {
  const rootPath = getLaravelRootPath();
  const providerPath = path.join(
    rootPath,
    "app",
    "Providers",
    "RouteServiceProvider.php"
  );

  if (!fs.existsSync(providerPath)) {
    // Crear RouteServiceProvider si no existe
    await createRouteServiceProvider();
  }

  let content = fs.readFileSync(providerPath, "utf8");

  // Verificar si ya está incluido
  if (content.includes(routeFilePath)) {
    return;
  }

  // Buscar el método boot() y agregar la inclusión
  const includeStatement = `        $this->routes(function () {\n            require base_path('${routeFilePath}');\n        });`;

  // Agregar antes del cierre del método boot()
  const bootMethodRegex = /public function boot\(\)[^{]*\{([^}]+)\}/;

  if (!content.match(bootMethodRegex)) {
    vscode.window.showWarningMessage(
      "No se pudo actualizar automáticamente RouteServiceProvider. " +
        `Agrega manualmente: require base_path('${routeFilePath}');`
    );
    return;
  }

  // Agregar comentario informativo
  const comment = `\n        // ${toPascalCase(
    moduleName
  )} ${routeType} routes\n`;

  content = content.replace(
    /(\$this->routes\(function \(\) \{)/,
    `$1${comment}${includeStatement.trim()}\n`
  );

  fs.writeFileSync(providerPath, content);
}

/**
 * Add require statement to main route file (web.php or api.php)
 */
async function addRequireToMainRouteFile(moduleName, routeType, routeFilePath) {
  const rootPath = getLaravelRootPath();
  const routesPath = path.join(rootPath, "routes");
  
  // Determine which main file to update based on route type
  let mainFileName;
  if (routeType === "api") {
    mainFileName = "api.php";
  } else {
    mainFileName = "web.php"; // web, auth, admin, protected, public all go to web.php
  }
  
  const mainFilePath = path.join(routesPath, mainFileName);
  
  if (!fs.existsSync(mainFilePath)) {
    return;
  }
  
  // Get relative path from routes/ to the module file
  const relativePath = path.relative(routesPath, routeFilePath).replace(/\\/g, '/');
  const requireStatement = `require __DIR__.'/${relativePath}';\n`;
  
  let content = fs.readFileSync(mainFilePath, "utf8");
  
  // Check if already exists
  if (content.includes(requireStatement.trim())) {
    return;
  }
  
  // Add comment and require at the end of the file
  const comment = `\n// ${toPascalCase(moduleName)} module routes\n`;
  content = content.trimEnd() + `\n${comment}${requireStatement}`;
  
  fs.writeFileSync(mainFilePath, content);
}

/**
 * Crea RouteServiceProvider con soporte para rutas modulares
 */
async function createRouteServiceProvider() {
  const rootPath = getLaravelRootPath();
  const providerPath = path.join(
    rootPath,
    "app",
    "Providers",
    "RouteServiceProvider.php"
  );

  const content = `<?php

namespace App\\Providers;

use Illuminate\\Cache\\RateLimiting\\Limit;
use Illuminate\\Foundation\\Support\\Providers\\RouteServiceProvider as ServiceProvider;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\RateLimiter;
use Illuminate\\Support\\Facades\\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, etc.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            // API Routes
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // Web Routes
            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            // Modular Routes
            $this->loadModularRoutes();
        });
    }

    /**
     * Load modular routes
     */
    protected function loadModularRoutes(): void
    {
        $modulesPath = base_path('routes/modules');
        
        if (!is_dir($modulesPath)) {
            return;
        }

        // Load routes from modules subdirectories
        $directories = ['web', 'api', 'admin', 'auth', 'protected', 'public'];
        
        foreach ($directories as $dir) {
            $dirPath = "{$modulesPath}/{$dir}";
            
            if (!is_dir($dirPath)) {
                continue;
            }

            $files = glob("{$dirPath}/*.php");
            
            foreach ($files as $file) {
                require $file;
            }
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
`;

  ensureDirectoryExists(path.dirname(providerPath));
  fs.writeFileSync(providerPath, content);
}

/**
 * Lista todas las rutas modulares existentes
 */
async function listModularRoutes() {
  const rootPath = getLaravelRootPath();
  const modulesPath = path.join(rootPath, "routes", "modules");

  if (!fs.existsSync(modulesPath)) {
    vscode.window.showInformationMessage("No hay rutas modulares creadas aún");
    return;
  }

  const routes = [];
  const directories = ["web", "api", "admin", "auth", "protected", "public"];

  directories.forEach((dir) => {
    const dirPath = path.join(modulesPath, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".php"));
      files.forEach((file) => {
        routes.push({
          label: `📁 ${dir}/${file}`,
          description: path.join("routes", "modules", dir, file),
          value: path.join(dirPath, file),
        });
      });
    }
  });

  if (routes.length === 0) {
    vscode.window.showInformationMessage(
      "No route files in routes/modules"
    );
    return;
  }

  const selected = await vscode.window.showQuickPick(routes, {
    placeHolder: "Select a route file to open",
  });

  if (selected) {
    const document = await vscode.workspace.openTextDocument(selected.value);
    await vscode.window.showTextDocument(document);
  }
}

/**
 * Generates complete RESTful routes (shortcut for resource)
 */
async function generateResourceRoutes() {
  const moduleName = await showInputBox({
    prompt: "Resource name (model)",
    placeHolder: "Product, User, Order",
  });

  if (!moduleName) return;

  const routeType = await showQuickPick(
    [
      { label: "🌐 Resource (Web)", value: "web" },
      { label: "📡 API Resource", value: "api" },
    ],
    { placeHolder: "Resource type" }
  );

  if (!routeType) return;
  
  // Extract value from the returned object
  // @ts-ignore - showQuickPick returns the selected item with value property
  const selectedResourceType = routeType.value || routeType;

  // Crear automáticamente con todas las rutas
  const allRoutes =
    selectedResourceType === "api"
      ? ["index", "store", "show", "update", "destroy"].map((v) => ({
          value: v,
        }))
      : ["index", "create", "store", "show", "edit", "update", "destroy"].map(
          (v) => ({ value: v })
        );

  const controllerName = `${toPascalCase(moduleName)}Controller`;
  const options = { prefix: "", middleware: [], namespace: "", name: "" };

  try {
    const routeFilePath = await createRouteFile(
      moduleName,
      selectedResourceType,
      controllerName,
      allRoutes,
      options
    );

    await updateRouteServiceProvider(
      moduleName,
      selectedResourceType,
      routeFilePath
    );
    
    // Add require to web.php or api.php
    await addRequireToMainRouteFile(
      moduleName,
      selectedResourceType,
      routeFilePath
    );

    vscode.window.showInformationMessage(
      `✅ Resource routes for ${moduleName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

module.exports = {
  generateRouteFile,
  generateResourceRoutes,
  listModularRoutes,
  createRouteServiceProvider,
};
