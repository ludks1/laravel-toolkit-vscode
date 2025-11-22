const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const {
  getLaravelRootPath,
  showInputBox,
  showQuickPick,
  toPascalCase,
  toSnakeCase,
  ensureDirectoryExists,
} = require("../utils/helpers");

/**
 * Generate Test File
 */
async function generateTest() {
  const testName = await showInputBox({
    prompt: "Test class name (PascalCase, without 'Test' suffix)",
    placeHolder: "User, Product, OrderController",
    validateInput: (value) => {
      if (!value) return "Test name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!testName) return;

  const testType = await showQuickPick(
    [
      {
        label: "Feature Test",
        value: "feature",
        description: "Test HTTP endpoints and user interactions",
      },
      {
        label: "Unit Test",
        value: "unit",
        description: "Test individual classes and methods",
      },
      {
        label: "Model Test",
        value: "model",
        description: "Test model relationships and attributes",
      },
      {
        label: "API Test",
        value: "api",
        description: "Test API endpoints with JSON responses",
      },
    ],
    { placeHolder: "Select test type" }
  );

  if (!testType) return;

  // @ts-ignore
  const selectedType = testType.value || testType;

  try {
    const rootPath = getLaravelRootPath();
    const testPath =
      selectedType === "unit"
        ? path.join(rootPath, "tests", "Unit")
        : path.join(rootPath, "tests", "Feature");

    ensureDirectoryExists(testPath);

    const content = generateTestContent(testName, selectedType);
    const filePath = path.join(testPath, `${testName}Test.php`);

    fs.writeFileSync(filePath, content);

    vscode.window.showInformationMessage(
      `✅ Test ${testName}Test created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate test content based on type
 */
function generateTestContent(name, type) {
  const namespace = type === "unit" ? "Tests\\Unit" : "Tests\\Feature";

  if (type === "model") {
    return `<?php

namespace ${namespace};

use Tests\\TestCase;
use App\\Models\\${name};
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class ${name}Test extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_be_created()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $this->assertInstanceOf(${name}::class, $${toSnakeCase(name)});
        $this->assertDatabaseHas('${toSnakeCase(name)}s', [
            'id' => $${toSnakeCase(name)}->id,
        ]);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        $${toSnakeCase(name)} = new ${name}();
        
        $this->assertEquals([
            // Add your fillable attributes here
        ], $${toSnakeCase(name)}->getFillable());
    }

    /** @test */
    public function it_has_casts()
    {
        $${toSnakeCase(name)} = new ${name}();
        
        $this->assertEquals([
            'id' => 'int',
            // Add your casts here
        ], $${toSnakeCase(name)}->getCasts());
    }

    // Add relationship tests here
    // Example:
    // /** @test */
    // public function it_belongs_to_user()
    // {
    //     $${toSnakeCase(name)} = ${name}::factory()->create();
    //     
    //     $this->assertInstanceOf(User::class, $${toSnakeCase(name)}->user);
    // }
}
`;
  } else if (type === "api") {
    return `<?php

namespace ${namespace};

use Tests\\TestCase;
use App\\Models\\${name};
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class ${name}Test extends TestCase
{
    use RefreshDatabase;

    protected $endpoint = '/api/${toSnakeCase(name)}s';

    /** @test */
    public function it_can_list_${toSnakeCase(name)}s()
    {
        ${name}::factory()->count(3)->create();

        $response = $this->getJson($this->endpoint);

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_create_a_${toSnakeCase(name)}()
    {
        $data = [
            // Add your data here
            'name' => 'Test ${name}',
        ];

        $response = $this->postJson($this->endpoint, $data);

        $response->assertStatus(201)
            ->assertJson([
                'data' => $data
            ]);

        $this->assertDatabaseHas('${toSnakeCase(name)}s', $data);
    }

    /** @test */
    public function it_can_show_a_${toSnakeCase(name)}()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $response = $this->getJson("{$this->endpoint}/{$${toSnakeCase(name)}->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $${toSnakeCase(name)}->id,
                ]
            ]);
    }

    /** @test */
    public function it_can_update_a_${toSnakeCase(name)}()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();
        $data = [
            // Add your data here
            'name' => 'Updated ${name}',
        ];

        $response = $this->putJson("{$this->endpoint}/{$${toSnakeCase(name)}->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'data' => $data
            ]);

        $this->assertDatabaseHas('${toSnakeCase(name)}s', $data);
    }

    /** @test */
    public function it_can_delete_a_${toSnakeCase(name)}()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $response = $this->deleteJson("{$this->endpoint}/{$${toSnakeCase(name)}->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('${toSnakeCase(name)}s', [
            'id' => $${toSnakeCase(name)}->id
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson($this->endpoint, []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']); // Add your required fields
    }
}
`;
  } else if (type === "feature") {
    return `<?php

namespace ${namespace};

use Tests\\TestCase;
use App\\Models\\${name};
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class ${name}Test extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_display_${toSnakeCase(name)}_index_page()
    {
        $response = $this->get('/${toSnakeCase(name)}s');

        $response->assertStatus(200);
        $response->assertViewIs('${toSnakeCase(name)}s.index');
    }

    /** @test */
    public function it_can_display_${toSnakeCase(name)}_create_page()
    {
        $response = $this->get('/${toSnakeCase(name)}s/create');

        $response->assertStatus(200);
        $response->assertViewIs('${toSnakeCase(name)}s.create');
    }

    /** @test */
    public function it_can_store_a_${toSnakeCase(name)}()
    {
        $data = [
            // Add your data here
            'name' => 'Test ${name}',
        ];

        $response = $this->post('/${toSnakeCase(name)}s', $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('${toSnakeCase(name)}s', $data);
    }

    /** @test */
    public function it_can_display_${toSnakeCase(name)}_show_page()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $response = $this->get("/${toSnakeCase(name)}s/{$${toSnakeCase(name)}->id}");

        $response->assertStatus(200);
        $response->assertViewIs('${toSnakeCase(name)}s.show');
        $response->assertViewHas('${toSnakeCase(name)}', $${toSnakeCase(name)});
    }

    /** @test */
    public function it_can_display_${toSnakeCase(name)}_edit_page()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $response = $this->get("/${toSnakeCase(name)}s/{$${toSnakeCase(name)}->id}/edit");

        $response->assertStatus(200);
        $response->assertViewIs('${toSnakeCase(name)}s.edit');
        $response->assertViewHas('${toSnakeCase(name)}', $${toSnakeCase(name)});
    }

    /** @test */
    public function it_can_update_a_${toSnakeCase(name)}()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();
        $data = [
            // Add your data here
            'name' => 'Updated ${name}',
        ];

        $response = $this->put("/${toSnakeCase(name)}s/{$${toSnakeCase(name)}->id}", $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('${toSnakeCase(name)}s', $data);
    }

    /** @test */
    public function it_can_delete_a_${toSnakeCase(name)}()
    {
        $${toSnakeCase(name)} = ${name}::factory()->create();

        $response = $this->delete("/${toSnakeCase(name)}s/{$${toSnakeCase(name)}->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('${toSnakeCase(name)}s', [
            'id' => $${toSnakeCase(name)}->id
        ]);
    }
}
`;
  } else {
    // unit
    return `<?php

