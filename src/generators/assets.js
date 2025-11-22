const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  showQuickPick,
  toKebabCase,
  toCamelCase,
  toPascalCase,
  ensureDirectoryExists,
  hasViteConfig,
} = require("../utils/helpers");

/**
 * Generate a JS file following Laravel + Vite best practices
 */
async function generateJSFile() {
  const type = await showQuickPick(
    [
      { label: "Component / Class", value: "component" },
      { label: "Utility / Helper", value: "utility" },
      { label: "API Service", value: "service" },
      { label: "Store / State Management", value: "store" },
      { label: "Hook / Composable", value: "hook" },
    ],
    { placeHolder: "Select JS file type to create" }
  );

  if (!type) return;
  
  // Extract value from the returned object
  // @ts-ignore - showQuickPick returns the selected item with value property
  const selectedType = type.value || type;

  const fileName = await showInputBox({
    prompt: "File name (without extension)",
    placeHolder: "myComponent",
    validateInput: (value) => {
      if (!value) return "Name is required";
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
        return "Invalid name";
      }
      return null;
    },
  });

  if (!fileName) return;

  try {
    switch (selectedType) {
      case "component":
        await createJSComponent(fileName);
        break;
      case "utility":
        await createUtility(fileName);
        break;
      case "service":
        await createAPIService(fileName);
        break;
      case "store":
        await createStore(fileName);
        break;
      case "hook":
        await createHook(fileName);
        break;
    }

    vscode.window.showInformationMessage(
      `✅ File ${fileName}.js created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `❌ Error creating file: ${error.message}`
    );
  }
}

/**
 * Creates a JS component
 */
async function createJSComponent(name) {
  const rootPath = getLaravelRootPath();
  const componentsPath = path.join(rootPath, "resources", "js", "components");

  ensureDirectoryExists(componentsPath);

  const content = `/**
 * ${name} Component
 * 
 * @description JavaScript component for ${name}
 */

export default class ${toPascalCase(name)} {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            // Default options
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        console.log('${name} initialized');
    }
    
    bindEvents() {
        // Bind events here
    }
    
    destroy() {
        // Cleanup
    }
}

// Auto-initialization if element exists in DOM
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const elements = document.querySelectorAll('[data-${toKebabCase(
          name
        )}]');
        elements.forEach(element => {
            new ${toPascalCase(name)}(element);
        });
    });
}
`;

  const filePath = path.join(componentsPath, `${toKebabCase(name)}.js`);
  fs.writeFileSync(filePath, content);

  // Update app.js to import the component
  await updateAppJS(name, "component");
}

/**
 * Creates a utility file
 */
async function createUtility(name) {
  const rootPath = getLaravelRootPath();
  const utilsPath = path.join(rootPath, "resources", "js", "utils");

  ensureDirectoryExists(utilsPath);

  const content = `/**
 * ${name} Utilities
 * 
 * @description Utility functions for ${name}
 */

/**
 * Example utility function
 * @param {*} value 
 * @returns {*}
 */
export function ${toCamelCase(name)}(value) {
    // Implementation here
    return value;
}

/**
 * Another example utility function
 * @param {string} str 
 * @returns {string}
 */
export function format${toPascalCase(name)}(str) {
    return str.trim();
}

export default {
    ${toCamelCase(name)},
    format${toPascalCase(name)}
};
`;

  const filePath = path.join(utilsPath, `${toKebabCase(name)}.js`);
  fs.writeFileSync(filePath, content);
  
  // Update app.js to import the utility
  await updateAppJS(name, "utility");
}

/**
 * Creates an API service
 */
async function createAPIService(name) {
  const rootPath = getLaravelRootPath();
  const servicesPath = path.join(rootPath, "resources", "js", "services");

  ensureDirectoryExists(servicesPath);

  const content = `/**
 * ${name} API Service
 * 
 * @description Service to interact with ${name} API
 */

import axios from 'axios';

const BASE_URL = '/api/${toKebabCase(name)}';

