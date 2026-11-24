<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = getDB();

$rows = $pdo->query(
    "SELECT u.id, u.username, u.full_name, u.year_level, u.total_points,
            (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = u.id) AS lessons_done,
            (SELECT COUNT(DISTINCT cs.challenge_id) FROM challenge_submissions cs WHERE cs.user_id = u.id AND cs.is_correct = 1) AS flags_solved
     FROM users u WHERE u.role = 'student' ORDER BY u.total_points DESC"
)->fetchAll();

if (isset($_GET['download']) && $_GET['download'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="cybertech_academy_report.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Username', 'Full Name', 'Program', 'Total Points', 'Lessons Completed', 'Flags Solved']);
    foreach ($rows as $r) {
        fputcsv($out, [$r['id'], $r['username'], $r['full_name'], $r['year_level'], $r['total_points'], $r['lessons_done'], $r['flags_solved']]);
    }
    fclose($out);
    exit;
}

$pageTitle = 'Performance Reports | Admin';
require __DIR__ . '/../includes/header.php';
?>
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
  <h1 style="margin:0;">Student Performance Reports</h1>
  <a class="btn-primary" href="?download=csv">Export CSV Report</a>
</div>
<div class="card">
  <table class="data-table">
    <thead><tr><th>Student</th><th>Program</th><th>Lessons</th><th>Flags</th><th>Total Points</th></tr></thead>
    <tbody>
      <?php foreach ($rows as $r): ?>
        <tr>
          <td><?= e($r['full_name']) ?> (@<?= e($r['username']) ?>)</td>
          <td><?= e($r['year_level']) ?></td>
          <td class="mono"><?= (int)$r['lessons_done'] ?></td>
          <td class="mono"><?= (int)$r['flags_solved'] ?></td>
          <td class="mono"><?= (int)$r['total_points'] ?> pts</td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
