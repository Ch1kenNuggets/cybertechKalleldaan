<?php
$pageTitle = 'CyberTech Society – CyberTech Academy & CTF Platform';
require __DIR__ . '/includes/header.php';

$pdo = getDB();
$modules = $pdo->query('SELECT * FROM lesson_categories ORDER BY sort_order ASC')->fetchAll();
$announcements = $pdo->query('SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC LIMIT 3')->fetchAll();
$events = $pdo->query('SELECT * FROM ctf_events ORDER BY start_date ASC LIMIT 3')->fetchAll();
?>
<section class="card" style="margin-bottom: 2rem;">
  <p class="meta-line">CyberTech Society – BCCI · CyberTech Academy</p>
  <h1 style="font-size: 2.2rem; margin: 0.4rem 0 0.75rem;">Learn. Explore. Secure. Compete.</h1>
  <p style="max-width: 68ch; color: #cbd5e1;">
    The official cybersecurity training center and Capture The Flag arena of CyberTech Society – BCCI.
    Build foundational IT security skills and prepare for Hack4Gov competitions.
  </p>
  <div style="margin-top: 1.25rem; display: flex; gap: 0.85rem; flex-wrap: wrap;">
    <?php if (is_logged_in()): ?>
      <a class="btn-primary" href="<?= BASE_URL ?>/dashboard.php">Open Student Dashboard</a>
      <a class="btn-secondary" href="<?= BASE_URL ?>/ctf/index.php">Enter CTF Arena</a>
    <?php else: ?>
      <a class="btn-primary" href="<?= BASE_URL ?>/register.php">Create Student Account</a>
      <a class="btn-secondary" href="<?= BASE_URL ?>/login.php">Sign In</a>
    <?php endif; ?>
  </div>
</section>

<h2 style="margin-bottom: 1rem;">7 Cybersecurity Academy Modules</h2>
<div class="grid-3" style="margin-bottom: 2.5rem;">
  <?php foreach ($modules as $mod): ?>
    <div class="card">
      <p class="meta-line">Module <?= (int)$mod['sort_order'] ?> · <?= e($mod['level']) ?></p>
      <h3 style="margin: 0.4rem 0;"><?= e($mod['name']) ?></h3>
      <p style="font-size: 0.9rem; color: #cbd5e1;"><?= e($mod['description']) ?></p>
      <a href="<?= BASE_URL ?>/academy/<?= e($mod['slug']) ?>.php">Open Module →</a>
    </div>
  <?php endforeach; ?>
</div>

<div class="grid-2">
  <div class="card">
    <h2 style="margin-top: 0;">Latest Announcements</h2>
    <?php foreach ($announcements as $ann): ?>
      <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle);">
        <p class="meta-line"><?= e($ann['category']) ?> · <?= e($ann['created_at']) ?></p>
        <strong><?= e($ann['title']) ?></strong>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin: 0.35rem 0 0;"><?= e($ann['content']) ?></p>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="card">
    <h2 style="margin-top: 0;">Upcoming CTF Events</h2>
    <?php foreach ($events as $ev): ?>
      <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle);">
        <p class="meta-line"><?= e($ev['status']) ?> · <?= e($ev['location']) ?></p>
        <strong><?= e($ev['title']) ?></strong>
        <p style="font-size: 0.86rem; color: #94a3b8; margin: 0.25rem 0 0;"><?= e($ev['start_date']) ?> → <?= e($ev['end_date']) ?></p>
      </div>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
