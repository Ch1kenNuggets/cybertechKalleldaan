<?php
$pageTitle = 'Manage CTF Events | Admin';
require __DIR__ . '/../includes/header.php';
require_admin();
$pdo = getDB();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $title = trim((string)($_POST['title'] ?? ''));
    $desc = trim((string)($_POST['description'] ?? ''));
    $start = str_replace('T', ' ', (string)($_POST['start_date'] ?? ''));
    $end = str_replace('T', ' ', (string)($_POST['end_date'] ?? ''));
    $status = (string)($_POST['status'] ?? 'upcoming');
    $loc = trim((string)($_POST['location'] ?? 'Online Arena'));
    if ($title !== '' && $start !== '' && $end !== '') {
        $pdo->prepare('INSERT INTO ctf_events (slug, title, description, start_date, end_date, status, location) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([slugify($title) . '-' . time(), $title, $desc, $start, $end, $status, $loc]);
        $msg = 'CTF Event scheduled.';
    }
}

$events = $pdo->query('SELECT * FROM ctf_events ORDER BY start_date DESC')->fetchAll();
?>
<h1>Manage CTF Events</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="grid-2">
  <div class="card">
    <form method="post">
      <?= csrf_field() ?>
      <div class="form-group"><label>Event Title</label><input name="title" required></div>
      <div class="form-group"><label>Description</label><textarea name="description" rows="3"></textarea></div>
      <div class="form-group"><label>Start Date</label><input type="datetime-local" name="start_date" required></div>
      <div class="form-group"><label>End Date</label><input type="datetime-local" name="end_date" required></div>
      <div class="form-group"><label>Status</label><select name="status"><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option></select></div>
      <div class="form-group"><label>Location</label><input name="location" value="BCCI Computer Lab 2"></div>
      <button class="btn-primary" type="submit">Schedule Event</button>
    </form>
  </div>
  <div class="card">
    <h2 style="margin-top:0;">Events</h2>
    <?php foreach ($events as $ev): ?>
      <p style="border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
        <span class="meta-line"><?= e($ev['status']) ?> · <?= e($ev['start_date']) ?></span><br>
        <strong><?= e($ev['title']) ?></strong>
      </p>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
