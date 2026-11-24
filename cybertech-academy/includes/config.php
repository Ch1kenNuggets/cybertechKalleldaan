<?php
// CyberTech Society - CyberTech Academy Configuration
declare(strict_types=1);

define('APP_NAME', 'CyberTech Society – CyberTech Academy');
define('ORG_NAME', 'CyberTech Society – BCCI');
define('APP_TAGLINE', 'Learn. Explore. Secure. Compete.');

// Update BASE_URL if placed in a different XAMPP subfolder
define('BASE_URL', '/cybertech-academy');

// Database Credentials (XAMPP Default)
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'cybertech_academy');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Security Settings
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_MINUTES', 5);
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}
