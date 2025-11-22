const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  ensureDirectoryExists,
  detectFrontendFramework,
} = require("../utils/helpers");

/**
 * Genera un CRUD completo para un modelo
 */
async function generateCRUD() {
  const modelName = await showInputBox({
    prompt: "Model name for CRUD (e.g: Product)",
    placeHolder: "Product",
    validateInput: (value) => {
      if (!value) return "Model name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!modelName) return;

  // Preguntar qué campos tendrá el modelo
  const fields = await showInputBox({
    prompt:
      "Campos del modelo (separados por coma: name:string,price:decimal,description:text)",
    placeHolder: "name:string,price:decimal,description:text",
  });

  if (!fields) return;

  // Detectar framework de frontend
  const framework = detectFrontendFramework();

  const options = await vscode.window.showQuickPick(
    [
      { label: `CRUD completo con ${framework || "Blade"}`, value: "full" },
      { label: "Solo Backend (Model, Controller, Routes)", value: "backend" },
      { label: "Solo API (API Controller + Routes)", value: "api" },
    ],
    { placeHolder: "CRUD type to generate" }
  );

  if (!options) return;

  try {
    const parsedFields = parseFields(fields);

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generando CRUD para ${modelName}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 10, message: "Creando modelo..." });
        await createModel(modelName, parsedFields);

        progress.report({ increment: 20, message: "Creando migración..." });
        await createMigration(modelName, parsedFields);

        progress.report({ increment: 30, message: "Creando controller..." });
        await createController(modelName, options.value);

        if (options.value !== "api") {
          progress.report({ increment: 20, message: "Creando vistas..." });
          await createViews(modelName, parsedFields, framework);
        }

        progress.report({ increment: 10, message: "Creating routes..." });
        await createRoutes(modelName, options.value);

        progress.report({ increment: 10, message: "Finalizando..." });
      }
    );

    vscode.window.showInformationMessage(
      `✅ CRUD for ${modelName} generated successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error al generar CRUD: ${error.message}`
    );
  }
}

/**
 * Parsea los campos desde el string de entrada
 */
function parseFields(fieldsString) {
  const fields = [];
  const fieldPairs = fieldsString.split(",").map((f) => f.trim());

  for (const pair of fieldPairs) {
    const [name, type = "string"] = pair.split(":").map((s) => s.trim());
    fields.push({ name, type });
  }

  return fields;
}

/**
 * Crea el modelo
 */
async function createModel(modelName, fields) {
  const rootPath = getLaravelRootPath();
  const modelPath = path.join(rootPath, "app", "Models", `${modelName}.php`);

  const fillable = fields.map((f) => `'${f.name}'`).join(", ");

  const modelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ${modelName} extends Model
{
    use HasFactory;

    protected $fillable = [${fillable}];

    protected $casts = [
${fields
  .map((f) => `        '${f.name}' => '${getMigrationCast(f.type)}'`)
  .join(",\n")}
    ];
}
`;

  ensureDirectoryExists(path.dirname(modelPath));
  fs.writeFileSync(modelPath, modelContent);
}

/**
 * Crea la migración
 */
async function createMigration(modelName, fields) {
  const rootPath = getLaravelRootPath();
  const tableName = toSnakeCase(modelName) + "s";
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const migrationName = `${timestamp}_create_${tableName}_table.php`;
  const migrationPath = path.join(
    rootPath,
    "database",
    "migrations",
    migrationName
  );

  const fieldsCode = fields
    .map((f) => `            $table->${getMigrationType(f.type)}('${f.name}');`)
    .join("\n");

  const migrationContent = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${tableName}', function (Blueprint $table) {
            $table->id();
${fieldsCode}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${tableName}');
    }
};
`;

  ensureDirectoryExists(path.dirname(migrationPath));
  fs.writeFileSync(migrationPath, migrationContent);
}

/**
 * Crea el controller
 */
