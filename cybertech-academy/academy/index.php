<?php
$pageTitle = 'CyberTech Academy | Modules';
require __DIR__ . '/../includes/header.php';
$user = require_login();
$pdo = getDB();

$modules = $pdo->query(
    'SELECT lc.*, COUNT(l.id) AS total_lessons
     FROM lesson_categories lc
     LEFT JOIN lessons l ON l.category_id = lc.id AND l.is_published = 1
     GROUP BY lc.id
     ORDER BY lc.sort_order ASC'
)->fetchAll();
?>
<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
  <div>
    <h1 style="margin:0;">Cybersecurity Academy</h1>
    <p class="meta-line">Select a module to study lessons and complete assessments.</p>
  </div>
  <input type="search" data-live-filter=".module-item" placeholder="Search modules..." style="padding:0.55rem 0.85rem; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-primary);">
</div>

<div class="grid-3">
  <?php foreach ($modules as $mod): ?>
    <div class="card module-item">
      <p class="meta-line">Module <?= (int)$mod['sort_order'] ?> · <?= e($mod['level']) ?> · <?= (int)$mod['total_lessons'] ?> lessons</p>
      <h2 style="margin:0.4rem 0; font-size:1.15rem;"><?= e($mod['name']) ?></h2>
      <p style="font-size:0.9rem; color:#cbd5e1;"><?= e($mod['description']) ?></p>
      <a class="btn-primary" href="<?= BASE_URL ?>/academy/<?= e($mod['slug']) ?>.php">Explore Module</a>
    </div>
  <?php endforeach; ?>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
