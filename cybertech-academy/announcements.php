<?php
$pageTitle = 'Announcements & CTF Events | CyberTech Academy';
require __DIR__ . '/includes/header.php';
$pdo = getDB();
$user = current_user();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $user) {
    verify_csrf();
    $eventId = (int)($_POST['event_id'] ?? 0);
    $teamName = trim((string)($_POST['team_name'] ?? 'Solo')) ?: 'Solo';
    $stmt = $pdo->prepare('INSERT IGNORE INTO event_participants (event_id, user_id, team_name) VALUES (?, ?, ?)');
    $stmt->execute([$eventId, (int)$user['id'], $teamName]);
    $msg = 'Registered for CTF event.';
}

$announcements = $pdo->query('SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC')->fetchAll();
$events = $pdo->query('SELECT * FROM ctf_events ORDER BY start_date ASC')->fetchAll();
?>
<h1>Announcements & CTF Events</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="grid-2">
  <div class="card">
    <h2 style="margin-top:0;">Society Announcements</h2>
    <?php foreach ($announcements as $ann): ?>
      <div style="padding:0.75rem 0; border-bottom:1px solid var(--border-subtle);">
        <p class="meta-line"><?= e($ann['category']) ?> · <?= e($ann['created_at']) ?></p>
        <strong><?= e($ann['title']) ?></strong>
        <p style="font-size:0.9rem; color:#cbd5e1;"><?= e($ann['content']) ?></p>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="card">
    <h2 style="margin-top:0;">CTF Competitions</h2>
    <?php foreach ($events as $ev): ?>
      <div style="padding:0.85rem 0; border-bottom:1px solid var(--border-subtle);">
        <p class="meta-line"><?= e($ev['status']) ?> · <?= e($ev['start_date']) ?></p>
        <strong><?= e($ev['title']) ?></strong>
        <p style="font-size:0.88rem; color:#cbd5e1;"><?= e($ev['description']) ?></p>
        <?php if ($user && $ev['status'] !== 'completed'): ?>
          <form method="post" style="display:flex; gap:0.5rem; margin-top:0.5rem;">
            <?= csrf_field() ?>
            <input type="hidden" name="event_id" value="<?= (int)$ev['id'] ?>">
            <input name="team_name" placeholder="Team Name (optional)" style="flex:1; padding:0.4rem; background:var(--bg-canvas); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:6px;">
            <button class="btn-primary" type="submit">Register</button>
          </form>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