async function createController(modelName, type) {
  const rootPath = getLaravelRootPath();
  const controllerName = `${modelName}Controller`;
  const controllerPath = path.join(
    rootPath,
    "app",
    "Http",
    "Controllers",
    `${controllerName}.php`
  );

  let controllerContent;

  if (type === "api") {
    controllerContent = generateApiController(modelName);
  } else {
    controllerContent = generateWebController(modelName);
  }

  ensureDirectoryExists(path.dirname(controllerPath));
  fs.writeFileSync(controllerPath, controllerContent);
}

/**
 * Genera un controller para API
 */
function generateApiController(modelName) {
  const tableName = toSnakeCase(modelName) + "s";
  const variable = toSnakeCase(modelName);

  return `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${modelName};
use Illuminate\\Http\\Request;

class ${modelName}Controller extends Controller
{
    public function index()
    {
        $${tableName} = ${modelName}::all();
        return response()->json($${tableName});
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Agregar validaciones aquí
        ]);

        $${variable} = ${modelName}::create($validated);
        return response()->json($${variable}, 201);
    }

    public function show(${modelName} $${variable})
    {
        return response()->json($${variable});
    }

    public function update(Request $request, ${modelName} $${variable})
    {
        $validated = $request->validate([
            // Agregar validaciones aquí
        ]);

        $${variable}->update($validated);
        return response()->json($${variable});
    }

    public function destroy(${modelName} $${variable})
    {
        $${variable}->delete();
        return response()->json(null, 204);
    }
}
`;
}

/**
 * Genera un controller para Web
 */
function generateWebController(modelName) {
  const tableName = toSnakeCase(modelName) + "s";
  const variable = toSnakeCase(modelName);
  const viewsFolder = toKebabCase(modelName);

  return `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${modelName};
use Illuminate\\Http\\Request;

class ${modelName}Controller extends Controller
{
    public function index()
    {
        $${tableName} = ${modelName}::paginate(10);
        return view('${viewsFolder}.index', compact('${tableName}'));
    }

    public function create()
    {
        return view('${viewsFolder}.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Agregar validaciones aquí
        ]);

        ${modelName}::create($validated);
        return redirect()->route('${viewsFolder}.index')
            ->with('success', '${modelName} created successfully.');
    }

    public function show(${modelName} $${variable})
    {
        return view('${viewsFolder}.show', compact('${variable}'));
    }

    public function edit(${modelName} $${variable})
    {
        return view('${viewsFolder}.edit', compact('${variable}'));
    }

    public function update(Request $request, ${modelName} $${variable})
    {
        $validated = $request->validate([
            // Agregar validaciones aquí
        ]);

        $${variable}->update($validated);
        return redirect()->route('${viewsFolder}.index')
            ->with('success', '${modelName} updated successfully.');
    }

    public function destroy(${modelName} $${variable})
    {
        $${variable}->delete();
        return redirect()->route('${viewsFolder}.index')
            ->with('success', '${modelName} deleted successfully.');
    }
}
`;
}

/**
 * Crea las vistas según el framework
 */
async function createViews(modelName, fields, framework) {
  switch (framework) {
    case "livewire":
      await createLivewireViews(modelName, fields);
      break;
    case "react":
      await createReactViews(modelName, fields);
      break;
    case "vue":
      await createVueViews(modelName, fields);
      break;
    default:
      await createBladeViews(modelName, fields);
  }
}

/**
 * Crea vistas Blade
 */
