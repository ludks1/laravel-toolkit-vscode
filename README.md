# Laravel Toolkit

![Laravel Toolkit Icon](brain-process.png)

**Laravel Toolkit v2.0** is a comprehensive Visual Studio Code extension that supercharges Laravel development with advanced code generators, complete CRUD scaffolding, and seamless Artisan integration.

[![VS Code](https://img.shields.io/badge/VS_Code-Extension-blue)](https://code.visualstudio.com/)
[![Laravel](https://img.shields.io/badge/Laravel-10%2B-red)](https://laravel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE.md)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange)]()

## ✨ What's New in v2.0

- 🎉 **Vue 3 CRUD Generator** - Complete SPA scaffolding with Composition API
- 🎉 **React CRUD Generator** - Complete SPA scaffolding with Hooks
- 🎉 **REST API Generator** - Full API with tests and policies
- 🎨 **Enhanced UI** - New icon and improved dashboard
- 📚 **Better Documentation** - Consolidated comprehensive documentation

## 🚀 Features

### Advanced Generators

- ✅ **Model Generator** - Traits, relationships, fillables, subdirectories
- ✅ **Controller Generator** - 6 types (Empty, Invokable, Resource, API, Model, Custom)
- ✅ **Migration Builder** - 15+ field types, modifiers, foreign keys
- ✅ **Route System** - Modular organization (Web, API, Admin, Auth)

### SPA CRUD Scaffolding

- ✅ **Vue 3 CRUD** - Composition API, Composables, Vue Router
- ✅ **React CRUD** - Hooks, Custom Hooks, React Router
- ✅ **REST API** - Resources, Collections, Tests, Policies

### Complete Artisan Integration

- ✅ All Artisan commands from sidebar
- ✅ Interactive prompts
- ✅ Progress tracking
- ✅ Error handling

## 📦 Installation

### Via VS Code Marketplace

1. Open **Extensions** (`Ctrl+Shift+X`)
2. Search for **"Laravel Toolkit"**
3. Click **Install**

### Requirements

- VS Code 1.103.0+
- Laravel 10+
- PHP 8.1+
- Node.js 18+ (for frontend generators)

## 🎯 Quick Start

1. Open your Laravel project in VS Code
2. Click the **Laravel Toolkit** icon in the sidebar
3. Navigate to **Generators** → **Advanced Model**
4. Enter model name and configure options
5. Click **Generate**

That's it! 🎉

## 📚 Documentation

**Complete documentation available at:** [docs/README.md](docs/README.md)

### Quick Links

- [Installation Guide](docs/README.md#installation)
- [Advanced Generators](docs/README.md#advanced-generators)
- [SPA CRUD Generators](docs/README.md#spa-crud-generators)
- [REST API Generator](docs/README.md#rest-api-generator)
- [Configuration](docs/README.md#configuration)
- [Best Practices](docs/README.md#best-practices)
- [Examples](docs/README.md#examples)
- [Troubleshooting](docs/README.md#troubleshooting)

## 💡 Examples

### Generate Complete Product CRUD with Vue 3

```bash
Command: Generate Vue 3 CRUD
Model: Product
Fields: name:string,price:decimal,stock:integer
```

**Generates**:

- ✅ Laravel Model + Migration
- ✅ API Controller with validation
- ✅ API Resource + Collection
- ✅ Vue 3 components (List/Form/Show)
- ✅ Composable with state management
- ✅ Router integration

### Generate REST API

```bash
Command: Generate REST API
Model: Post
Version: v1
Auth: Sanctum
Generate: All components + Tests
```

**Generates**:

- ✅ Complete API with 5 endpoints
- ✅ Form Requests (Store/Update)
- ✅ API Resources
- ✅ Policy for authorization
- ✅ 7 Feature tests

## 🎨 Features Overview

| Feature                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| **47 Commands**         | All Laravel operations from sidebar              |
| **6 Controller Types**  | Empty, Invokable, Resource, API, Model, Custom   |
| **15+ Field Types**     | String, Text, Integer, Decimal, Date, JSON, etc. |
| **Vue 3 Support**       | Composition API, Composables, Vue Router         |
| **React Support**       | Hooks, Custom Hooks, React Router                |
| **API Generation**      | Resources, Tests, Policies, Authentication       |
| **Route Management**    | Modular routes (Web, API, Admin, Auth)           |
| **Artisan Integration** | All commands with interactive prompts            |

## ⚙️ Configuration

Access via: `File` → `Preferences` → `Settings` → Search "Laravel Toolkit"

```json
{
  "laravelToolkit.phpPath": "php",
  "laravelToolkit.composerPath": "composer",
  "laravelToolkit.defaultFramework": "vue",
  "laravelToolkit.autoDetectFramework": true,
  "laravelToolkit.defaultApiVersion": "v1"
}
```

## 🔧 Available Commands

### Generators

- Generate Advanced Model
- Generate Advanced Controller
- Generate Advanced Migration
- Generate Complete CRUD
- Generate REST API
- Generate Vue 3 CRUD
- Generate React CRUD
- Generate Service Class
- Generate Test

### Database

- Run Migrations
- Refresh Migrations
- Fresh Migrations + Seed
- Run Seeders

### Routes

- Generate Route File
- Generate Resource Routes
- Setup Modular Routes
- List Routes

### Utilities

- Clear Cache
- Clear Config
- Optimize Application
- Start Dev Server
- Composer Install
- NPM Install
- Open Tinker

## 🐛 Troubleshooting

### Common Issues

**PHP not found**

```json
{
  "laravelToolkit.phpPath": "C:\\php\\php.exe"
}
```

**Routes not working**

```bash
php artisan route:clear
php artisan route:cache
```

**Frontend not compiling**

```bash
npm install
npm run dev
```

For more help, see [Troubleshooting Guide](docs/README.md#troubleshooting)

## 📄 License

MIT License - See [LICENSE.md](LICENSE.md) for details

## 👨‍💻 Author

**Steinly**

Made with ❤️ for the Laravel community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Laravel Community
- VS Code Extension API
- Vue.js & React Communities

---

**⭐ If you find this extension helpful, please consider giving it a star!**

For complete documentation, visit [docs/README.md](docs/README.md)
