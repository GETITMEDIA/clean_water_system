<?php
require_once __DIR__ . '/auth.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST only.', 405);
if (empty($_FILES['image'])) fail('No image file received.');

$file   = $_FILES['image'];
$error  = $file['error'];
$size   = $file['size'];
$tmpPath = $file['tmp_name'];

/* Validate */
if ($error !== UPLOAD_ERR_OK) fail('Upload error code: ' . $error);
if ($size > 10 * 1024 * 1024) fail('File too large. Max 10 MB.');

/* The extension is derived from the sniffed MIME type, never from the
   uploaded filename: a genuine GIF named "x.php" would otherwise be stored
   as PHP inside the web root and become executable. */
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/avif' => 'avif',
    'image/gif'  => 'gif',
];
$mime = mime_content_type($tmpPath);
if (!isset($allowed[$mime])) fail('Invalid file type: ' . $mime);

$ext  = $allowed[$mime];
$name = uniqid('img_', true) . '.' . $ext;

if (!is_dir(UPLOADS_DIR)) mkdir(UPLOADS_DIR, 0755, true);

$dest = UPLOADS_DIR . $name;
if (!move_uploaded_file($tmpPath, $dest)) fail('Failed to save file.');

ok(['url' => UPLOADS_WEB . $name, 'name' => $name]);
