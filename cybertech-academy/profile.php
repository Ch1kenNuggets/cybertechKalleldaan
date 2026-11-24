<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
$user = require_login();
$pdo = getDB();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $fullName = trim((string)($_POST['full_name'] ?? $user['full_name']));
    $studentId = trim((string)($_POST['student_id'] ?? ''));
    $yearLevel = trim((string)($_POST['year_level'] ?? ''));
    $bio = trim((string)($_POST['bio'] ?? ''));
    $newPw = (string)($_POST['new_password'] ?? '');

    if ($newPw !== '' && strlen($newPw) >= 8) {
        $pdo->prepare('UPDATE users SET full_name=?, student_id=?, year_level=?, bio=?, password_hash=? WHERE id=?')
            ->execute([$fullName, $studentId, $yearLevel, $bio, password_hash($newPw, PASSWORD_DEFAULT), (int)$user['id']]);
    } else {
        $pdo->prepare('UPDATE users SET full_name=?, student_id=?, year_level=?, bio=? WHERE id=?')
            ->execute([$fullName, $studentId, $yearLevel, $bio, (int)$user['id']]);
    }
    $user = current_user();
    $msg = 'Profile updated.';
}

$pageTitle = 'Profile | CyberTech Academy';
require __DIR__ . '/includes/header.php';
?>
<h1>Student Profile</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="card" style="max-width:600px;">
  <form method="post">
    <?= csrf_field() ?>
    <div class="form-group"><label>Full Name</label><input name="full_name" value="<?= e($user['full_name']) ?>" required></div>
    <div class="form-group"><label>Student ID</label><input name="student_id" value="<?= e($user['student_id']) ?>"></div>
    <div class="form-group"><label>Year Level</label><input name="year_level" value="<?= e($user['year_level']) ?>"></div>
    <div class="form-group"><label>Bio</label><textarea name="bio" rows="3"><?= e($user['bio']) ?></textarea></div>
    <div class="form-group"><label>New Password (optional)</label><input type="password" name="new_password" minlength="8"></div>
    <button class="btn-primary" type="submit">Save Profile</button>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
