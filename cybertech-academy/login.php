<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

if (is_logged_in()) {
    header('Location: ' . BASE_URL . '/dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $identifier = trim((string)($_POST['identifier'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($identifier === '' || $password === '') {
        $error = 'Please enter your username/email and password.';
    } else {
        $pdo = getDB();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1');
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch();

        if ($user && !empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
            $error = 'Account temporarily locked due to repeated failed attempts. Please wait a few minutes.';
        } elseif (!$user || !password_verify($password, $user['password_hash'])) {
            if ($user) {
                $attempts = (int)$user['failed_attempts'] + 1;
                $lockUntil = $attempts >= MAX_LOGIN_ATTEMPTS ? date('Y-m-d H:i:s', time() + LOCKOUT_MINUTES * 60) : null;
                $pdo->prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
                    ->execute([$attempts, $lockUntil, (int)$user['id']]);
            }
            $error = 'Invalid credentials.';
        } elseif ((int)$user['is_active'] !== 1) {
            $error = 'This account has been deactivated by an administrator.';
        } else {
            $pdo->prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?')->execute([(int)$user['id']]);
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['role'] = $user['role'];
            log_activity((int)$user['id'], 'login', 'Signed in to CyberTech Academy');
            header('Location: ' . BASE_URL . ($user['role'] === 'admin' ? '/admin/dashboard.php' : '/dashboard.php'));
            exit;
        }
    }
}

$pageTitle = 'Sign In | CyberTech Academy';
require __DIR__ . '/includes/header.php';
?>
<div class="card" style="max-width: 460px; margin: 2rem auto;">
  <h1 style="margin-top: 0;">Sign In</h1>
  <p class="meta-line">Access CyberTech Academy lessons and CTF challenges.</p>
  <?php if ($error !== ''): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endif; ?>
  <form method="post">
    <?= csrf_field() ?>
    <div class="form-group">
      <label for="identifier">Username or Email</label>
      <input id="identifier" name="identifier" type="text" required>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required>
    </div>
    <button class="btn-primary" type="submit" style="width: 100%;">Sign In</button>
  </form>
  <p style="margin-top: 1rem; font-size: 0.85rem;">
    New student? <a href="<?= BASE_URL ?>/register.php">Create an account</a>
  </p>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
