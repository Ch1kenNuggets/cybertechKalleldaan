<?php
$pageTitle = 'Module View | CyberTech Academy';
require __DIR__ . '/../includes/header.php';
$user = require_login();
$pdo = getDB();

$slug = $moduleSlug ?? basename($_SERVER['SCRIPT_NAME'], '.php');
$stmt = $pdo->prepare('SELECT * FROM lesson_categories WHERE slug = ? LIMIT 1');
$stmt->execute([$slug]);
$module = $stmt->fetch();

if (!$module) {
    echo '<div class="alert alert-error">Module not found.</div>';
    require __DIR__ . '/../includes/footer.php';
    exit;
}

$lessonStmt = $pdo->prepare(
    'SELECT l.*, lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE l.category_id = ? AND l.is_published = 1
     ORDER BY l.sort_order ASC'
);
$lessonStmt->execute([(int)$user['id'], (int)$module['id']]);
$lessons = $lessonStmt->fetchAll();
?>
<p class="meta-line"><a href="<?= BASE_URL ?>/academy/index.php">Academy</a> / <?= e($module['name']) ?></p>
<h1 style="margin-top:0.25rem;"><?= e($module['name']) ?></h1>
<p style="color:#cbd5e1; max-width:70ch;"><?= e($module['description']) ?></p>

<div class="grid-3" style="margin-top:1.5rem;">
  <?php foreach ($lessons as $lesson): ?>
    <div class="card">
      <p class="meta-line"><?= e($lesson['difficulty']) ?> · <?= (int)$lesson['duration_minutes'] ?> min · <?= $lesson['completed_at'] ? 'Completed' : 'Not started' ?></p>
      <h2 style="font-size:1.05rem; margin:0.4rem 0 0.75rem;"><?= e($lesson['title']) ?></h2>
      <a class="btn-primary" href="<?= BASE_URL ?>/academy/lessons.php?slug=<?= urlencode($lesson['slug']) ?>">
        <?= $lesson['completed_at'] ? 'Review Lesson' : 'Start Lesson' ?>
      </a>
    </div>
  <?php endforeach; ?>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