namespace ${namespace};

use PHPUnit\\Framework\\TestCase;
use App\\Models\\${name};

class ${name}Test extends TestCase
{
    /** @test */
    public function it_can_be_instantiated()
    {
        $${toSnakeCase(name)} = new ${name}();

        $this->assertInstanceOf(${name}::class, $${toSnakeCase(name)});
    }

    /** @test */
    public function it_has_correct_properties()
    {
        // Add your property tests here
        $this->assertTrue(true);
    }

    /** @test */
    public function it_can_perform_specific_action()
    {
        // Add your method tests here
        $this->assertTrue(true);
    }

    // Add more tests for methods, calculations, validations, etc.
}
`;
  }
}

/**
 * Generate Service Class
 */
async function generateService() {
  const serviceName = await showInputBox({
    prompt: "Service class name (without 'Service' suffix)",
    placeHolder: "User, Order, Payment",
    validateInput: (value) => {
      if (!value) return "Service name is required";
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
        return "Name must be in PascalCase";
      }
      return null;
    },
  });

  if (!serviceName) return;

  const serviceType = await showQuickPick(
    [
      {
        label: "Repository Pattern",
        value: "repository",
        description: "Service with repository pattern",
      },
      {
        label: "Action Pattern",
        value: "action",
        description: "Single action service class",
      },
      {
        label: "Business Logic",
        value: "business",
        description: "General business logic service",
      },
    ],
    { placeHolder: "Select service type" }
  );

  if (!serviceType) return;

  // @ts-ignore
  const selectedType = serviceType.value || serviceType;

  try {
    const rootPath = getLaravelRootPath();
    const servicesPath = path.join(rootPath, "app", "Services");

    ensureDirectoryExists(servicesPath);

    const content = generateServiceContent(serviceName, selectedType);
    const filePath = path.join(
      servicesPath,
      `${serviceName}Service.php`
    );

    fs.writeFileSync(filePath, content);

    vscode.window.showInformationMessage(
      `✅ Service ${serviceName}Service created successfully`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
  }
}

/**
 * Generate service content
 */
function generateServiceContent(name, type) {
  if (type === "repository") {
    return `<?php

