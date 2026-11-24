<?php
$pageTitle = 'Manage Users | Admin';
require __DIR__ . '/../includes/header.php';
$admin = require_admin();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $uid = (int)($_POST['user_id'] ?? 0);
    if ($uid !== (int)$admin['id']) {
        $newStatus = (int)($_POST['new_status'] ?? 1);
        $pdo->prepare('UPDATE users SET is_active = ? WHERE id = ?')->execute([$newStatus, $uid]);
    }
}

$users = $pdo->query(
    'SELECT u.*, (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id) AS lessons_done
     FROM users u ORDER BY u.created_at DESC'
)->fetchAll();
?>
<h1>Manage Registered Users</h1>
<div class="card">
  <table class="data-table">
    <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Lessons</th><th>Points</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>
      <?php foreach ($users as $u): ?>
        <tr>
          <td><?= e($u['full_name']) ?></td>
          <td>@<?= e($u['username']) ?></td>
          <td><?= e($u['role']) ?></td>
          <td class="mono"><?= (int)$u['lessons_done'] ?></td>
          <td class="mono"><?= (int)$u['total_points'] ?></td>
          <td><?= $u['is_active'] ? 'Active' : 'Disabled' ?></td>
          <td>
            <?php if ((int)$u['id'] !== (int)$admin['id']): ?>
              <form method="post" style="display:inline;">
                <?= csrf_field() ?>
                <input type="hidden" name="user_id" value="<?= (int)$u['id'] ?>">
                <input type="hidden" name="new_status" value="<?= $u['is_active'] ? 0 : 1 ?>">
                <button class="btn-secondary" type="submit"><?= $u['is_active'] ? 'Disable' : 'Activate' ?></button>
              </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
