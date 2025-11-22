const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  showQuickPick,
  toPascalCase,
  toKebabCase,
  toCamelCase,
  toSnakeCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Generate React View (Complete Page)
 */
async function generateReactView() {
  const viewName = await showInputBox({
    prompt: "View name (PascalCase)",
    placeHolder: "UserDashboard, ProductList, OrderDetails",
    validateInput: (value) => {
      if (!value) return "View name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!viewName) return;

  const viewType = await showQuickPick(
    [
      {
        label: "List View",
        value: "list",
        description: "Table/grid view with CRUD operations",
      },
      {
        label: "Detail View",
        value: "detail",
        description: "Single item detail page",
      },
      {
        label: "Form View",
        value: "form",
        description: "Create/Edit form page",
      },
      {
        label: "Dashboard View",
        value: "dashboard",
        description: "Dashboard with widgets and stats",
      },
      {
        label: "Empty View",
        value: "empty",
        description: "Blank page template",
      },
    ],
    { placeHolder: "Select view type" }
  );

  if (!viewType) return;

  // @ts-ignore
  const selectedType = viewType.value || viewType;

  try {
    const rootPath = getLaravelRootPath();
    const viewsPath = path.join(rootPath, "resources", "js", "Pages");

    ensureDirectoryExists(viewsPath);

    const content = generateReactViewContent(viewName, selectedType);
    const filePath = path.join(viewsPath, `${viewName}.jsx`);

    fs.writeFileSync(filePath, content);

    // Create route entry suggestion
    const routePath = `/${toKebabCase(viewName)}`;
    
    vscode.window.showInformationMessage(
      `✅ React view ${viewName} created successfully`,
      "Add Route"
    ).then((selection) => {
      if (selection === "Add Route") {
        addReactRoute(viewName, routePath);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate React view content based on type
 */
function generateReactViewContent(name, type) {
  const kebabName = toKebabCase(name);
  const camelName = toCamelCase(name);
  const snakeName = toSnakeCase(name);

  if (type === "list") {
    return `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ${name}() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/${kebabName}');
            setItems(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(\`/api/${kebabName}/\${id}\`);
                fetchItems();
            } catch (err) {
                alert('Error deleting item: ' + err.message);
            }
        }
    };

    const filteredItems = items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">${name}</h1>
                <Link
                    to="/${kebabName}/create"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create New
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        to={\`/${kebabName}/\${item.id}\`}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={\`/${kebabName}/\${item.id}/edit\`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No items found
                </div>
            )}
        </div>
    );
}
`;
  } else if (type === "detail") {
    return `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ${name}() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            setLoading(true);
            const response = await axios.get(\`/api/${kebabName}/\${id}\`);
            setItem(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(\`/api/${kebabName}/\${id}\`);
                navigate('/${kebabName}');
            } catch (err) {
                alert('Error deleting item: ' + err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || 'Item not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">${name} Details</h1>
                <div className="space-x-2">
                    <Link
                        to="/${kebabName}"
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back
                    </Link>
                    <Link
                        to={\`/${kebabName}/\${id}/edit\`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{item.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{item.name}</dd>
                    </div>
                    {/* Add more fields as needed */}
                </dl>
            </div>
        </div>
    );
}
`;
  } else if (type === "form") {
    return `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ${name}() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        // Add more fields
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await axios.get(\`/api/${kebabName}/\${id}\`);
            setFormData(response.data);
        } catch (err) {
            alert('Error loading item: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (isEdit) {
                await axios.put(\`/api/${kebabName}/\${id}\`, formData);
            } else {
                await axios.post('/api/${kebabName}', formData);
            }
            navigate('/${kebabName}');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                alert('Error saving item: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        {isEdit ? 'Edit' : 'Create'} ${name}
                    </h1>
                    <Link
                        to="/${kebabName}"
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 \${errors.name ? 'border-red-500' : ''}\`}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 \${errors.description ? 'border-red-500' : ''}\`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>
                        )}
                    </div>

                    {/* Add more fields as needed */}

                    <div className="flex justify-end space-x-2">
                        <Link
                            to="/${kebabName}"
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
`;
  } else if (type === "dashboard") {
    return `import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ${name}() {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/${kebabName}/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">${name}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Active</p>
                            <p className="text-3xl font-bold">{stats.active}</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Completed</p>
                            <p className="text-3xl font-bold">{stats.completed}</p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                {/* Add your dashboard content here */}
            </div>
        </div>
    );
}
`;
  } else {
    // empty
    return `import React from 'react';

export default function ${name}() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">${name}</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6">
                {/* Add your content here */}
            </div>
        </div>
    );
}
`;
  }
}

/**
 * Generate Vue View (Complete Page)
 */
async function generateVueView() {
  const viewName = await showInputBox({
    prompt: "View name (PascalCase)",
    placeHolder: "UserDashboard, ProductList, OrderDetails",
    validateInput: (value) => {
      if (!value) return "View name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!viewName) return;

  const viewType = await showQuickPick(
    [
      {
        label: "List View",
        value: "list",
        description: "Table/grid view with CRUD operations",
      },
      {
        label: "Detail View",
        value: "detail",
        description: "Single item detail page",
      },
      {
        label: "Form View",
        value: "form",
        description: "Create/Edit form page",
      },
      {
        label: "Dashboard View",
        value: "dashboard",
        description: "Dashboard with widgets and stats",
      },
      {
        label: "Empty View",
        value: "empty",
        description: "Blank page template",
      },
    ],
    { placeHolder: "Select view type" }
  );

  if (!viewType) return;

  // @ts-ignore
  const selectedType = viewType.value || viewType;

  try {
    const rootPath = getLaravelRootPath();
    const viewsPath = path.join(rootPath, "resources", "js", "Pages");

    ensureDirectoryExists(viewsPath);

    const content = generateVueViewContent(viewName, selectedType);
    const filePath = path.join(viewsPath, `${viewName}.vue`);

    fs.writeFileSync(filePath, content);

    // Create route entry suggestion
    const routePath = `/${toKebabCase(viewName)}`;
    
    vscode.window.showInformationMessage(
      `✅ Vue view ${viewName} created successfully`,
      "Add Route"
    ).then((selection) => {
      if (selection === "Add Route") {
        addVueRoute(viewName, routePath);
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate Vue view content based on type
 */
function generateVueViewContent(name, type) {
  const kebabName = toKebabCase(name);
  const camelName = toCamelCase(name);

  if (type === "list") {
    return `<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">${name}</h1>
            <router-link
                :to="'/${kebabName}/create'"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Create New
            </router-link>
        </div>

        <div class="mb-4">
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Search..."
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div v-if="loading" class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ item.id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ item.name }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <router-link
                                :to="\`/${kebabName}/\${item.id}\`"
                                class="text-blue-600 hover:text-blue-900 mr-4"
                            >
                                View
                            </router-link>
                            <router-link
                                :to="\`/${kebabName}/\${item.id}/edit\`"
                                class="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                                Edit
                            </router-link>
                            <button
                                @click="handleDelete(item.id)"
                                class="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="filteredItems.length === 0" class="text-center py-8 text-gray-500">
                No items found
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const items = ref([]);
const loading = ref(true);
const error = ref(null);
const searchTerm = ref('');

const filteredItems = computed(() => {
    return items.value.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

onMounted(() => {
    fetchItems();
});

const fetchItems = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/api/${kebabName}');
        items.value = response.data;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await axios.delete(\`/api/${kebabName}/\${id}\`);
            await fetchItems();
        } catch (err) {
            alert('Error deleting item: ' + err.message);
        }
    }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
`;
  } else if (type === "detail") {
    return `<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">${name} Details</h1>
            <div class="space-x-2">
                <router-link
                    to="/${kebabName}"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back
                </router-link>
                <router-link
                    :to="\`/${kebabName}/\${id}/edit\`"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Edit
                </router-link>
                <button
                    @click="handleDelete"
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Delete
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center min-h-screen">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="error || !item" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ error || 'Item not found' }}
        </div>

        <div v-else class="bg-white shadow-md rounded-lg p-6">
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <dt class="text-sm font-medium text-gray-500">ID</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ item.id }}</dd>
                </div>
                <div>
                    <dt class="text-sm font-medium text-gray-500">Name</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ item.name }}</dd>
                </div>
                <!-- Add more fields as needed -->
            </dl>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const item = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(() => {
    fetchItem();
});

const fetchItem = async () => {
    try {
        loading.value = true;
        const response = await axios.get(\`/api/${kebabName}/\${id}\`);
        item.value = response.data;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await axios.delete(\`/api/${kebabName}/\${id}\`);
            router.push('/${kebabName}');
        } catch (err) {
            alert('Error deleting item: ' + err.message);
        }
    }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
`;
  } else if (type === "form") {
    return `<template>
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold">
                    {{ isEdit ? 'Edit' : 'Create' }} ${name}
                </h1>
                <router-link
                    to="/${kebabName}"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Cancel
                </router-link>
            </div>

            <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded-lg p-6">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                        Name
                    </label>
                    <input
                        v-model="formData.name"
                        type="text"
                        id="name"
                        :class="[\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\`, errors.name ? 'border-red-500' : '']"
                        required
                    />
                    <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
                        Description
                    </label>
                    <textarea
                        v-model="formData.description"
                        id="description"
                        rows="4"
                        :class="[\`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\`, errors.description ? 'border-red-500' : '']"
                    />
                    <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description[0] }}</p>
                </div>

                <!-- Add more fields as needed -->

                <div class="flex justify-end space-x-2">
                    <router-link
                        to="/${kebabName}"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Cancel
                    </router-link>
                    <button
                        type="submit"
                        :disabled="loading"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const isEdit = computed(() => !!id);

const formData = ref({
    name: '',
    description: '',
    // Add more fields
});

const loading = ref(false);
const errors = ref({});

onMounted(() => {
    if (isEdit.value) {
        fetchItem();
    }
});

const fetchItem = async () => {
    try {
        const response = await axios.get(\`/api/${kebabName}/\${id}\`);
        formData.value = response.data;
    } catch (err) {
        alert('Error loading item: ' + err.message);
    }
};

const handleSubmit = async () => {
    loading.value = true;
    errors.value = {};

    try {
        if (isEdit.value) {
            await axios.put(\`/api/${kebabName}/\${id}\`, formData.value);
        } else {
            await axios.post('/api/${kebabName}', formData.value);
        }
        router.push('/${kebabName}');
    } catch (err) {
        if (err.response?.data?.errors) {
            errors.value = err.response.data.errors;
        } else {
            alert('Error saving item: ' + err.message);
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
`;
  } else if (type === "dashboard") {
    return `<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">${name}</h1>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Total</p>
                        <p class="text-3xl font-bold">{{ stats.total }}</p>
                    </div>
                    <div class="bg-blue-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Active</p>
                        <p class="text-3xl font-bold">{{ stats.active }}</p>
                    </div>
                    <div class="bg-green-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Pending</p>
                        <p class="text-3xl font-bold">{{ stats.pending }}</p>
                    </div>
                    <div class="bg-yellow-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm">Completed</p>
                        <p class="text-3xl font-bold">{{ stats.completed }}</p>
                    </div>
                    <div class="bg-purple-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div v-if="loading" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
            <!-- Add your dashboard content here -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const stats = ref({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
});
const loading = ref(true);

onMounted(() => {
    fetchStats();
});

const fetchStats = async () => {
    try {
        const response = await axios.get('/api/${kebabName}/stats');
        stats.value = response.data;
    } catch (err) {
        console.error('Error fetching stats:', err);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
`;
  } else {
    // empty
    return `<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">${name}</h1>
        
        <div class="bg-white shadow-md rounded-lg p-6">
            <!-- Add your content here -->
        </div>
    </div>
</template>

<script setup>
// Add your logic here
</script>

<style scoped>
/* Add component-specific styles here */
</style>
`;
  }
}

/**
 * Add React route helper
 */
async function addReactRoute(viewName, routePath) {
  const rootPath = getLaravelRootPath();
  const routerPath = path.join(rootPath, "resources", "js", "router.jsx");
  
  if (!fs.existsSync(routerPath)) {
    vscode.window.showWarningMessage("Router file not found. Please add the route manually.");
    return;
  }

  const importStatement = `import ${viewName} from './Pages/${viewName}';`;
  const routeStatement = `    { path: '${routePath}', element: <${viewName} /> },`;

  let content = fs.readFileSync(routerPath, "utf8");
  
  if (!content.includes(importStatement)) {
    // Add import after last import
    const lines = content.split("\n");
    let lastImportIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        lastImportIndex = i;
      }
    }
    lines.splice(lastImportIndex + 1, 0, importStatement);
    content = lines.join("\n");
  }

  if (!content.includes(routeStatement.trim())) {
    // Add route to routes array
    content = content.replace(
      /(const routes = \[)/,
      `$1\n${routeStatement}`
    );
  }

  fs.writeFileSync(routerPath, content);
  vscode.window.showInformationMessage(`✅ Route added to router`);
}

/**
 * Add Vue route helper
 */
async function addVueRoute(viewName, routePath) {
  const rootPath = getLaravelRootPath();
  const routerPath = path.join(rootPath, "resources", "js", "router.js");
  
  if (!fs.existsSync(routerPath)) {
    vscode.window.showWarningMessage("Router file not found. Please add the route manually.");
    return;
  }

  const importStatement = `import ${viewName} from './Pages/${viewName}.vue';`;
  const routeStatement = `    { path: '${routePath}', name: '${toKebabCase(viewName)}', component: ${viewName} },`;

  let content = fs.readFileSync(routerPath, "utf8");
  
  if (!content.includes(importStatement)) {
    // Add import after last import
    const lines = content.split("\n");
    let lastImportIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        lastImportIndex = i;
      }
    }
    lines.splice(lastImportIndex + 1, 0, importStatement);
    content = lines.join("\n");
  }

  if (!content.includes(routeStatement.trim())) {
    // Add route to routes array
    content = content.replace(
      /(const routes = \[)/,
      `$1\n${routeStatement}`
    );
  }

  fs.writeFileSync(routerPath, content);
  vscode.window.showInformationMessage(`✅ Route added to router`);
}

module.exports = {
  generateReactView,
  generateVueView,
};
