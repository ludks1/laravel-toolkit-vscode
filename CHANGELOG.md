# Change Log

All notable changes to the "Laravel Toolkit" extension.

Format based on [Keep a Changelog](http://keepachangelog.com/)

---

## [1.1.0] - 2025-01-XX

### 🎉 NEW: Complete SPA CRUD Generators

Revolutionary new generators for modern Single Page Applications!

#### **Vue 3 CRUD Generator** 💚

- Complete full-stack CRUD with Vue 3 Composition API
- Backend: Model, Migration, API Controller, Form Requests, API Resource, Routes
- Frontend: List, Form (Create/Edit), Show components
- Composables with full API integration (fetch, create, update, delete)
- Vue Router automatic integration
- Pagination, validation errors, loading states
- Tailwind CSS styling

#### **React CRUD Generator** ⚛️

- Complete full-stack CRUD with React Hooks
- Backend: Same complete backend as Vue generator
- Frontend: List, Form (Create/Edit), Show components (JSX)
- Custom hooks with full API integration
- React Router automatic integration
- Pagination, validation errors, loading states
- Tailwind CSS styling

#### Features

- **15+ field types** supported (string, text, integer, decimal, boolean, date, datetime, json, etc.)
- **Automatic validation** with Form Requests
- **Pagination** out of the box
- **Error handling** for validation and API errors
- **Router integration** with automatic route registration
- **State management** via Composables (Vue) or Hooks (React)
- **RESTful API** following Laravel best practices

#### Command Names

- `Laravel: Generate Vue 3 CRUD (Complete SPA)`
- `Laravel: Generate React CRUD (Complete SPA)`

#### Documentation

- New comprehensive guide: [docs/SPA-CRUD-GENERATORS.md](docs/SPA-CRUD-GENERATORS.md)
- Includes examples, field types, troubleshooting, and manual setup

---

## [1.0.0] - 2025-11-20

### 🔥 Major Refactoring - Granular Control & Best Practices

Complete overhaul: monolithic generators → **granular, configurable generators** with **maximum user control**.

### Added

#### **Advanced Model Generator** 🚀

- Model-only or with migration, factory, seeder, controller, resource, policy
- Traits: SoftDeletes, UUID, Searchable, Multi-tenant, Subdirectories
- Relationships: hasOne, hasMany, belongsTo, belongsToMany, morphTo, morphMany
- Fillable fields + timestamps control

#### **Smart Controller Generator** 🎮

- 6 types: Empty, Invokable, Resource, API, Model Resource, Custom
- Form Requests auto-generation
- Authorization policy injection
- API Resources transformation
- 12 custom methods: search, export, import, restore, forceDelete, etc.

#### **Interactive Migration Builder** 🗄️

- 7 migration types: Create/Modify/Drop Table, Add/Drop Column, Foreign Key, Index
- 15+ field types with modifiers (nullable, unique, default, unsigned, index, comment)
- Foreign key configuration with cascade delete
- Interactive field builder + manual definition

### Changed

- **Documentation**: Migrated to English, consolidated into README.md
- **Removed**: DEMO.md, USAGE.md, PROJECT*SUMMARY.md, ROUTES*\*.md, TESTING_GUIDE.md, src/README.md
- **Commands**: New "Advanced" prefix for granular generators
- **UI**: Multi-select, progress indicators, better validation

---

## [0.2.0] - 2025-01-20

### Added

- **Modular Route System**: 6 route types, interactive selection, organized in `routes/modules/`

---

## [0.1.0] - 2025-01-20

### Added

- Initial release: Artisan commands, CRUD generators, Blade/React/Vue/Livewire support, Vite integration

---

## [Unreleased]

### Planned for 1.1.0

- Policy Generator, Service Layer, Repository Pattern, Test Generator

### Planned for 1.2.0

- Inertia.js, GraphQL, Broadcasting, Localization

### Planned for 2.0.0

- AI suggestions, Visual schema designer, Code snippets library
