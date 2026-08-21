<?php
require_once __DIR__ . '/auth.php';

session_destroy();
ok(['message' => 'Logged out.']);
