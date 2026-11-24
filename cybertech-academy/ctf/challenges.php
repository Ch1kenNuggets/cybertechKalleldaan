<?php
$pageTitle = 'CTF Challenges | CyberTech Academy';
require __DIR__ . '/../includes/header.php';
$user = require_login();
$pdo = getDB();

$catSlug = trim((string)($_GET['category'] ?? 'all'));
$diff = trim((string)($_GET['difficulty'] ?? 'all'));
$categories = $pdo->query('SELECT * FROM challenge_categories ORDER BY sort_order ASC')->fetchAll();

$sql = 'SELECT c.id, c.slug, c.title, c.difficulty, c.points, c.description, cc.name AS category_name, cc.slug AS category_slug,
               EXISTS(SELECT 1 FROM challenge_submissions s WHERE s.challenge_id = c.id AND s.user_id = ? AND s.is_correct = 1) AS is_solved
        FROM challenges c
        JOIN challenge_categories cc ON cc.id = c.category_id
        WHERE c.is_active = 1';
$params = [(int)$user['id']];

if ($catSlug !== 'all') {
    $sql .= ' AND cc.slug = ?';
    $params[] = $catSlug;
}
if ($diff !== 'all') {
    $sql .= ' AND c.difficulty = ?';
    $params[] = $diff;
}
$sql .= ' ORDER BY c.points ASC, c.id ASC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$challenges = $stmt->fetchAll();
?>
<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
  <div>
    <h1 style="margin:0;">Capture The Flag Arena</h1>
    <p class="meta-line">Solve challenges across 9 categories and submit flags in CTF{...} format.</p>
  </div>
  <div style="display:flex; gap:0.65rem;">
    <input type="search" data-live-filter=".challenge-card" placeholder="Search challenges..." style="padding:0.5rem 0.8rem; border-radius:8px; border:1px solid var(--border-subtle); background:var(--bg-surface); color:var(--text-primary);">
    <a class="btn-secondary" href="<?= BASE_URL ?>/ctf/scoreboard.php">Scoreboard</a>
  </div>
</div>

<div class="filter-bar" style="margin-top:1.25rem;">
  <a class="<?= $catSlug === 'all' ? 'btn-primary' : 'btn-secondary' ?>" href="?category=all&difficulty=<?= urlencode($diff) ?>">All Categories</a>
  <?php foreach ($categories as $cat): ?>
    <a class="<?= $catSlug === $cat['slug'] ? 'btn-primary' : 'btn-secondary' ?>" href="?category=<?= urlencode($cat['slug']) ?>&difficulty=<?= urlencode($diff) ?>"><?= e($cat['name']) ?></a>
  <?php endforeach; ?>
</div>

<div class="grid-3">
  <?php foreach ($challenges as $c): ?>
    <div class="challenge-card <?= $c['is_solved'] ? 'solved' : '' ?>">
      <div>
        <p class="meta-line"><?= e($c['category_name']) ?> · <?= e($c['difficulty']) ?> · <span class="mono" style="color:var(--accent-green);"><?= (int)$c['points'] ?> pts</span></p>
        <h2 style="font-size:1.1rem; margin:0.35rem 0;"><?= e($c['title']) ?></h2>
        <p style="font-size:0.88rem; color:#cbd5e1;"><?= e($c['description']) ?></p>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
        <span class="meta-line"><?= $c['is_solved'] ? 'Solved' : 'Unsolved' ?></span>
        <a class="btn-primary" href="<?= BASE_URL ?>/ctf/challenge-detail.php?id=<?= (int)$c['id'] ?>">Open Challenge</a>
      </div>
    </div>
  <?php endforeach; ?>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
