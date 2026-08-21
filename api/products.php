<?php
require_once __DIR__ . '/auth.php';

/* Default products written once if data file doesn't exist */
$defaultProducts = [
    [
        'id'              => 'aqua-neptune',
        'name'            => 'Aqua Neptune',
        'image'           => 'assets/products/1.avif',
        'colorImages'     => [
            'assets/images/product1/1.avif',
            'assets/images/product1/2.avif',
            'assets/images/product1/2.avif',
        ],
        'category'        => 'multibrand-water-purifiers',
        'descriptionList' => [
            'Production capacity - 15 LPH',
            'Tank capacity - 10 L',
            'Food grade, non-breakable build',
            'ABS plastic construction',
            '10 liters storage',
            'LED indicator',
            'Auto on/off',
        ],
        'variants'        => [
            ['name' => 'RO + Minerals',            'price' => 8999],
            ['name' => 'RO + Minerals + Alkaline', 'price' => 9999],
            ['name' => 'RO + Minerals + Copper',   'price' => 9999],
        ],
        'includedItems'   => 'Stand, Cover, Pre-filter, Installation',
    ],
    [
        'id'              => 'aqua-purosis',
        'name'            => 'Aqua Purosis',
        'image'           => 'assets/products/2.avif',
        'colorImages'     => [],
        'category'        => 'multibrand-water-purifiers',
        'descriptionList' => [
            'Production capacity - 18 LPH',
            'Tank capacity - 12 L',
            'Wall-mounted, slim profile',
            'Multi-stage sediment + carbon filtration',
            '12 liters storage',
            'LED indicator',
            'Auto on/off',
        ],
        'variants'        => [
            ['name' => 'RO + Minerals',            'price' => 12499],
            ['name' => 'RO + Minerals + Alkaline', 'price' => 13499],
            ['name' => 'RO + Minerals + Copper',   'price' => 13499],
        ],
        'includedItems'   => 'Wall Bracket, Cover, Pre-filter, Installation',
    ],
    [
        'id'              => 'prolife-water-purifier',
        'name'            => 'Prolife Water Purifier',
        'image'           => 'assets/products/3.avif',
        'colorImages'     => [],
        'category'        => 'domestic-water-purifiers',
        'descriptionList' => [
            'Production capacity - 20 LPH',
            'Tank capacity - 10 L',
            'Smart digital display',
            'Copper-infused filtration',
            '10 liters storage',
            'LED indicator',
            'Auto on/off',
        ],
        'variants'        => [
            ['name' => 'RO + Minerals',            'price' => 15999],
            ['name' => 'RO + Minerals + Alkaline', 'price' => 16999],
            ['name' => 'RO + Minerals + Copper',   'price' => 16999],
        ],
        'includedItems'   => 'Stand, Cover, Pre-filter, Installation',
    ],
    [
        'id'              => 'aqua-oyster',
        'name'            => 'Aqua Oyster',
        'image'           => 'assets/products/4.avif',
        'colorImages'     => [],
        'category'        => 'domestic-water-purifiers',
        'descriptionList' => [
            'Production capacity - 15 LPH',
            'Tank capacity - 8 L',
            'Dual-tone under-counter design',
            'ABS plastic construction',
            '8 liters storage',
            'LED indicator',
            'Auto on/off',
        ],
        'variants'        => [
            ['name' => 'RO + Minerals',            'price' => 10999],
            ['name' => 'RO + Minerals + Alkaline', 'price' => 11999],
            ['name' => 'RO + Minerals + Copper',   'price' => 11999],
        ],
        'includedItems'   => 'Stand, Cover, Pre-filter, Installation',
    ],
];

/* Seed data file on first run */
if (!file_exists(PRODUCTS_FILE)) {
    writeJson(PRODUCTS_FILE, $defaultProducts);
}

$method = $_SERVER['REQUEST_METHOD'];

/* ---------- GET — list all ---------- */
if ($method === 'GET') {
    ok(readJson(PRODUCTS_FILE, $defaultProducts));
}

/* ---------- POST — create ---------- */
if ($method === 'POST') {
    requireAuth();
    $body = bodyJson();

    $name = trim($body['name'] ?? '');
    if ($name === '') fail('Product name is required.');

    $products = readJson(PRODUCTS_FILE, []);

    /* Generate unique ID */
    $baseId = slugify($name);
    $id = $baseId;
    $suffix = 1;
    $existingIds = array_column($products, 'id');
    while (in_array($id, $existingIds)) {
        $id = $baseId . '-' . $suffix++;
    }

    $product = [
        'id'              => $id,
        'name'            => $name,
        'image'           => $body['image'] ?? '',
        'colors'          => $body['colors'] ?? [],
        'category'        => $body['category'] ?? '',
        'descriptionList' => array_values(array_filter($body['descriptionList'] ?? [])),
        'variants'        => $body['variants'] ?? [],
        'includedItems'   => $body['includedItems'] ?? '',
    ];

    $products[] = $product;
    writeJson(PRODUCTS_FILE, $products);
    ok($product, 201);
}

/* ---------- PUT — update by id ---------- */
if ($method === 'PUT') {
    requireAuth();
    $id = trim($_GET['id'] ?? '');
    if ($id === '') fail('id query param required.');

    $products = readJson(PRODUCTS_FILE, []);
    $idx = -1;
    foreach ($products as $i => $p) {
        if ($p['id'] === $id) { $idx = $i; break; }
    }
    if ($idx === -1) fail('Product not found.', 404);

    $body = bodyJson();
    $name = trim($body['name'] ?? $products[$idx]['name']);

    $products[$idx] = array_merge($products[$idx], [
        'name'            => $name,
        'image'           => $body['image'] ?? $products[$idx]['image'],
        'colors'          => $body['colors'] ?? ($products[$idx]['colors'] ?? []),
        'category'        => $body['category'] ?? $products[$idx]['category'],
        'descriptionList' => array_values(array_filter($body['descriptionList'] ?? $products[$idx]['descriptionList'])),
        'variants'        => $body['variants'] ?? $products[$idx]['variants'],
        'includedItems'   => $body['includedItems'] ?? $products[$idx]['includedItems'],
    ]);

    writeJson(PRODUCTS_FILE, $products);
    ok($products[$idx]);
}

/* ---------- DELETE — remove by id ---------- */
if ($method === 'DELETE') {
    requireAuth();
    $id = trim($_GET['id'] ?? '');
    if ($id === '') fail('id query param required.');

    $products = readJson(PRODUCTS_FILE, []);
    $filtered = array_values(array_filter($products, fn($p) => $p['id'] !== $id));

    if (count($filtered) === count($products)) fail('Product not found.', 404);

    writeJson(PRODUCTS_FILE, $filtered);
    ok(['message' => 'Product deleted.']);
}

fail('Method not allowed.', 405);
