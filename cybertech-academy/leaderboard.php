<?php
$pageTitle = 'Leaderboard | CyberTech Academy';
require __DIR__ . '/includes/header.php';
$pdo = getDB();
$players = $pdo->query(
    "SELECT u.id, u.full_name, u.username, u.year_level, u.total_points,
            (SELECT COUNT(DISTINCT cs.challenge_id) FROM challenge_submissions cs WHERE cs.user_id = u.id AND cs.is_correct = 1) AS solved_count
     FROM users u
     WHERE u.is_active = 1 AND u.role = 'student'
     ORDER BY u.total_points DESC, solved_count DESC, u.created_at ASC
     LIMIT 10"
)->fetchAll();
?>
<h1>Top 10 CTF Leaderboard</h1>
<div class="card">
  <table class="data-table">
    <thead>
      <tr><th>Rank</th><th>Student</th><th>Program</th><th>Solved</th><th>Points</th></tr>
    </thead>
    <tbody>
      <?php foreach ($players as $idx => $p): ?>
        <tr>
          <td class="mono">#<?= $idx + 1 ?></td>
          <td><?= e($p['full_name']) ?> <span class="meta-line">@<?= e($p['username']) ?></span></td>
          <td><?= e($p['year_level']) ?></td>
          <td class="mono"><?= (int)$p['solved_count'] ?></td>
          <td class="mono" style="color:var(--accent-green);"><?= (int)$p['total_points'] ?> pts</td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
