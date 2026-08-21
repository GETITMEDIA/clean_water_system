<?php
/* =========================================================
   Shared auth helpers — included by every API endpoint
   ========================================================= */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ----- Admin credentials (change these!) ----- */
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'cleanwater@admin123');

/* ----- Data file paths ----- */
define('DATA_DIR',       __DIR__ . '/../data/');
define('PRODUCTS_FILE',  DATA_DIR . 'products.json');
define('CATS_FILE',      DATA_DIR . 'categories.json');
define('UPLOADS_DIR',    __DIR__ . '/../assets/uploads/');
define('UPLOADS_WEB',    'assets/uploads/');

function requireAuth() {
    if (empty($_SESSION['cw_admin'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized. Please log in.']);
        exit;
    }
}

function ok($data = [], int $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function fail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function readJson(string $file, array $default = []): array {
    if (!file_exists($file)) return $default;
    $raw = @file_get_contents($file);
    $decoded = $raw ? json_decode($raw, true) : null;
    return is_array($decoded) ? $decoded : $default;
}

function writeJson(string $file, array $data): void {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function bodyJson(): array {
    $raw = file_get_contents('php://input');
    $data = $raw ? json_decode($raw, true) : null;
    return is_array($data) ? $data : [];
}

function slugify(string $text): string {
    $text = mb_strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
}
