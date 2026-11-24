<?php
$pageTitle = 'Student Dashboard | CyberTech Academy';
require __DIR__ . '/includes/header.php';
$user = require_login();
$pdo = getDB();

$totalLessons = (int)$pdo->query('SELECT COUNT(*) FROM lessons WHERE is_published = 1')->fetchColumn();
$stmtCompleted = $pdo->prepare('SELECT COUNT(*) FROM lesson_progress WHERE user_id = ?');
$stmtCompleted->execute([(int)$user['id']]);
$completedLessons = (int)$stmtCompleted->fetchColumn();

$totalChallenges = (int)$pdo->query('SELECT COUNT(*) FROM challenges WHERE is_active = 1')->fetchColumn();
$stmtSolved = $pdo->prepare('SELECT COUNT(DISTINCT challenge_id) FROM challenge_submissions WHERE user_id = ? AND is_correct = 1');
$stmtSolved->execute([(int)$user['id']]);
$solvedChallenges = (int)$stmtSolved->fetchColumn();

$rank = get_user_rank((int)$user['id']);
$badges = get_user_badges((int)$user['id']);
$lessonPct = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;
$ctfPct = $totalChallenges > 0 ? round(($solvedChallenges / $totalChallenges) * 100) : 0;

$recommendedStmt = $pdo->prepare(
    'SELECT l.slug, l.title, l.difficulty, lc.name AS module_name
     FROM lessons l JOIN lesson_categories lc ON lc.id = l.category_id
     WHERE l.is_published = 1 AND l.id NOT IN (SELECT lesson_id FROM lesson_progress WHERE user_id = ?)
     ORDER BY lc.sort_order ASC, l.sort_order ASC LIMIT 4'
);
$recommendedStmt->execute([(int)$user['id']]);
$recommended = $recommendedStmt->fetchAll();

$announcements = $pdo->query('SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC LIMIT 3')->fetchAll();
$actStmt = $pdo->prepare('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 6');
$actStmt->execute([(int)$user['id']]);
$activities = $actStmt->fetchAll();
?>
<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
  <div>
    <p class="meta-line"><?= e($user['year_level']) ?> · @<?= e($user['username']) ?></p>
    <h1 style="margin:0.25rem 0 0;">Welcome back, <?= e($user['full_name']) ?></h1>
  </div>
  <div style="display:flex; gap:0.65rem;">
    <a class="btn-secondary" href="<?= BASE_URL ?>/profile.php">Profile</a>
    <a class="btn-secondary" href="<?= BASE_URL ?>/logout.php">Logout</a>
  </div>
</div>

<div class="grid-4" style="margin-bottom:2rem;">
  <div class="card">
    <p class="meta-line">Completed Lessons</p>
    <p class="stat-value"><?= $completedLessons ?> / <?= $totalLessons ?></p>
    <div class="progress-track"><div class="progress-fill" style="width:<?= $lessonPct ?>%;"></div></div>
    <p class="meta-line"><?= $lessonPct ?>% completed</p>
  </div>
  <div class="card">
    <p class="meta-line">Completed Challenges</p>
    <p class="stat-value"><?= $solvedChallenges ?> / <?= $totalChallenges ?></p>
    <div class="progress-track"><div class="progress-fill" style="width:<?= $ctfPct ?>%;"></div></div>
    <p class="meta-line"><?= $ctfPct ?>% captured</p>
  </div>
  <div class="card">
    <p class="meta-line">Total Points</p>
    <p class="stat-value"><?= (int)$user['total_points'] ?> pts</p>
    <p class="meta-line">Verified CTF score</p>
  </div>
  <div class="card">
    <p class="meta-line">Current Rank</p>
    <p class="stat-value"><?= $rank > 0 ? '#' . $rank : '—' ?></p>
    <a href="<?= BASE_URL ?>/leaderboard.php">View Scoreboard →</a>
  </div>
</div>

<div class="grid-2">
  <div class="card">
    <h2 style="margin-top:0;">Recommended Lessons</h2>
    <?php if (empty($recommended)): ?>
      <p class="meta-line">All published lessons completed!</p>
    <?php else: ?>
      <?php foreach ($recommended as $rec): ?>
        <div style="padding:0.65rem 0; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <p class="meta-line"><?= e($rec['module_name']) ?> · <?= e($rec['difficulty']) ?></p>
            <strong><?= e($rec['title']) ?></strong>
          </div>
          <a class="btn-primary" href="<?= BASE_URL ?>/academy/lessons.php?slug=<?= urlencode($rec['slug']) ?>">Start</a>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>

    <h3 style="margin-top:1.5rem;">Earned Badges</h3>
    <?php if (empty($badges)): ?>
      <p class="meta-line">Complete lessons or solve CTF challenges to earn badges.</p>
    <?php else: ?>
      <ul>
        <?php foreach ($badges as $b): ?>
          <li><strong><?= e($b['title']) ?></strong> — <span class="meta-line"><?= e($b['desc']) ?></span></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>

  <div class="card">
    <h2 style="margin-top:0;">Recent Announcements</h2>
    <?php foreach ($announcements as $ann): ?>
      <div style="padding:0.65rem 0; border-bottom:1px solid var(--border-subtle);">
        <p class="meta-line"><?= e($ann['category']) ?> · <?= e($ann['created_at']) ?></p>
        <strong><?= e($ann['title']) ?></strong>
        <p style="font-size:0.86rem; color:#cbd5e1; margin:0.25rem 0 0;"><?= e($ann['content']) ?></p>
      </div>
    <?php endforeach; ?>

    <h3 style="margin-top:1.5rem;">Recent Activity</h3>
    <?php foreach ($activities as $act): ?>
      <p class="meta-line"><?= e($act['created_at']) ?> — <?= e($act['summary']) ?></p>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
