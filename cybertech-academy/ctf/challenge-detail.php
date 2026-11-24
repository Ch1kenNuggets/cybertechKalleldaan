<?php
$pageTitle = 'Challenge Detail | CyberTech CTF';
require __DIR__ . '/../includes/header.php';
$user = require_login();
$pdo = getDB();

$chalId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare(
    'SELECT c.id, c.title, c.difficulty, c.points, c.description, c.instructions, c.download_file, cc.name AS category_name,
            EXISTS(SELECT 1 FROM challenge_submissions s WHERE s.challenge_id = c.id AND s.user_id = ? AND s.is_correct = 1) AS is_solved
     FROM challenges c JOIN challenge_categories cc ON cc.id = c.category_id
     WHERE c.id = ? AND c.is_active = 1 LIMIT 1'
);
$stmt->execute([(int)$user['id'], $chalId]);
$challenge = $stmt->fetch();

if (!$challenge) {
    echo '<div class="alert alert-error">Challenge not found.</div>';
    require __DIR__ . '/../includes/footer.php';
    exit;
}

$hintStmt = $pdo->prepare(
    'SELECT h.id, h.cost_points,
            CASE WHEN hu.id IS NOT NULL THEN h.hint_text ELSE NULL END AS hint_text,
            CASE WHEN hu.id IS NOT NULL THEN 1 ELSE 0 END AS is_unlocked
     FROM challenge_hints h
     LEFT JOIN hint_unlocks hu ON hu.hint_id = h.id AND hu.user_id = ?
     WHERE h.challenge_id = ? ORDER BY h.sort_order ASC'
);
$hintStmt->execute([(int)$user['id'], $chalId]);
$hints = $hintStmt->fetchAll();
?>
<p class="meta-line"><a href="<?= BASE_URL ?>/ctf/challenges.php">CTF Arena</a> / <?= e($challenge['category_name']) ?></p>
<h1><?= e($challenge['title']) ?></h1>
<p class="meta-line"><?= e($challenge['category_name']) ?> · <?= e($challenge['difficulty']) ?> · <span class="mono" style="color:var(--accent-green);"><?= (int)$challenge['points'] ?> pts</span></p>

<div class="card" style="margin-bottom:1.25rem;">
  <h2 style="margin-top:0;">Description</h2>
  <p><?= e($challenge['description']) ?></p>
  <p class="meta-line"><strong>Instructions:</strong> <?= e($challenge['instructions']) ?></p>
  <?php if (!empty($challenge['download_file'])): ?>
    <a class="btn-secondary" href="<?= BASE_URL ?>/assets/uploads/<?= urlencode(basename($challenge['download_file'])) ?>" download>Download Challenge File</a>
  <?php endif; ?>
</div>

<?php if (!empty($hints)): ?>
  <div class="card" style="margin-bottom:1.25rem;">
    <h2 style="margin-top:0;">Hints</h2>
    <?php foreach ($hints as $idx => $h): ?>
      <div class="hint-box">
        <?php if ($h['is_unlocked']): ?>
          <p class="mono" style="margin:0;"><?= e($h['hint_text']) ?></p>
        <?php else: ?>
          <form method="post" action="<?= BASE_URL ?>/ctf/hints.php" style="display:flex; justify-content:space-between; align-items:center;">
            <?= csrf_field() ?>
            <input type="hidden" name="challenge_id" value="<?= (int)$challenge['id'] ?>">
            <input type="hidden" name="hint_id" value="<?= (int)$h['id'] ?>">
            <span class="meta-line">Hint #<?= $idx + 1 ?> (<?= (int)$h['cost_points'] ?> pts)</span>
            <button class="btn-secondary" type="submit">Unlock Hint</button>
          </form>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<div class="card">
  <h2 style="margin-top:0;">Submit Flag</h2>
  <div id="flag-feedback"></div>
  <form id="flag-submit-form" method="post" action="<?= BASE_URL ?>/ctf/submit-flag.php" style="display:flex; gap:0.75rem; flex-wrap:wrap;">
    <?= csrf_field() ?>
    <input type="hidden" name="challenge_id" value="<?= (int)$challenge['id'] ?>">
    <input type="text" name="flag" placeholder="CTF{your_answer}" <?= $challenge['is_solved'] ? 'disabled' : 'required' ?> style="flex:1; min-width:220px; padding:0.65rem; background:var(--bg-canvas); border:1px solid var(--border-subtle); color:var(--text-primary); border-radius:8px; font-family:monospace;">
    <button class="btn-primary" type="submit" <?= $challenge['is_solved'] ? 'disabled' : '' ?>>
      <?= $challenge['is_solved'] ? 'Solved' : 'Submit Flag' ?>
    </button>
  </form>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