async function createBladeViews(modelName, fields) {
  const rootPath = getLaravelRootPath();
  const viewsFolder = toKebabCase(modelName);
  const viewsPath = path.join(rootPath, "resources", "views", viewsFolder);

  ensureDirectoryExists(viewsPath);

  // Index view
  const indexContent = generateBladeIndex(modelName, fields);
  fs.writeFileSync(path.join(viewsPath, "index.blade.php"), indexContent);

  // Create view
  const createContent = generateBladeCreate(modelName, fields);
  fs.writeFileSync(path.join(viewsPath, "create.blade.php"), createContent);

  // Edit view
  const editContent = generateBladeEdit(modelName, fields);
  fs.writeFileSync(path.join(viewsPath, "edit.blade.php"), editContent);

  // Show view
  const showContent = generateBladeShow(modelName, fields);
  fs.writeFileSync(path.join(viewsPath, "show.blade.php"), showContent);
}

function generateBladeIndex(modelName, fields) {
  const tableName = toSnakeCase(modelName) + "s";
  const variable = toSnakeCase(modelName);
  const route = toKebabCase(modelName);

  return `@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>${modelName}s</h1>
            <a href="{{ route('${route}.create') }}" class="btn btn-primary mb-3">Crear ${modelName}</a>
            
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
${fields.map((f) => `                        <th>${f.name}</th>`).join("\n")}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($${tableName} as $${variable})
                        <tr>
                            <td>{{ $${variable}->id }}</td>
${fields
  .map(
    (f) => `                            <td>{{ $${variable}->${f.name} }}</td>`
  )
  .join("\n")}
                            <td>
                                <a href="{{ route('${route}.show', $${variable}) }}" class="btn btn-sm btn-info">Ver</a>
                                <a href="{{ route('${route}.edit', $${variable}) }}" class="btn btn-sm btn-warning">Editar</a>
                                <form action="{{ route('${route}.destroy', $${variable}) }}" method="POST" style="display:inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('¿Estás seguro?')">Eliminar</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="${
                              fields.length + 2
                            }">No hay registros</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
            
            {{ $${tableName}->links() }}
        </div>
    </div>
</div>
@endsection
`;
}

function generateBladeCreate(modelName, fields) {
  const route = toKebabCase(modelName);

  return `@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>Crear ${modelName}</h1>
            
            <form action="{{ route('${route}.store') }}" method="POST">
                @csrf
                
${fields
  .map(
    (f) => `                <div class="mb-3">
                    <label for="${f.name}" class="form-label">${f.name}</label>
                    <input type="${getInputType(f.type)}" name="${
      f.name
    }" id="${f.name}" class="form-control @error('${
      f.name
    }') is-invalid @enderror" value="{{ old('${f.name}') }}">
                    @error('${f.name}')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
`
  )
  .join("\n")}
                
                <button type="submit" class="btn btn-primary">Guardar</button>
                <a href="{{ route('${route}.index') }}" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </div>
</div>
@endsection
`;
}

function generateBladeEdit(modelName, fields) {
  const variable = toSnakeCase(modelName);
  const route = toKebabCase(modelName);

  return `@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>Editar ${modelName}</h1>
            
            <form action="{{ route('${route}.update', $${variable}) }}" method="POST">
                @csrf
                @method('PUT')
                
${fields
  .map(
    (f) => `                <div class="mb-3">
                    <label for="${f.name}" class="form-label">${f.name}</label>
                    <input type="${getInputType(f.type)}" name="${
      f.name
    }" id="${f.name}" class="form-control @error('${
      f.name
    }') is-invalid @enderror" value="{{ old('${f.name}', $${variable}->${
      f.name
    }) }}">
                    @error('${f.name}')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
`
  )
  .join("\n")}
                
                <button type="submit" class="btn btn-primary">Actualizar</button>
                <a href="{{ route('${route}.index') }}" class="btn btn-secondary">Cancelar</a>
            </form>
        </div>
    </div>
</div>
@endsection
`;
}