namespace App\\Services;

use App\\Models\\${name};
use Illuminate\\Database\\Eloquent\\Collection;
use Illuminate\\Pagination\\LengthAwarePaginator;

class ${name}Service
{
    public function __construct(
        protected ${name} $model
    ) {}

    /**
     * Get all ${toSnakeCase(name)}s
     */
    public function getAll(): Collection
    {
        return $this->model->all();
    }

    /**
     * Get paginated ${toSnakeCase(name)}s
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->paginate($perPage);
    }

    /**
     * Find ${toSnakeCase(name)} by ID
     */
    public function find(int $id): ?${name}
    {
        return $this->model->find($id);
    }

    /**
     * Create a new ${toSnakeCase(name)}
     */
    public function create(array $data): ${name}
    {
        return $this->model->create($data);
    }

    /**
     * Update ${toSnakeCase(name)}
     */
    public function update(int $id, array $data): bool
    {
        $${toSnakeCase(name)} = $this->find($id);
        
        if (!$${toSnakeCase(name)}) {
            return false;
        }

        return $${toSnakeCase(name)}->update($data);
    }

    /**
     * Delete ${toSnakeCase(name)}
     */
    public function delete(int $id): bool
    {
        $${toSnakeCase(name)} = $this->find($id);
        
        if (!$${toSnakeCase(name)}) {
            return false;
        }

        return $${toSnakeCase(name)}->delete();
    }

    /**
     * Search ${toSnakeCase(name)}s
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->where('name', 'like', "%{$query}%")
            // Add more search conditions
            ->get();
    }
}
`;
  } else if (type === "action") {
    return `<?php

namespace App\\Services;

use App\\Models\\${name};

class ${name}Service
{
    /**
     * Execute the action
     */
    public function execute(array $data): ${name}
    {
        // Validate data
        $this->validate($data);

        // Perform business logic
        $${toSnakeCase(name)} = $this->process($data);

        // Trigger events if needed
        // event(new ${name}Created($${toSnakeCase(name)}));

        return $${toSnakeCase(name)};
    }

    /**
     * Validate data
     */
    protected function validate(array $data): void
    {
        // Add your validation logic here
    }

    /**
     * Process the action
     */
    protected function process(array $data): ${name}
    {
        // Add your business logic here
        return ${name}::create($data);
    }
}
`;
  } else {
    // business
    return `<?php

namespace App\\Services;

use App\\Models\\${name};
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Log;

class ${name}Service
{
    /**
     * Handle ${toSnakeCase(name)} creation with business logic
     */
    public function create${name}(array $data): ${name}
    {
        return DB::transaction(function () use ($data) {
            // Create the ${toSnakeCase(name)}
            $${toSnakeCase(name)} = ${name}::create($data);

            // Perform additional business logic
            $this->handleAdditionalLogic($${toSnakeCase(name)});

            // Log the action
            Log::info("${name} created", ['id' => $${toSnakeCase(name)}->id]);

            return $${toSnakeCase(name)};
        });
    }

    /**
     * Handle ${toSnakeCase(name)} update with business logic
     */
    public function update${name}(${name} $${toSnakeCase(name)}, array $data): ${name}
    {
        return DB::transaction(function () use ($${toSnakeCase(name)}, $data) {
            // Update the ${toSnakeCase(name)}
            $${toSnakeCase(name)}->update($data);

            // Perform additional business logic
            $this->handleAdditionalLogic($${toSnakeCase(name)});

            // Log the action
            Log::info("${name} updated", ['id' => $${toSnakeCase(name)}->id]);

            return $${toSnakeCase(name)};
        });
    }

    /**
     * Handle ${toSnakeCase(name)} deletion with business logic
     */
    public function delete${name}(${name} $${toSnakeCase(name)}): bool
    {
        return DB::transaction(function () use ($${toSnakeCase(name)}) {
            // Perform pre-deletion logic
            $this->handlePreDeletion($${toSnakeCase(name)});

            // Delete the ${toSnakeCase(name)}
            $deleted = $${toSnakeCase(name)}->delete();

            // Log the action
            Log::info("${name} deleted", ['id' => $${toSnakeCase(name)}->id]);

            return $deleted;
        });
    }

    /**
     * Additional business logic
     */
    protected function handleAdditionalLogic(${name} $${toSnakeCase(name)}): void
    {
        // Add your custom business logic here
        // Example: Send notifications, update related records, etc.
    }

    /**
     * Pre-deletion logic
     */
    protected function handlePreDeletion(${name} $${toSnakeCase(name)}): void
    {
        // Add your pre-deletion logic here
        // Example: Delete related records, send notifications, etc.
    }
}
`;
  }
}

module.exports = {
  generateTest,
  generateService,
};
