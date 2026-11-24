<?php
$pageTitle = 'Admin Dashboard | CyberTech Academy';
require __DIR__ . '/../includes/header.php';
$admin = require_admin();
$pdo = getDB();

$students = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
$lessons = (int)$pdo->query('SELECT COUNT(*) FROM lessons')->fetchColumn();
$challenges = (int)$pdo->query('SELECT COUNT(*) FROM challenges')->fetchColumn();
$solves = (int)$pdo->query('SELECT COUNT(*) FROM challenge_submissions WHERE is_correct = 1')->fetchColumn();
?>
<h1>Administrator Dashboard</h1>
<p class="meta-line">Signed in as <?= e($admin['full_name']) ?></p>

<div class="grid-4" style="margin:1.5rem 0;">
  <div class="card"><p class="meta-line">Students</p><p class="stat-value"><?= $students ?></p></div>
  <div class="card"><p class="meta-line">Lessons</p><p class="stat-value"><?= $lessons ?></p></div>
  <div class="card"><p class="meta-line">CTF Challenges</p><p class="stat-value"><?= $challenges ?></p></div>
  <div class="card"><p class="meta-line">Verified Solves</p><p class="stat-value"><?= $solves ?></p></div>
</div>

<div class="grid-3">
  <a class="card" href="<?= BASE_URL ?>/admin/manage-users.php"><strong>Manage Students</strong><p class="meta-line">View student roster, progress, and active status.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/manage-lessons.php"><strong>Manage Lessons</strong><p class="meta-line">Create, edit, and upload materials for Academy modules.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/manage-challenges.php"><strong>Manage CTF Challenges</strong><p class="meta-line">Configure challenges, flags, files, and hints.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/manage-ctf-events.php"><strong>Manage CTF Events</strong><p class="meta-line">Schedule Hack4Gov & campus competitions.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/manage-announcements.php"><strong>Manage Announcements</strong><p class="meta-line">Publish training schedules and society notices.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/submissions.php"><strong>Monitor Submissions</strong><p class="meta-line">Audit flag submission logs.</p></a>
  <a class="card" href="<?= BASE_URL ?>/admin/reports.php"><strong>Performance Reports</strong><p class="meta-line">View and export student CSV reports.</p></a>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