function generateBladeShow(modelName, fields) {
  const variable = toSnakeCase(modelName);
  const route = toKebabCase(modelName);

  return `@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <h1>${modelName} #{{ $${variable}->id }}</h1>
            
            <div class="card">
                <div class="card-body">
${fields
  .map(
    (f) =>
      `                    <p><strong>${f.name}:</strong> {{ $${variable}->${f.name} }}</p>`
  )
  .join("\n")}
                </div>
            </div>
            
            <div class="mt-3">
                <a href="{{ route('${route}.edit', $${variable}) }}" class="btn btn-warning">Editar</a>
                <a href="{{ route('${route}.index') }}" class="btn btn-secondary">Volver</a>
            </div>
        </div>
    </div>
</div>
@endsection
`;
}

/**
 * Crea componentes Livewire
 */
// eslint-disable-next-line no-unused-vars
async function createLivewireViews(modelName, fields) {
  // TODO: Implementar generador de componentes Livewire
  vscode.window.showInformationMessage(
    "Soporte Livewire completo próximamente"
  );
}

/**
 * Crea componentes React
 */
async function createReactViews(modelName, fields) {
  const rootPath = getLaravelRootPath();
  const componentsPath = path.join(
    rootPath,
    "resources",
    "js",
    "Components",
    toPascalCase(modelName)
  );

  ensureDirectoryExists(componentsPath);

  // Index Component
  const indexContent = generateReactIndex(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, "Index.jsx"), indexContent);

  // Form Component
  const formContent = generateReactForm(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, "Form.jsx"), formContent);
  
  // Import components to app.js
  await importComponentsToAppJS(modelName, 'react');
}

function generateReactIndex(modelName, fields) {
  const tableName = toSnakeCase(modelName) + "s";
  const route = toKebabCase(modelName);

  return `import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ${modelName}Index() {
    const [${tableName}, set${modelName}s] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch${modelName}s();
    }, []);

    const fetch${modelName}s = async () => {
        try {
            const response = await axios.get('/api/${route}');
            set${modelName}s(response.data);
        } catch (error) {
            console.error('Error fetching ${tableName}:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro?')) {
            try {
                await axios.delete(\`/api/${route}/\${id}\`);
                fetch${modelName}s();
            } catch (error) {
                console.error('Error deleting ${modelName}:', error);
            }
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="container">
            <h1>${modelName}s</h1>
            <a href="/\${route}/create" className="btn btn-primary mb-3">
                Crear ${modelName}
            </a>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
${fields.map((f) => `                        <th>${f.name}</th>`).join("\n")}
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {${tableName}.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
${fields
  .map((f) => `                            <td>{item.${f.name}}</td>`)
  .join("\n")}
                            <td>
                                <a href={\`/${route}/\${item.id}\`} className="btn btn-sm btn-info">
                                    Ver
                                </a>
                                <a href={\`/${route}/\${item.id}/edit\`} className="btn btn-sm btn-warning ms-1">
                                    Editar
                                </a>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="btn btn-sm btn-danger ms-1"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
`;
}

