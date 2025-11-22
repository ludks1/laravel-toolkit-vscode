# Laravel Toolkit - Complete Documentation

**Laravel Toolkit v2.0** is a comprehensive Visual Studio Code extension that supercharges Laravel development with advanced code generators, complete CRUD scaffolding, and seamless Artisan integration.

[![VS Code](https://img.shields.io/badge/VS_Code-Extension-blue)](https://code.visualstudio.com/)
[![Laravel](https://img.shields.io/badge/Laravel-10%2B-red)](https://laravel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](../LICENSE.md)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange)]()

---

## 📑 Table of Contents

1. [Installation](#installation)
2. [Features Overview](#features-overview)
3. [Quick Start](#quick-start)
4. [Advanced Generators](#advanced-generators)
5. [SPA CRUD Generators](#spa-crud-generators)
6. [Artisan Integration](#artisan-integration)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)
11. [Changelog](#changelog)

---

## 🚀 Installation

### Via VS Code Marketplace

1. Open Visual Studio Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for **"Laravel Toolkit"**
4. Click **Install**

### Manual Installation

1. Download `.vsix` file from releases
2. Open VS Code
3. Press `Ctrl+Shift+P`
4. Type "Install from VSIX"
5. Select downloaded file

### Requirements

- **VS Code**: 1.103.0 or higher
- **Laravel**: 10.0 or higher
- **PHP**: 8.1+ (must be in PATH)
- **Node.js**: 18+ (for frontend generators)
- **Composer**: Latest version

---

## ✨ Features Overview

### **Advanced Code Generators**

- ✅ **Model Generator** with traits, relationships, fillables, subdirectories
- ✅ **Controller Generator** with 6 types (Empty, Invokable, Resource, API, Model, Custom)
- ✅ **Migration Builder** with 15+ field types, modifiers, foreign keys, indexes
- ✅ **Route System** with modular organization (Web, API, Admin, Auth)

### **SPA CRUD Scaffolding**

- ✅ **Vue 3 CRUD** - Complete SPA with Composition API, Composables, Vue Router
- ✅ **React CRUD** - Complete SPA with Hooks, Custom Hooks, React Router
- ✅ **REST API Generator** - Full API with Resources, Collections, Tests, Policies

### **Complete Artisan Integration**

- ✅ All Artisan commands accessible from sidebar
- ✅ Interactive prompts for all inputs
- ✅ Progress tracking for long operations
- ✅ Error handling with detailed messages

### **Visual Interface**

- ✅ Sidebar TreeView with organized categories
- ✅ Command Palette integration (`Ctrl+Shift+P`)
- ✅ Icon-based navigation
- ✅ Progress indicators

---

## 🎯 Quick Start

### 1. Open Laravel Project

1. Open your Laravel project folder in VS Code
2. Look for the **Laravel Toolkit** icon in the Activity Bar (left sidebar)

### 2. Create Your First Model

1. Click on **Laravel Toolkit** icon
2. Navigate to **Generators** → **Advanced Model**
3. Enter model name: `Product`
4. Select options:
   - ✅ Create migration
   - ✅ Create factory
   - ✅ Create controller
5. Add traits: `SoftDeletes`
6. Add fields: `name, description, price, stock`
7. Click **Generate**

### 3. Run Migration

1. Navigate to **Database** → **Run Migrations**
2. Confirm execution

**Done!** You now have a complete model with migration, factory, and controller.

---

## 🎨 Advanced Generators

### 1. Advanced Model Generator

**Access**: Sidebar → Generators → Advanced Model  
**Command**: `Laravel: Generate Advanced Model`

#### Features

**Creation Options**:
- Model only
- Model + Migration
- Model + Migration + Factory
- Model + Migration + Factory + Seeder
- Model + Migration + Factory + Controller
- Model + Migration + Factory + Controller + Resource
- Model + Migration + Factory + Controller + Resource + Policy

**Traits**:
- `SoftDeletes` - Soft delete functionality
- `HasUuids` - UUID primary key instead of auto-increment
- `Searchable` - Laravel Scout integration
- Custom traits support

**Relationships**:
- `hasOne` - One-to-one relationship
- `hasMany` - One-to-many relationship
- `belongsTo` - Inverse one-to-many
- `belongsToMany` - Many-to-many relationship
- `morphTo` - Polymorphic relationship
- `morphMany` - Inverse polymorphic
- `hasOneThrough` - Has one through
- `hasManyThrough` - Has many through

**Additional Options**:
- Custom fillable fields
- Subdirectory organization
- Enable/disable timestamps
- Custom table name
- Custom connection

#### Example Usage

**Scenario**: Create an e-commerce Product model

```bash
Command: Generate Advanced Model
Name: Product
Options: Model + Migration + Factory + Controller
Traits: SoftDeletes
Fillable: name, slug, description, price, stock, is_active
Relationships: 
  - belongsTo: Category
  - hasMany: Review
  - belongsToMany: Tag
```

**Generated Code**:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}
```

---

### 2. Smart Controller Generator

**Access**: Sidebar → Generators → Advanced Controller  
**Command**: `Laravel: Generate Advanced Controller`

#### Controller Types

1. **Empty Controller**
   - Basic controller structure
   - No pre-defined methods
   - Use for custom implementations

2. **Invokable Controller**
   - Single `__invoke()` method
   - Perfect for single-action controllers
   - Cleaner route definitions

3. **Resource Controller**
   - 7 RESTful methods
   - `index, create, store, show, edit, update, destroy`
   - For traditional web applications

4. **API Resource Controller**
   - 5 API methods (no create/edit)
   - `index, store, show, update, destroy`
   - JSON responses only

5. **Model Resource Controller**
   - Resource controller with model binding
   - Type-hinted parameters
   - Automatic model injection

6. **Custom Controller**
   - Select specific methods
   - Available methods:
     - Standard CRUD (7 methods)
     - `search` - Search functionality
     - `export` - Export data (CSV/Excel)
     - `import` - Import data
     - `restore` - Restore soft-deleted
     - `forceDelete` - Permanently delete
     - `duplicate` - Duplicate record
     - `toggle` - Toggle boolean fields
     - `bulkDelete` - Delete multiple records
     - `reorder` - Change order

#### Advanced Features

**Form Requests**:
- Auto-generate `Store{Model}Request`
- Auto-generate `Update{Model}Request`
- Validation rules based on field types
- Custom error messages

**Authorization**:
- Inject policy checks
- `$this->authorize('action', Model::class)`
- Automatic policy method calls

**API Resources**:
- Transform model to JSON
- Hide sensitive fields
- Add computed fields
- Nested relationships

**Eager Loading**:
- Automatic relationship loading
- Reduce N+1 queries
- Configurable relationships

#### Example Usage

**Scenario**: Create a blog Post controller with authorization and API resources

```bash
Command: Generate Advanced Controller
Name: PostController
Type: Model Resource Controller
Model: Post
Options:
  ✅ Generate Form Requests
  ✅ Add Authorization
  ✅ Use API Resources
  ✅ Eager Load Relationships
Relationships to load: user, category, tags
```

**Generated Code**:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Post::class);
        
        $posts = Post::with(['user', 'category', 'tags'])
            ->latest()
            ->paginate(15);

        return PostResource::collection($posts);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $this->authorize('create', Post::class);
        
        $post = Post::create($request->validated());

        return (new PostResource($post))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Post $post): PostResource
    {
        $this->authorize('view', $post);
        
        $post->load(['user', 'category', 'tags']);

        return new PostResource($post);
    }

    public function update(UpdatePostRequest $request, Post $post): PostResource
    {
        $this->authorize('update', $post);
        
        $post->update($request->validated());

        return new PostResource($post);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);
        
        $post->delete();

        return response()->json(null, 204);
    }
}
```

---

### 3. Interactive Migration Builder

**Access**: Sidebar → Generators → Advanced Migration  
**Command**: `Laravel: Generate Advanced Migration`

#### Supported Field Types

| Type | Database Type | Use Case |
|------|---------------|----------|
| `string` | VARCHAR(255) | Short text (names, titles) |
| `text` | TEXT | Long text (descriptions) |
| `integer` | INT | Whole numbers |
| `bigInteger` | BIGINT | Large whole numbers |
| `tinyInteger` | TINYINT | Small numbers (0-255) |
| `boolean` | BOOLEAN | True/false values |
| `decimal` | DECIMAL | Precise decimals (money) |
| `float` | FLOAT | Floating point numbers |
| `double` | DOUBLE | Double precision floats |
| `date` | DATE | Date only (YYYY-MM-DD) |
| `dateTime` | DATETIME | Date and time |
| `timestamp` | TIMESTAMP | Unix timestamp |
| `time` | TIME | Time only |
| `json` | JSON | JSON data |
| `jsonb` | JSONB | Binary JSON (PostgreSQL) |
| `uuid` | UUID | Unique identifiers |
| `enum` | ENUM | Predefined values |
| `foreignId` | BIGINT UNSIGNED | Foreign key |

#### Field Modifiers

- **nullable** - Allow NULL values
- **unique** - Unique constraint
- **default** - Default value
- **unsigned** - Unsigned numbers (positive only)
- **index** - Create index for faster queries
- **comment** - Add documentation

#### Special Features

**Foreign Keys**:
```php
$table->foreignId('user_id')
    ->constrained('users')
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

**Composite Indexes**:
```php
$table->index(['user_id', 'created_at']);
$table->unique(['email', 'tenant_id']);
```

**Enum Values**:
```php
$table->enum('status', ['draft', 'published', 'archived'])
    ->default('draft');
```

#### Example Usage

**Scenario**: Create a products table for e-commerce

```bash
Command: Generate Advanced Migration
Table: products
Fields:
  1. name (string, 100, unique, indexed)
  2. slug (string, 150, unique)
  3. description (text, nullable)
  4. price (decimal:10,2, unsigned, default: 0)
  5. compare_price (decimal:10,2, nullable)
  6. cost (decimal:10,2, nullable)
  7. stock (integer, unsigned, default: 0)
  8. is_active (boolean, default: true)
  9. published_at (timestamp, nullable)
  10. category_id (foreignId, constrained, cascade)
Indexes:
  - index: [is_active, published_at]
  - unique: [slug]
```

**Generated Migration**:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->index();
            $table->string('slug', 150)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->unsigned()->default(0);
            $table->decimal('compare_price', 10, 2)->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->integer('stock')->unsigned()->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('category_id')
                ->constrained('categories')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->timestamps();
            
            $table->index(['is_active', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

---

### 4. Modular Route System

**Access**: Sidebar → Generators → Route Management  
**Command**: `Laravel: Generate Route File`

#### Route Types

1. **Web Routes**
   - Traditional web application routes
   - With views
   - CSRF protection
   - Session-based

2. **API Routes**
   - RESTful API endpoints
   - JSON responses
   - Token-based auth
   - No CSRF

3. **Admin Routes**
   - Administrative panel
   - Prefix: `/admin`
   - Restricted access
   - Additional middleware

4. **Auth Routes**
   - Authentication routes
   - Login, Register, Logout
   - Password Reset
   - Email Verification

5. **Protected Routes**
   - Requires authentication
   - Middleware: `auth`
   - Optional verification

6. **Public Routes**
   - No authentication required
   - Open access

#### Features

**Route Selection**:
- Choose specific routes to generate
- Available routes:
  - `index` - List all resources
  - `create` - Show create form
  - `store` - Store new resource
  - `show` - Show single resource
  - `edit` - Show edit form
  - `update` - Update resource
  - `destroy` - Delete resource

**Configuration**:
- Custom prefix (`/admin`, `/api/v1`)
- Middleware groups (`auth`, `verified`, `admin`)
- Named routes (`admin.products.index`)
- Namespace organization

**Structure**:
```
routes/
├── web.php
├── api.php
└── modules/
    ├── web/
    │   ├── products.php
    │   └── orders.php
    ├── api/
    │   ├── users.php
    │   └── products.php
    └── admin/
        ├── dashboard.php
        └── settings.php
```

#### Example Usage

**Scenario**: Create admin routes for products with custom middleware

```bash
Command: Generate Route File
Module: products
Type: Admin Routes
Prefix: /admin
Middleware: auth, admin, verified
Routes: index, create, store, edit, update, destroy
Named Routes: admin.products.*
```

**Generated Code** (`routes/modules/admin/products.php`):

```php
<?php

use App\Http\Controllers\Admin\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin', 'verified'])
    ->prefix('admin')
    ->name('admin.products.')
    ->group(function () {
        Route::get('/products', [ProductController::class, 'index'])
            ->name('index');
        
        Route::get('/products/create', [ProductController::class, 'create'])
            ->name('create');
        
        Route::post('/products', [ProductController::class, 'store'])
            ->name('store');
        
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])
            ->name('edit');
        
        Route::put('/products/{product}', [ProductController::class, 'update'])
            ->name('update');
        
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])
            ->name('destroy');
    });
```

---

## 🌟 SPA CRUD Generators

### Vue 3 CRUD Generator

**Access**: Sidebar → Generators → Vue 3 CRUD  
**Command**: `Laravel: Generate Vue 3 CRUD (Complete SPA)`

#### What It Generates

**Backend (Laravel)**:
1. **Model** - Eloquent model with fillable and casts
2. **Migration** - Database schema
3. **API Controller** - RESTful controller with 5 methods
4. **API Resource** - JSON transformation
5. **Form Requests** - Validation (Store + Update)
6. **API Routes** - `apiResource` routes

**Frontend (Vue 3)**:
1. **List Component** - Table with pagination, search, delete
2. **Form Component** - Create/Edit form with validation
3. **Show Component** - Detail view
4. **Composable** - State management and API calls
5. **Router Routes** - Vue Router integration

#### Field Types Supported

| Field Type | Migration | Validation | Input Type |
|------------|-----------|-----------|-----------|
| string | VARCHAR(255) | string\|max:255 | text |
| text | TEXT | string | textarea |
| integer | INTEGER | integer | number |
| bigint | BIGINT | integer | number |
| decimal | DECIMAL | numeric | number |
| float | FLOAT | numeric | number |
| double | DOUBLE | numeric | number |
| boolean | BOOLEAN | boolean | checkbox |
| date | DATE | date | date |
| datetime | DATETIME | date | datetime-local |
| timestamp | TIMESTAMP | date | datetime-local |
| json | JSON | array | textarea |

#### Example Usage

**Scenario**: Create a blog post CRUD with Vue 3

```bash
Command: Generate Vue 3 CRUD
Model: Post
Fields: title:string,slug:string,content:text,excerpt:text,published:boolean,published_at:datetime,view_count:integer
```

**Generated Structure**:
```
Backend:
├── app/Models/Post.php
├── app/Http/Controllers/Api/PostController.php
├── app/Http/Resources/PostResource.php
├── app/Http/Requests/StorePostRequest.php
├── app/Http/Requests/UpdatePostRequest.php
├── database/migrations/xxxx_create_posts_table.php
└── routes/api.php (updated)

Frontend:
├── resources/js/components/Post/
│   ├── PostList.vue
│   ├── PostForm.vue
│   └── PostShow.vue
├── resources/js/composables/
│   └── usePosts.js
└── resources/js/router.js (updated)
```

**Generated Composable** (`usePosts.js`):

```javascript
import { ref } from 'vue';
import axios from 'axios';

export function usePosts() {
    const posts = ref([]);
    const post = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const errors = ref({});
    const pagination = ref(null);

    const fetchPosts = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/api/posts?page=${page}`);
            posts.value = response.data.data;
            pagination.value = response.data.meta;
        } catch (err) {
            error.value = err.response?.data?.message || err.message;
        } finally {
            loading.value = false;
        }
    };

    const fetchPost = async (id) => {
        loading.value = true;
        try {
            const response = await axios.get(`/api/posts/${id}`);
            post.value = response.data.data;
            return post.value;
        } catch (err) {
            error.value = err.response?.data?.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createPost = async (data) => {
        loading.value = true;
        errors.value = {};
        try {
            const response = await axios.post('/api/posts', data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                errors.value = err.response.data.errors;
            }
            error.value = err.response?.data?.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updatePost = async (id, data) => {
        loading.value = true;
        errors.value = {};
        try {
            const response = await axios.put(`/api/posts/${id}`, data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                errors.value = err.response.data.errors;
            }
            error.value = err.response?.data?.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deletePost = async (id) => {
        loading.value = true;
        try {
            await axios.delete(`/api/posts/${id}`);
            return true;
        } catch (err) {
            error.value = err.response?.data?.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        posts,
        post,
        loading,
        error,
        errors,
        pagination,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
    };
}
```

**Usage in Component**:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { usePosts } from '@/composables/usePosts';

const { posts, loading, error, fetchPosts, deletePost } = usePosts();

onMounted(() => {
    fetchPosts();
});

const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
        await deletePost(id);
        fetchPosts();
    }
};
</script>

<template>
    <div>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div v-else>
            <table>
                <tr v-for="post in posts" :key="post.id">
                    <td>{{ post.title }}</td>
                    <td>
                        <button @click="handleDelete(post.id)">Delete</button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
```

---

### React CRUD Generator

**Access**: Sidebar → Generators → React CRUD  
**Command**: `Laravel: Generate React CRUD (Complete SPA)`

#### What It Generates

**Backend**: Same as Vue 3 generator

**Frontend (React)**:
1. **List Component** - Table with pagination, search, delete
2. **Form Component** - Create/Edit form with validation
3. **Show Component** - Detail view
4. **Custom Hook** - State management and API calls
5. **Router Routes** - React Router integration

#### Example Usage

**Scenario**: Create a product CRUD with React

```bash
Command: Generate React CRUD
Model: Product
Fields: name:string,sku:string,description:text,price:decimal,stock:integer,is_active:boolean
```

**Generated Custom Hook** (`useProducts.js`):

```javascript
import { useState } from 'react';
import axios from 'axios';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [pagination, setPagination] = useState(null);

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/products?page=${page}`);
            setProducts(response.data.data);
            setPagination(response.data.meta);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProduct = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/products/${id}`);
            setProduct(response.data.data);
            return response.data.data;
        } catch (err) {
            setError(err.response?.data?.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (data) => {
        setLoading(true);
        setErrors({});
        try {
            const response = await axios.post('/api/products', data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
            setError(err.response?.data?.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id, data) => {
        setLoading(true);
        setErrors({});
        try {
            const response = await axios.put(`/api/products/${id}`, data);
            return response.data.data;
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
            setError(err.response?.data?.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/products/${id}`);
            return true;
        } catch (err) {
            setError(err.response?.data?.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        products,
        product,
        loading,
        error,
        errors,
        pagination,
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct,
    };
}
```

**Usage in Component**:

```jsx
import React, { useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';

export default function ProductList() {
    const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <table>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.price}</td>
                            <td>
                                <button onClick={() => handleDelete(product.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

### REST API Generator

**Access**: Sidebar → Generators → REST API  
**Command**: `Laravel: Generate REST API`

#### What It Generates

1. **Model** - Eloquent model
2. **Migration** - Database schema
3. **API Controller** - Full CRUD operations
4. **API Resource** - Single resource transformation
5. **API Collection** - Collection transformation with meta
6. **Form Requests** - Store and Update validation
7. **Policy** - Authorization rules
8. **Feature Tests** - 7 API test cases
9. **API Routes** - RESTful routes

#### API Types

1. **Complete API**
   - All 9 components
   - Full test coverage
   - Authorization included

2. **Basic API**
   - Model, Controller, Routes
   - No tests or policies
   - Quick setup

3. **Custom API**
   - Select specific components
   - Flexible configuration

#### Features

**Versioning**:
- Support for v1, v2 API versions
- Namespace organization
- Version-specific routes

**Authentication**:
- Laravel Sanctum
- Laravel Passport
- JWT (tymon/jwt-auth)
- None (public API)

**Response Format**:
```json
{
    "data": {
        "id": 1,
        "name": "Product Name",
        "price": "99.99",
        "created_at": "2024-01-01T00:00:00.000000Z"
    },
    "meta": {
        "current_page": 1,
        "total_pages": 10,
        "per_page": 15,
        "total": 150
    }
}
```

#### Example Usage

**Scenario**: Create a complete API for products

```bash
Command: Generate REST API
Model: Product
Fields: name:string,price:decimal,stock:integer
API Type: Complete
Version: v1
Authentication: Sanctum
Options:
  ✅ Generate Migration
  ✅ Generate Tests
  ✅ Generate Policy
```

**Generated Tests** (`tests/Feature/ProductApiTest.php`):

```php
<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products()
    {
        $user = User::factory()->create();
        Product::factory()->count(5)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'price', 'stock']
                ],
                'meta'
            ]);
    }

    public function test_can_create_product()
    {
        $user = User::factory()->create();
        $data = [
            'name' => 'Test Product',
            'price' => 99.99,
            'stock' => 100
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/products', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Test Product');
        
        $this->assertDatabaseHas('products', $data);
    }

    public function test_can_show_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_can_update_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $data = ['name' => 'Updated Name'];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/products/{$product->id}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_can_delete_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_validates_required_fields()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price', 'stock']);
    }

    public function test_requires_authentication()
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(401);
    }
}
```

---

## 🔧 Artisan Integration

### Available Commands

#### Model Commands
- **Make Model** - Create Eloquent model
- **Make Factory** - Create model factory
- **Make Seeder** - Create database seeder

#### Controller Commands
- **Make Controller** - Create HTTP controller
- **Make Resource Controller** - Create resource controller
- **Make API Controller** - Create API controller

#### Database Commands
- **Make Migration** - Create migration file
- **Run Migrations** - Execute pending migrations
- **Rollback Migrations** - Rollback last batch
- **Refresh Migrations** - Rollback and re-run
- **Fresh Migrations** - Drop all tables and migrate
- **Fresh + Seed** - Fresh migrations with seeders

#### Request & Validation
- **Make Form Request** - Create validation request
- **Make Rule** - Create validation rule

#### Middleware & Policies
- **Make Middleware** - Create HTTP middleware
- **Make Policy** - Create authorization policy

#### Testing
- **Make Test** - Create PHPUnit test
- **Run Tests** - Execute test suite

#### Cache & Optimization
- **Clear Cache** - Clear application cache
- **Clear Config** - Clear config cache
- **Clear Routes** - Clear route cache
- **Clear Views** - Clear compiled views
- **Optimize** - Optimize application

#### Other
- **Tinker** - Open interactive shell
- **Route List** - List all routes
- **Serve** - Start development server

---

## ⚙️ Configuration

### Extension Settings

Access via: `File` → `Preferences` → `Settings` → Search "Laravel Toolkit"

```json
{
  // PHP executable path
  "laravelToolkit.phpPath": "php",
  
  // Composer executable path
  "laravelToolkit.composerPath": "composer",
  
  // Default frontend framework
  "laravelToolkit.defaultFramework": "blade",
  
  // Auto-detect framework from package.json
  "laravelToolkit.autoDetectFramework": true,
  
  // Enable debug logging
  "laravelToolkit.debug": false,
  
  // Default API version
  "laravelToolkit.defaultApiVersion": "v1",
  
  // Default authentication type for APIs
  "laravelToolkit.defaultAuthType": "sanctum"
}
```

### Framework Auto-Detection

The extension automatically detects your frontend framework:

- **Vue**: Checks for `vue` in dependencies
- **React**: Checks for `react` in dependencies
- **Livewire**: Checks for `livewire/livewire` in composer.json
- **Inertia**: Checks for `inertiajs` packages

### Workspace Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "laravelToolkit.phpPath": "/usr/local/bin/php8.2",
  "laravelToolkit.composerPath": "/usr/local/bin/composer",
  "laravelToolkit.defaultFramework": "react"
}
```

---

## 📚 Best Practices

### Models

✅ **DO**:
- Use soft deletes for important data
- Define all relationships
- Set `$fillable` or `$guarded`
- Use proper casting for attributes
- Add docblocks for IDE support
- Organize in subdirectories by domain

❌ **DON'T**:
- Mass assign without protection
- Skip relationship definitions
- Mix business logic in models
- Use raw SQL in models

**Example**:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property float $price
 * @property \Carbon\Carbon $created_at
 */
class Product extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'price', 'stock'];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

---

### Controllers

✅ **DO**:
- Keep controllers thin
- Use Form Requests for validation
- Add authorization checks
- Use resource controllers for CRUD
- Return consistent responses
- Use dependency injection

❌ **DON'T**:
- Put business logic in controllers
- Skip validation
- Return inconsistent formats
- Use too many dependencies

**Example**:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function store(StoreProductRequest $request)
    {
        $this->authorize('create', Product::class);
        
        $product = $this->productService->create(
            $request->validated()
        );

        return new ProductResource($product);
    }
}
```

---

### Migrations

✅ **DO**:
- Use descriptive names
- Index foreign keys
- Set appropriate defaults
- Add comments for complex fields
- Use proper data types
- Create separate migrations for changes

❌ **DON'T**:
- Edit deployed migrations
- Skip indexes on foreign keys
- Use TEXT for short strings
- Forget to add down() method

**Example**:
```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->index();
    $table->string('slug')->unique();
    $table->decimal('price', 10, 2)->unsigned();
    $table->foreignId('category_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->timestamps();
    $table->softDeletes();
    
    // Composite index for common queries
    $table->index(['category_id', 'created_at']);
});
```

---

### API Development

✅ **DO**:
- Use API Resources for responses
- Version your APIs
- Add pagination
- Use proper HTTP status codes
- Include meta information
- Add rate limiting
- Document with OpenAPI/Swagger

❌ **DON'T**:
- Return raw models
- Skip versioning
- Return all fields
- Use inconsistent formats

**Example**:
```php
// API Resource
class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price,
            'category' => new CategoryResource(
                $this->whenLoaded('category')
            ),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

// Controller
public function index()
{
    $products = Product::with('category')
        ->paginate(15);

    return ProductResource::collection($products);
}
```

---

### Testing

✅ **DO**:
- Write tests for all API endpoints
- Test validation rules
- Test authorization
- Use factories for test data
- Test edge cases
- Use RefreshDatabase

❌ **DON'T**:
- Skip tests
- Test only happy path
- Use production data
- Forget to test failures

**Example**:
```php
public function test_cannot_create_product_without_name()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)
        ->postJson('/api/products', [
            'price' => 99.99
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
}
```

---

## 💡 Examples

### Example 1: E-Commerce Product Management

**Goal**: Create complete product management system

**Steps**:

1. **Create Product Model**
```bash
Command: Generate Advanced Model
Name: Product
Options: Model + Migration + Factory + Controller + Resource
Traits: SoftDeletes
Fillable: name, slug, description, price, compare_price, cost, stock, is_active
Relationships:
  - belongsTo: Category
  - hasMany: Review
  - belongsToMany: Tag
  - morphMany: Image
```

2. **Create API**
```bash
Command: Generate REST API
Model: Product
Version: v1
Auth: Sanctum
Generate: All components
```

3. **Create Frontend**
```bash
Command: Generate Vue 3 CRUD
Model: Product
Fields: name:string,price:decimal,stock:integer
```

4. **Run Migrations**
```bash
Command: Run Migrations
```

**Result**: Complete product management with API, frontend, and tests!

---

### Example 2: Blog System

**Goal**: Create blog with posts, categories, and comments

**Steps**:

1. **Create Category**
```bash
Model: Category
Fields: name:string,slug:string,description:text
```

2. **Create Post**
```bash
Model: Post
Fields: title:string,slug:string,content:text,published_at:datetime
Relationships:
  - belongsTo: User
  - belongsTo: Category
  - hasMany: Comment
```

3. **Create Comment**
```bash
Model: Comment
Fields: content:text,approved:boolean
Relationships:
  - belongsTo: User
  - belongsTo: Post
```

4. **Generate CRUDs**
```bash
- Generate Vue 3 CRUD for Category
- Generate Vue 3 CRUD for Post
- Generate API for Comment
```

**Result**: Complete blog system with frontend!

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "PHP not found in PATH"

**Solution**:
```json
// .vscode/settings.json
{
  "laravelToolkit.phpPath": "C:\\php\\php.exe"  // Windows
  "laravelToolkit.phpPath": "/usr/bin/php"      // Linux/Mac
}
```

#### 2. "Composer not found"

**Solution**:
```json
{
  "laravelToolkit.composerPath": "C:\\composer\\composer.bat"
}
```

#### 3. "Routes not found"

**Solution**:
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache
```

#### 4. "Migration already exists"

**Solution**:
- Delete existing migration file
- Or rename the new migration

#### 5. "API endpoints return 404"

**Solution**:
```bash
# Check routes
php artisan route:list

# Clear cache
php artisan optimize:clear
```

#### 6. "Vue/React components not rendering"

**Solution**:
```bash
# Install dependencies
npm install

# Compile assets
npm run dev
```

#### 7. "Validation not working"

**Solution**:
- Check Form Request files
- Verify validation rules
- Check API responses in Network tab

#### 8. "CORS errors"

**Solution**:
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
```

---

## 📝 Changelog

### Version 2.0.0 (2024-11-21)

**🎉 NEW FEATURES**:

- ✅ **Vue 3 CRUD Generator** - Complete SPA scaffolding with Composition API
- ✅ **React CRUD Generator** - Complete SPA scaffolding with Hooks
- ✅ **REST API Generator** - Full API with tests and policies
- ✅ **Enhanced UI** - New icon and improved dashboard
- ✅ **Better Documentation** - Consolidated documentation

**🔧 IMPROVEMENTS**:

- Better error handling in all generators
- Improved file existence checks
- Enhanced validation in forms
- Better type safety in generated code
- Improved pagination in SPAs

**🐛 BUG FIXES**:

- Fixed route registration issues
- Fixed validation error display
- Fixed pagination metadata
- Fixed file overwrite confirmations

---

### Version 1.0.0 (2024-11-20)

**Initial Release**:

- Advanced Model Generator
- Smart Controller Generator
- Interactive Migration Builder
- Modular Route System
- Complete Artisan Integration
- Visual TreeView Interface

---

## 📄 License

MIT License - See [LICENSE.md](../LICENSE.md) for details

---

## 👨‍💻 Author

**Steinly**

Made with ❤️ for the Laravel community

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 🙏 Acknowledgments

- Laravel Community
- VS Code Extension API
- Vue.js & React Communities

---

## 📞 Support

- **Email**: ludwindrts@gmail.com

---

**Thank you for using Laravel Toolkit!** 🚀

Made with 💙 for Laravel developers
