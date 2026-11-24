<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

if (is_logged_in()) {
    header('Location: ' . BASE_URL . '/dashboard.php');
    exit;
}

$adminExists = has_any_admin();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $fullName = trim((string)($_POST['full_name'] ?? ''));
    $username = trim((string)($_POST['username'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $studentId = trim((string)($_POST['student_id'] ?? ''));
    $yearLevel = trim((string)($_POST['year_level'] ?? '1st Year BSIT'));
    $password = (string)($_POST['password'] ?? '');
    $role = (!$adminExists && isset($_POST['claim_first_admin'])) ? 'admin' : 'student';

    if (strlen($fullName) < 2 || !preg_match('/^[a-zA-Z0-9_.-]{3,30}$/', $username)) {
        $error = 'Enter a valid full name and username (3-30 alphanumeric characters).';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Enter a valid email address.';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters long.';
    } else {
        $pdo = getDB();
        $dup = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
        $dup->execute([$username, $email]);
        if ($dup->fetch()) {
            $error = 'That username or email is already registered.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare(
                'INSERT INTO users (full_name, username, email, password_hash, role, student_id, year_level) VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$fullName, $username, $email, $hash, $role, $studentId, $yearLevel]);
            $newId = (int)$pdo->lastInsertId();
            session_regenerate_id(true);
            $_SESSION['user_id'] = $newId;
            $_SESSION['role'] = $role;
            log_activity($newId, 'register', 'Registered new ' . $role . ' account: ' . $username);
            header('Location: ' . BASE_URL . ($role === 'admin' ? '/admin/dashboard.php' : '/dashboard.php'));
            exit;
        }
    }
}

$pageTitle = 'Register | CyberTech Academy';
require __DIR__ . '/includes/header.php';
?>
<div class="card" style="max-width: 520px; margin: 2rem auto;">
  <h1 style="margin-top: 0;">Student Registration</h1>
  <p class="meta-line">Join CyberTech Society – BCCI to track academy lessons and compete in CTF events.</p>
  <?php if ($error !== ''): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endif; ?>
  <form method="post">
    <?= csrf_field() ?>
    <div class="form-group">
      <label for="full_name">Full Name</label>
      <input id="full_name" name="full_name" type="text" required>
    </div>
    <div class="form-group">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" required>
    </div>
    <div class="form-group">
      <label for="email">Email Address</label>
      <input id="email" name="email" type="email" required>
    </div>
    <div class="form-group">
      <label for="student_id">Student ID</label>
      <input id="student_id" name="student_id" type="text">
    </div>
    <div class="form-group">
      <label for="year_level">Year Level / Program</label>
      <input id="year_level" name="year_level" type="text" value="1st Year BSIT">
    </div>
    <div class="form-group">
      <label for="password">Password (min. 8 characters)</label>
      <input id="password" name="password" type="password" minlength="8" required>
    </div>
    <?php if (!$adminExists): ?>
      <div class="form-group">
        <label style="display:flex; gap:0.5rem; align-items:center; color:#38bdf8;">
          <input type="checkbox" name="claim_first_admin" value="1" style="width:auto;">
          Initialize this account as the first Administrator (first-run setup)
        </label>
      </div>
    <?php endif; ?>
    <button class="btn-primary" type="submit" style="width: 100%;">Create Account</button>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
