<?php
$pageTitle = 'Flag Submissions Monitor | Admin';
require __DIR__ . '/../includes/header.php';
require_admin();
$pdo = getDB();
$subs = $pdo->query(
    'SELECT cs.*, u.username, c.title AS challenge_title
     FROM challenge_submissions cs
     JOIN users u ON u.id = cs.user_id
     JOIN challenges c ON c.id = cs.challenge_id
     ORDER BY cs.submitted_at DESC LIMIT 100'
)->fetchAll();
?>
<h1>Challenge Submissions Log</h1>
<div class="card">
  <table class="data-table">
    <thead><tr><th>Student</th><th>Challenge</th><th>Submitted Flag</th><th>Status</th><th>Points</th><th>Date</th></tr></thead>
    <tbody>
      <?php foreach ($subs as $s): ?>
        <tr>
          <td>@<?= e($s['username']) ?></td>
          <td><?= e($s['challenge_title']) ?></td>
          <td class="mono"><?= e($s['submitted_flag']) ?></td>
          <td><?= $s['is_correct'] ? 'Accepted' : 'Rejected' ?></td>
          <td class="mono"><?= (int)$s['points_awarded'] ?></td>
          <td class="mono"><?= e($s['submitted_at']) ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
