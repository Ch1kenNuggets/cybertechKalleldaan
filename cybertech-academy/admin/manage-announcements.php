<?php
$pageTitle = 'Manage Announcements | Admin';
require __DIR__ . '/../includes/header.php';
$admin = require_admin();
$pdo = getDB();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $title = trim((string)($_POST['title'] ?? ''));
    $cat = trim((string)($_POST['category'] ?? 'General'));
    $content = trim((string)($_POST['content'] ?? ''));
    $pinned = isset($_POST['pinned']) ? 1 : 0;
    if ($title !== '' && $content !== '') {
        $pdo->prepare('INSERT INTO announcements (title, category, content, pinned, author_id) VALUES (?, ?, ?, ?, ?)')
            ->execute([$title, $cat, $content, $pinned, (int)$admin['id']]);
        $msg = 'Announcement published.';
    }
}

$announcements = $pdo->query('SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC')->fetchAll();
?>
<h1>Manage Announcements</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="grid-2">
  <div class="card">
    <form method="post">
      <?= csrf_field() ?>
      <div class="form-group"><label>Title</label><input name="title" required></div>
      <div class="form-group"><label>Category</label><input name="category" value="Competition"></div>
      <div class="form-group"><label>Content</label><textarea name="content" rows="4" required></textarea></div>
      <div class="form-group"><label><input type="checkbox" name="pinned" style="width:auto;"> Pin announcement</label></div>
      <button class="btn-primary" type="submit">Publish Announcement</button>
    </form>
  </div>
  <div class="card">
    <h2 style="margin-top:0;">Published Announcements</h2>
    <?php foreach ($announcements as $a): ?>
      <p style="border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
        <span class="meta-line"><?= e($a['category']) ?> · <?= e($a['created_at']) ?></span><br>
        <strong><?= e($a['title']) ?></strong>
      </p>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
