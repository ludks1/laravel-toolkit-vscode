const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  showQuickPick,
  toKebabCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Generate React Component
 */
async function generateReactComponent() {
  const componentName = await showInputBox({
    prompt: "React component name (PascalCase)",
    placeHolder: "UserProfile",
    validateInput: (value) => {
      if (!value) return "Component name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!componentName) return;

  const componentType = await showQuickPick(
    [
      {
        label: "Functional Component",
        value: "functional",
        description: "Modern React functional component with hooks",
      },
      {
        label: "Class Component",
        value: "class",
        description: "Traditional React class component",
      },
      {
        label: "Component with State",
        value: "stateful",
        description: "Functional component with useState and useEffect",
      },
    ],
    { placeHolder: "Select component type" }
  );

  if (!componentType) return;

  // @ts-ignore
  const selectedType = componentType.value || componentType;

  try {
    const rootPath = getLaravelRootPath();
    const componentsPath = path.join(rootPath, "resources", "js", "Components");

    ensureDirectoryExists(componentsPath);

    const content = generateReactContent(componentName, selectedType);
    const filePath = path.join(componentsPath, `${componentName}.jsx`);

    fs.writeFileSync(filePath, content);

    // Import to app.js
    await importComponentToAppJS(componentName, "react");

    vscode.window.showInformationMessage(
      `✅ React component ${componentName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate React component content
 */
function generateReactContent(name, type) {
  if (type === "class") {
    return `import React, { Component } from 'react';

export default class ${name} extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Initial state
        };
    }

    componentDidMount() {
        // Component mounted
    }

    render() {
        return (
            <div className="${toKebabCase(name)}">
                <h2>${name}</h2>
                {/* Component content */}
            </div>
        );
    }
}
`;
  } else if (type === "stateful") {
    return `import React, { useState, useEffect } from 'react';

export default function ${name}(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data or perform side effects
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="${toKebabCase(name)}">
            <h2>${name}</h2>
            {/* Component content */}
        </div>
    );
}
`;
  } else {
    // functional
    return `import React from 'react';

export default function ${name}(props) {
    return (
        <div className="${toKebabCase(name)}">
            <h2>${name}</h2>
            {/* Component content */}
        </div>
    );
}
`;
  }
}

/**
 * Generate Vue Component
 */
async function generateVueComponent() {
  const componentName = await showInputBox({
    prompt: "Vue component name (PascalCase)",
    placeHolder: "UserProfile",
    validateInput: (value) => {
      if (!value) return "Component name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!componentName) return;

  const componentType = await showQuickPick(
    [
      {
        label: "Composition API",
        value: "composition",
        description: "Vue 3 Composition API with <script setup>",
      },
      {
        label: "Options API",
        value: "options",
        description: "Traditional Vue Options API",
      },
      {
        label: "Composition API with State",
        value: "stateful",
        description: "Composition API with reactive state",
      },
    ],
    { placeHolder: "Select component type" }
  );

  if (!componentType) return;

  // @ts-ignore
  const selectedType = componentType.value || componentType;

  try {
    const rootPath = getLaravelRootPath();
    const componentsPath = path.join(rootPath, "resources", "js", "Components");

    ensureDirectoryExists(componentsPath);

    const content = generateVueContent(componentName, selectedType);
    const filePath = path.join(componentsPath, `${componentName}.vue`);

    fs.writeFileSync(filePath, content);

    // Import to app.js
    await importComponentToAppJS(componentName, "vue");

    vscode.window.showInformationMessage(
      `✅ Vue component ${componentName} created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate Vue component content
 */
function generateVueContent(name, type) {
  if (type === "options") {
    return `<template>
    <div class="${toKebabCase(name)}">
        <h2>${name}</h2>
        <!-- Component content -->
    </div>
</template>

<script>
export default {
    name: '${name}',
    props: {
        // Define props
    },
    data() {
        return {
            // Component data
        };
    },
    mounted() {
        // Component mounted
    },
    methods: {
        // Component methods
    }
};
</script>

<style scoped>
.${toKebabCase(name)} {
    /* Component styles */
}
</style>
`;
  } else if (type === "stateful") {
    return `<template>
    <div class="${toKebabCase(name)}">
        <h2>${name}</h2>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <!-- Component content -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    // Define props
});

const data = ref(null);
const loading = ref(true);

onMounted(() => {
    // Fetch data or perform side effects
    loading.value = false;
});
</script>

<style scoped>
.${toKebabCase(name)} {
    /* Component styles */
}
</style>
`;
  } else {
    // composition
    return `<template>
    <div class="${toKebabCase(name)}">
        <h2>${name}</h2>
        <!-- Component content -->
    </div>
</template>

<script setup>
const props = defineProps({
    // Define props
});

const emit = defineEmits([]);
</script>

<style scoped>
.${toKebabCase(name)} {
    /* Component styles */
}
</style>
`;
  }
}

/**
 * Import component to app.js
 */
async function importComponentToAppJS(componentName, framework) {
  const rootPath = getLaravelRootPath();
  const appJsPath = path.join(rootPath, "resources", "js", "app.js");

  if (!fs.existsSync(appJsPath)) {
    return;
  }

  let content = fs.readFileSync(appJsPath, "utf8");

  const extension = framework === "vue" ? ".vue" : "";
  const importStatement = `import ${componentName} from './Components/${componentName}${extension}';\n`;

  if (content.includes(importStatement.trim())) {
    return;
  }

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

module.exports = {
  generateReactComponent,
  generateVueComponent,
};