function generateReactForm(modelName, fields) {
  const route = toKebabCase(modelName);

  return `import React, { useState } from 'react';
import axios from 'axios';

export default function ${modelName}Form({ ${toSnakeCase(
    modelName
  )} = null, onSuccess }) {
    const [formData, setFormData] = useState(${toSnakeCase(modelName)} || {
${fields.map((f) => `        ${f.name}: ''`).join(",\n")}
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (${toSnakeCase(modelName)}) {
                await axios.put(\`/api/${route}/\${${toSnakeCase(
    modelName
  )}.id}\`, formData);
            } else {
                await axios.post('/api/${route}', formData);
            }
            onSuccess && onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
${fields
  .map(
    (f) => `            <div className="mb-3">
                <label htmlFor="${f.name}" className="form-label">
                    ${f.name}
                </label>
                <input
                    type="${getInputType(f.type)}"
                    name="${f.name}"
                    id="${f.name}"
                    className={\`form-control \${errors.${
                      f.name
                    } ? 'is-invalid' : ''}\`}
                    value={formData.${f.name}}
                    onChange={handleChange}
                />
                {errors.${f.name} && (
                    <div className="invalid-feedback">{errors.${
                      f.name
                    }[0]}</div>
                )}
            </div>
`
  )
  .join("\n")}
            
            <button type="submit" className="btn btn-primary">
                {${toSnakeCase(modelName)} ? 'Actualizar' : 'Guardar'}
            </button>
        </form>
    );
}
`;
}

/**
 * Crea componentes Vue
 */
async function createVueViews(modelName, fields) {
  const rootPath = getLaravelRootPath();
  const componentsPath = path.join(
    rootPath,
    "resources",
    "js",
    "Components",
    toPascalCase(modelName)
  );

  ensureDirectoryExists(componentsPath);

  // Index Component
  const indexContent = generateVueIndex(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, "Index.vue"), indexContent);

  // Form Component
  const formContent = generateVueForm(modelName, fields);
  fs.writeFileSync(path.join(componentsPath, "Form.vue"), formContent);
  
  // Import components to app.js
  await importComponentsToAppJS(modelName, 'vue');
}

function generateVueIndex(modelName, fields) {
  const tableName = toSnakeCase(modelName) + "s";
  const route = toKebabCase(modelName);

  return `<template>
    <div class="container">
        <h1>${modelName}s</h1>
        <router-link :to="{ name: '${route}.create' }" class="btn btn-primary mb-3">
            Crear ${modelName}
        </router-link>

        <div v-if="loading">Cargando...</div>

        <table v-else class="table">
            <thead>
                <tr>
                    <th>ID</th>
${fields.map((f) => `                    <th>${f.name}</th>`).join("\n")}
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in ${tableName}" :key="item.id">
                    <td>{{ item.id }}</td>
${fields
  .map((f) => `                    <td>{{ item.${f.name} }}</td>`)
  .join("\n")}
                    <td>
                        <router-link :to="{ name: '${route}.show', params: { id: item.id }}" class="btn btn-sm btn-info">
                            Ver
                        </router-link>
                        <router-link :to="{ name: '${route}.edit', params: { id: item.id }}" class="btn btn-sm btn-warning ms-1">
                            Editar
                        </router-link>
                        <button @click="handleDelete(item.id)" class="btn btn-sm btn-danger ms-1">
                            Eliminar
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const ${tableName} = ref([]);
const loading = ref(true);