export default {
    /**
     * Get all records
     * @returns {Promise}
     */
    async getAll() {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching ${name}:', error);
            throw error;
        }
    },

    /**
     * Get a record by ID
     * @param {number} id 
     * @returns {Promise}
     */
    async getById(id) {
        try {
            const response = await axios.get(\`\${BASE_URL}/\${id}\`);
            return response.data;
        } catch (error) {
            console.error(\`Error fetching ${name} \${id}:\`, error);
            throw error;
        }
    },

    /**
     * Create a new record
     * @param {Object} data 
     * @returns {Promise}
     */
    async create(data) {
        try {
            const response = await axios.post(BASE_URL, data);
            return response.data;
        } catch (error) {
            console.error('Error creating ${name}:', error);
            throw error;
        }
    },

    /**
     * Update a record
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise}
     */
    async update(id, data) {
        try {
            const response = await axios.put(\`\${BASE_URL}/\${id}\`, data);
            return response.data;
        } catch (error) {
            console.error(\`Error updating ${name} \${id}:\`, error);
            throw error;
        }
    },

    /**
     * Delete a record
     * @param {number} id 
     * @returns {Promise}
     */
    async delete(id) {
        try {
            const response = await axios.delete(\`\${BASE_URL}/\${id}\`);
            return response.data;
        } catch (error) {
            console.error(\`Error deleting ${name} \${id}:\`, error);
            throw error;
        }
    }
};
`;

  const filePath = path.join(servicesPath, `${toKebabCase(name)}.service.js`);
  fs.writeFileSync(filePath, content);
  
  // Update app.js to import the service
  await updateAppJS(name, "service");
}

/**
 * Creates a store for state management
 */
async function createStore(name) {
  const rootPath = getLaravelRootPath();
  const storePath = path.join(rootPath, "resources", "js", "stores");

  ensureDirectoryExists(storePath);

  const content = `/**
 * ${name} Store
 * 
 * @description Store for ${name} state management
 */

class ${toPascalCase(name)}Store {
    constructor() {
        this.state = {
            items: [],
            loading: false,
            error: null
        };
        
        this.listeners = [];
    }

    /**
     * Get current state
     * @returns {Object}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state
     * @param {Object} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener 
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notificar a los listeners
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Agregar un item
     * @param {Object} item 
     */
    addItem(item) {
        this.setState({
            items: [...this.state.items, item]
        });
    }

    /**
     * Update an item
     * @param {number} id 
     * @param {Object} updates 
     */
    updateItem(id, updates) {
        this.setState({
            items: this.state.items.map(item =>
                item.id === id ? { ...item, ...updates } : item
            )
        });
    }

    /**
     * Remove an item
     * @param {number} id 
     */
    removeItem(id) {
        this.setState({
            items: this.state.items.filter(item => item.id !== id)
        });
    }

    /**
     * Set loading state
     * @param {boolean} isLoading 
     */
    setLoading(isLoading) {
        this.setState({ loading });
    }

    /**
     * Set error
     * @param {Error|string|null} error 
     */
    setError(error) {
        this.setState({ error });
    }
}

// Exportar una instancia única (singleton)
export default new ${toPascalCase(name)}Store();
`;

  const filePath = path.join(storePath, `${toKebabCase(name)}.store.js`);
  fs.writeFileSync(filePath, content);
  
  // Update app.js to import the store
  await updateAppJS(name, "store");
}

/**
 * Creates a hook/composable
 */
async function createHook(name) {
  const rootPath = getLaravelRootPath();
  const hooksPath = path.join(rootPath, "resources", "js", "composables");

  ensureDirectoryExists(hooksPath);

  const content = `/**
 * use${toPascalCase(name)} Hook
 * 
 * @description Composable/Hook para ${name}
 */

import { reactive, computed } from 'vue';

export function use${toPascalCase(name)}() {
    const state = reactive({
        data: null,
        loading: false,
        error: null
    });

    /**
     * Example computed property
     */
    const hasData = computed(() => state.data !== null);

    /**
     * Example function
     */
    const load${toPascalCase(name)} = async () => {
        state.loading = true;
        state.error = null;
        
        try {
            // Implement logic here
            // const response = await fetch(...);
            // state.data = response.data;
        } catch (error) {
            state.error = error;
            console.error('Error loading ${name}:', error);
        } finally {
            state.loading = false;
        }
    };

    /**
     * Resetear el estado
     */
    const reset = () => {
        state.data = null;
        state.loading = false;
        state.error = null;
    };

    return {
        // State
        state,
        
        // Computed
        hasData,
        
        // Methods
        load${toPascalCase(name)},
        reset
    };
}
`;

  const filePath = path.join(hooksPath, `${toKebabCase(name)}.js`);
  fs.writeFileSync(filePath, content);
  
  // Update app.js to import the hook
  await updateAppJS(name, "hook");
}

/**
 * Updates app.js to import components, utilities, services, stores, and hooks
 */
async function updateAppJS(name, type) {
  const rootPath = getLaravelRootPath();
  const appJsPath = path.join(rootPath, "resources", "js", "app.js");

  if (!fs.existsSync(appJsPath)) {
    return;
  }

  // Define import paths and names based on type
  const importConfig = {
    component: {
      path: `./components/${toKebabCase(name)}`,
      name: toPascalCase(name),
      template: (name, path) => `import ${name} from '${path}';\n`,
    },
    utility: {
      path: `./utils/${toKebabCase(name)}`,
      name: toCamelCase(name),
      template: (name, path) => `import ${name} from '${path}';\n`,
    },
    service: {
      path: `./services/${toKebabCase(name)}.service`,
      name: `${toPascalCase(name)}Service`,
      template: (name, path) => `import ${name} from '${path}';\n`,
    },
    store: {
      path: `./stores/${toKebabCase(name)}.store`,
      name: `${toCamelCase(name)}Store`,
      template: (name, path) => `import ${name} from '${path}';\n`,
    },
    hook: {
      path: `./composables/${toKebabCase(name)}`,
      name: `use${toPascalCase(name)}`,
      template: (name, path) => `import { ${name} } from '${path}';\n`,
    },
  };

  const config = importConfig[type];
  if (!config) return;

  let content = fs.readFileSync(appJsPath, "utf8");
  const importStatement = config.template(config.name, config.path);

  if (!content.includes(importStatement.trim())) {
    // Add import after last import statement
    const lines = content.split("\n");
    let lastImportIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        lastImportIndex = i;
      }
    }

    lines.splice(lastImportIndex + 1, 0, importStatement);
    content = lines.join("\n");

    fs.writeFileSync(appJsPath, content);
  }
}

