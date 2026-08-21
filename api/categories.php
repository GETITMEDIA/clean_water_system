<?php
require_once __DIR__ . '/auth.php';

$defaultCategories = [
    ['id' => 'multibrand-water-purifiers',       'name' => 'Multibrand Water Purifiers'],
    ['id' => 'domestic-water-purifiers',          'name' => 'Domestic Water Purifiers'],
    ['id' => 'industrial-commercial-ro-plants',   'name' => 'Industrial and Commercial RO Plants'],
    ['id' => 'water-softener-plant',              'name' => 'Water Softener Plant'],
    ['id' => 'iron-removal-plant',                'name' => 'Iron Removal Plant'],
    ['id' => 'water-conditioner',                 'name' => 'Water Conditioner'],
    ['id' => 'sand-filter',                       'name' => 'Sand Filter'],
    ['id' => 'automatic-level-controller',        'name' => 'Automatic Level Controller'],
];

if (!file_exists(CATS_FILE)) {
    writeJson(CATS_FILE, $defaultCategories);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    ok(readJson(CATS_FILE, $defaultCategories));
}

if ($method === 'POST') {
    requireAuth();
    $body = bodyJson();
    $name = trim($body['name'] ?? '');
    if ($name === '') fail('Category name is required.');

    $cats = readJson(CATS_FILE, []);
    $baseId = slugify($name);
    $id = $baseId; $suffix = 1;
    $existingIds = array_column($cats, 'id');
    while (in_array($id, $existingIds)) $id = $baseId . '-' . $suffix++;

    $cat = ['id' => $id, 'name' => $name];
    $cats[] = $cat;
    writeJson(CATS_FILE, $cats);
    ok($cat, 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = trim($_GET['id'] ?? '');
    if ($id === '') fail('id required.');
    $body = bodyJson();
    $name = trim($body['name'] ?? '');
    if ($name === '') fail('Name required.');

    $cats = readJson(CATS_FILE, []);
    $found = false;
    foreach ($cats as &$c) {
        if ($c['id'] === $id) { $c['name'] = $name; $found = true; break; }
    }
    if (!$found) fail('Category not found.', 404);
    writeJson(CATS_FILE, $cats);
    ok(['id' => $id, 'name' => $name]);
}

if ($method === 'DELETE') {
    requireAuth();
    $id = trim($_GET['id'] ?? '');
    if ($id === '') fail('id required.');
    $cats = readJson(CATS_FILE, []);
    $filtered = array_values(array_filter($cats, fn($c) => $c['id'] !== $id));
    if (count($filtered) === count($cats)) fail('Category not found.', 404);
    writeJson(CATS_FILE, $filtered);
    ok(['message' => 'Deleted.']);
}

fail('Method not allowed.', 405);