const fetch${modelName}s = async () => {
    try {
        const response = await axios.get('/api/${route}');
        ${tableName}.value = response.data;
    } catch (error) {
        console.error('Error fetching ${tableName}:', error);
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
        try {
            await axios.delete(\`/api/${route}/\${id}\`);
            fetch${modelName}s();
        } catch (error) {
            console.error('Error deleting ${modelName}:', error);
        }
    }
};

onMounted(() => {
    fetch${modelName}s();
});
</script>
`;
}

function generateVueForm(modelName, fields) {
  const route = toKebabCase(modelName);
  const variable = toSnakeCase(modelName);

  return `<template>
    <form @submit.prevent="handleSubmit">
${fields
  .map(
    (f) => `        <div class="mb-3">
            <label :for="${f.name}" class="form-label">${f.name}</label>
            <input
                type="${getInputType(f.type)}"
                v-model="formData.${f.name}"
                id="${f.name}"
                :class="['form-control', { 'is-invalid': errors.${f.name} }]"
            />
            <div v-if="errors.${f.name}" class="invalid-feedback">
                {{ errors.${f.name}[0] }}
            </div>
        </div>
`
  )
  .join("\n")}
        
        <button type="submit" class="btn btn-primary">
            {{ ${variable} ? 'Actualizar' : 'Guardar' }}
        </button>
    </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const props = defineProps({
    ${variable}: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['success']);

const formData = reactive(props.${variable} || {
${fields.map((f) => `    ${f.name}: ''`).join(",\n")}
});

const errors = ref({});

const handleSubmit = async () => {
    try {
        if (props.${variable}) {
            await axios.put(\`/api/${route}/\${props.${variable}.id}\`, formData);
        } else {
            await axios.post('/api/${route}', formData);
        }
        emit('success');
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        }
    }
};
</script>
`;
}

/**
 * Creates routes in the corresponding file
 */
async function createRoutes(modelName, type) {
  const rootPath = getLaravelRootPath();
  const route = toKebabCase(modelName);
  const controllerName = `${modelName}Controller`;

  // Ask if using modular or traditional routes
  const useModular = await vscode.window.showQuickPick(
    [
      {
        label: "📁 Modular Routes (Recommended)",
        value: true,
        description: "Create separate file in routes/modules/",
      },
      {
        label: "📄 Traditional Routes",
        value: false,
        description: "Add to routes/web.php or routes/api.php",
      },
    ],
    { placeHolder: "Route organization type" }
  );

  if (useModular === undefined) return;

  if (useModular.value) {
    // Use modular routes system
    await createModularRoutes(modelName, type, controllerName);
  } else {
    // Método tradicional
    await createTraditionalRoutes(modelName, type, controllerName);
  }
}

/**
 * Creates modular routes
 */
async function createModularRoutes(modelName, type, controllerName) {
  const rootPath = getLaravelRootPath();
  const routeFolder = type === "api" ? "api" : "web";
  const routesPath = path.join(rootPath, "routes", "modules", routeFolder);

  ensureDirectoryExists(routesPath);

  const fileName = `${toKebabCase(modelName)}.php`;
  const filePath = path.join(routesPath, fileName);

  const routeName = toKebabCase(modelName);
  const variable = toSnakeCase(modelName);

  // Generate modular route file content
  let content = `<?php

/**
 * ${modelName} Routes
 * Generated by Laravel Toolkit
 */

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\${controllerName};

`;

  if (type === "api") {
    content += `// API Resource Routes\n`;
    content += `Route::apiResource('${routeName}', ${controllerName}::class);\n`;
  } else {
    content += `// Web Resource Routes\n`;
    content += `Route::resource('${routeName}', ${controllerName}::class);\n`;
  }

  content += `\n/*\n * Available routes:\n`;

  if (type === "api") {
    content += ` * GET    /api/${routeName}           - List all ${modelName}\n`;
    content += ` * POST   /api/${routeName}           - Create ${modelName}\n`;
    content += ` * GET    /api/${routeName}/{${variable}} - Show ${modelName}\n`;
    content += ` * PUT    /api/${routeName}/{${variable}} - Update ${modelName}\n`;
    content += ` * DELETE /api/${routeName}/{${variable}} - Delete ${modelName}\n`;
  } else {
    content += ` * GET    /${routeName}                - List all ${modelName}\n`;
    content += ` * GET    /${routeName}/create        - Create form\n`;
    content += ` * POST   /${routeName}                - Store ${modelName}\n`;
    content += ` * GET    /${routeName}/{${variable}}       - Show ${modelName}\n`;
    content += ` * GET    /${routeName}/{${variable}}/edit  - Edit form\n`;
    content += ` * PUT    /${routeName}/{${variable}}       - Update ${modelName}\n`;
    content += ` * DELETE /${routeName}/{${variable}}       - Delete ${modelName}\n`;
  }

  content += ` */\n`;

  fs.writeFileSync(filePath, content);

  // Actualizar RouteServiceProvider
  await ensureRouteServiceProvider();

  vscode.window.showInformationMessage(
    `✅ Modular routes created in routes/modules/${routeFolder}/${fileName}`
  );
}

/**
 * Creates traditional routes (in web.php or api.php)
 */
async function createTraditionalRoutes(modelName, type, controllerName) {
  const rootPath = getLaravelRootPath();
  const route = toKebabCase(modelName);

  let routeFile = type === "api" ? "routes/api.php" : "routes/web.php";
  const routePath = path.join(rootPath, routeFile);

  if (!fs.existsSync(routePath)) {
    vscode.window.showWarningMessage(`File ${routeFile} not found`);
    return;
  }

  let routeContent = fs.readFileSync(routePath, "utf8");

  const routeLine =
    type === "api"
      ? `Route::apiResource('${route}', ${controllerName}::class);`
      : `Route::resource('${route}', ${controllerName}::class);`;

  // Agregar la ruta si no existe
  if (!routeContent.includes(routeLine)) {
    // Agregar el use statement si no existe
    const useStatement = `use App\\Http\\Controllers\\${controllerName};`;
    if (!routeContent.includes(useStatement)) {
      routeContent = routeContent.replace(
        /(use [^;]+;[\s\n]*)+/,
        `$&${useStatement}\n`
      );
    }

    // Agregar la ruta al final
    routeContent += `\n${routeLine}\n`;

    fs.writeFileSync(routePath, routeContent);
  }
}

/**
 * Ensures RouteServiceProvider is configured for modular routes
 */
async function ensureRouteServiceProvider() {
  const rootPath = getLaravelRootPath();
  const providerPath = path.join(
    rootPath,
    "app",
    "Providers",
    "RouteServiceProvider.php"
  );

  if (!fs.existsSync(providerPath)) {
    return;
  }

  let content = fs.readFileSync(providerPath, "utf8");

  // Verificar si ya tiene el método loadModularRoutes
  if (content.includes("loadModularRoutes")) {
    return;
  }

  vscode.window.showInformationMessage(
    '💡 Tip: Run "Laravel: Setup Modular Routes" to configure RouteServiceProvider automatically'
  );
}

// Helper functions
function getMigrationType(type) {
  const types = {
    string: "string",
    text: "text",
    integer: "integer",
    decimal: "decimal",
    boolean: "boolean",
    date: "date",
    datetime: "dateTime",
    timestamp: "timestamp",
    json: "json",
  };
  return types[type] || "string";
}

function getMigrationCast(type) {
  const casts = {
    boolean: "boolean",
    integer: "integer",
    decimal: "decimal",
    date: "date",
    datetime: "datetime",
    timestamp: "datetime",
    json: "array",
  };
  return casts[type] || "string";
}

function getInputType(type) {
  const types = {
    string: "text",
    text: "textarea",
    integer: "number",
    decimal: "number",
    boolean: "checkbox",
    date: "date",
    datetime: "datetime-local",
    email: "email",
    password: "password",
  };
  return types[type] || "text";
}

/**
 * Import CRUD components to app.js
 */
async function importComponentsToAppJS(modelName, framework) {
  const rootPath = getLaravelRootPath();
  const appJsPath = path.join(rootPath, "resources", "js", "app.js");

  if (!fs.existsSync(appJsPath)) {
    return;
  }

  let content = fs.readFileSync(appJsPath, "utf8");
  const componentPath = `./Components/${toPascalCase(modelName)}`;
  
  let importStatements = [];
  
  if (framework === 'react') {
    importStatements = [
      `import ${modelName}Index from '${componentPath}/Index';\n`,
      `import ${modelName}Form from '${componentPath}/Form';\n`
    ];
  } else if (framework === 'vue') {
    importStatements = [
      `import ${modelName}Index from '${componentPath}/Index.vue';\n`,
      `import ${modelName}Form from '${componentPath}/Form.vue';\n`
    ];
  }

  // Add imports after last import statement
  const lines = content.split("\n");
  let lastImportIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImportIndex = i;
    }
  }

  // Add each import if not already present
  importStatements.forEach(importStatement => {
    if (!content.includes(importStatement.trim())) {
      lines.splice(lastImportIndex + 1, 0, importStatement);
      lastImportIndex++;
    }
  });

  content = lines.join("\n");
  fs.writeFileSync(appJsPath, content);
}

module.exports = {
  generateCRUD,
};
