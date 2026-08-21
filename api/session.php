<?php
require_once __DIR__ . '/auth.php';

ok(['loggedIn' => !empty($_SESSION['cw_admin'])]);
