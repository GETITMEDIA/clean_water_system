<?php
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);

$body = bodyJson();
$username = trim($body['username'] ?? '');
$password = trim($body['password'] ?? '');

if ($username === '' || $password === '') fail('Username and password required.');
if ($username !== ADMIN_USERNAME || $password !== ADMIN_PASSWORD) fail('Incorrect username or password.', 401);

$_SESSION['cw_admin'] = true;
$_SESSION['cw_admin_time'] = time();

ok(['message' => 'Logged in successfully.']);