/**
 * Configures Vite if not already configured
 */
async function setupVite() {
  const rootPath = getLaravelRootPath();

  if (hasViteConfig()) {
    vscode.window.showInformationMessage("Vite is already configured");
    return;
  }

  const viteConfigPath = path.join(rootPath, "vite.config.js");

  const content = `import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
`;

  fs.writeFileSync(viteConfigPath, content);
  vscode.window.showInformationMessage("✅ Vite configured successfully");
}

/**
 * Crea estructura de carpetas para JS
 */
async function setupJSStructure() {
  const rootPath = getLaravelRootPath();
  const jsPath = path.join(rootPath, "resources", "js");

  const folders = [
    "components",
    "composables",
    "services",
    "stores",
    "utils",
    "layouts",
    "pages",
  ];

  folders.forEach((folder) => {
    const folderPath = path.join(jsPath, folder);
    ensureDirectoryExists(folderPath);

    // Create .gitkeep file
    const gitkeepPath = path.join(folderPath, ".gitkeep");
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, "");
    }
  });

  // Create app.js if it doesn't exist
  const appJsPath = path.join(jsPath, "app.js");
  if (!fs.existsSync(appJsPath)) {
    const appJsContent = `/**
 * Main Application Entry Point
 */

import './bootstrap';
import '../css/app.css';

// Importar componentes aquí
console.log('Application loaded');
`;
    fs.writeFileSync(appJsPath, appJsContent);
  }

  // Create bootstrap.js if it doesn't exist
  const bootstrapJsPath = path.join(jsPath, 'bootstrap.js');
  if (!fs.existsSync(bootstrapJsPath)) {
    const bootstrapContent = `/**
 * Bootstrap Application
 */

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure CSRF token
let token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}
`;
    fs.writeFileSync(bootstrapJsPath, bootstrapContent);
  }

  vscode.window.showInformationMessage(
    "✅ JS structure configured successfully"
  );
}

/**
 * Generate CSS/SCSS file
 */
async function generateCSSFile() {
  const fileName = await showInputBox({
    prompt: "CSS/SCSS file name (without extension)",
    placeHolder: "components, utilities, layout",
    validateInput: (value) => {
      if (!value) return "Name is required";
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
        return "Invalid name";
      }
      return null;
    },
  });

  if (!fileName) return;

  const fileType = await showQuickPick(
    [
      { label: "CSS", value: "css" },
      { label: "SCSS", value: "scss" },
    ],
    { placeHolder: "Select file type" }
  );

  if (!fileType) return;
  
  // @ts-ignore
  const selectedType = fileType.value || fileType;

  try {
    const rootPath = getLaravelRootPath();
    const cssPath = path.join(rootPath, "resources", "css");

    ensureDirectoryExists(cssPath);

    const content = `/**
 * ${fileName} styles
 */

/* Variables */
:root {
    --primary-color: #3490dc;
    --secondary-color: #6c757d;
    --success-color: #38c172;
    --danger-color: #e3342f;
}

/* Styles */
.${toKebabCase(fileName)} {
    /* Add your styles here */
}
`;

    const extension = selectedType === "scss" ? "scss" : "css";
    const filePath = path.join(cssPath, `${toKebabCase(fileName)}.${extension}`);
    fs.writeFileSync(filePath, content);

    // Add import to app.css
    await addCSSImport(fileName, extension);

    vscode.window.showInformationMessage(
      `✅ ${extension.toUpperCase()} file ${fileName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error creating file: ${error.message}`);
  }
}

/**
 * Add CSS import to app.css
 */
async function addCSSImport(fileName, extension) {
  const rootPath = getLaravelRootPath();
  const appCssPath = path.join(rootPath, "resources", "css", "app.css");

  if (!fs.existsSync(appCssPath)) {
    return;
  }

  let content = fs.readFileSync(appCssPath, "utf8");
  const importStatement = `@import './${toKebabCase(fileName)}.${extension}';\n`;

  if (content.includes(importStatement.trim())) {
    return;
  }

  // Add import at the end
  content = content.trimEnd() + `\n${importStatement}`;
  fs.writeFileSync(appCssPath, content);
}

module.exports = {
  generateJSFile,
  generateCSSFile,
  setupVite,
  setupJSStructure,
};
