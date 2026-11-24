<?php
$pageTitle = 'Manage CTF Challenges | Admin';
require __DIR__ . '/../includes/header.php';
$admin = require_admin();
$pdo = getDB();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $catId = (int)($_POST['category_id'] ?? 1);
    $title = trim((string)($_POST['title'] ?? ''));
    $diff = (string)($_POST['difficulty'] ?? 'Beginner');
    $points = max(10, (int)($_POST['points'] ?? 100));
    $desc = trim((string)($_POST['description'] ?? ''));
    $instr = trim((string)($_POST['instructions'] ?? ''));
    $flag = trim((string)($_POST['flag_answer'] ?? ''));
    $hint = trim((string)($_POST['hint_text'] ?? ''));
    $file = !empty($_FILES['artifact']['name']) ? validate_safe_upload($_FILES['artifact'], ['txt', 'md', 'csv', 'json', 'log', 'zip']) : null;

    if ($title !== '' && $flag !== '') {
        $slug = slugify($title) . '-' . substr((string)time(), -4);
        $pdo->prepare(
            'INSERT INTO challenges (category_id, slug, title, difficulty, points, description, instructions, flag_answer, download_file)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$catId, $slug, $title, $diff, $points, $desc, $instr ?: $desc, $flag, $file]);
        $chalId = (int)$pdo->lastInsertId();
        if ($hint !== '') {
            $pdo->prepare('INSERT INTO challenge_hints (challenge_id, hint_text, cost_points) VALUES (?, ?, 0)')->execute([$chalId, $hint]);
        }
        $msg = 'CTF Challenge created.';
    }
}

$categories = $pdo->query('SELECT * FROM challenge_categories ORDER BY sort_order ASC')->fetchAll();
$challenges = $pdo->query('SELECT c.*, cc.name AS cat_name FROM challenges c JOIN challenge_categories cc ON cc.id = c.category_id ORDER BY c.id DESC')->fetchAll();
?>
<h1>Manage CTF Challenges</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="grid-2">
  <div class="card">
    <h2 style="margin-top:0;">Create Challenge</h2>
    <form method="post" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <div class="form-group">
        <label>Category</label>
        <select name="category_id">
          <?php foreach ($categories as $c): ?><option value="<?= (int)$c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?>
        </select>
      </div>
      <div class="form-group"><label>Title</label><input name="title" required></div>
      <div class="form-group"><label>Difficulty</label><select name="difficulty"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
      <div class="form-group"><label>Points</label><input type="number" name="points" value="100" required></div>
      <div class="form-group"><label>Description</label><textarea name="description" rows="3" required></textarea></div>
      <div class="form-group"><label>Instructions</label><textarea name="instructions" rows="2"></textarea></div>
      <div class="form-group"><label>Correct Flag (CTF{...})</label><input name="flag_answer" required></div>
      <div class="form-group"><label>Initial Hint (Optional)</label><input name="hint_text"></div>
      <div class="form-group"><label>Challenge Artifact File (Optional)</label><input type="file" name="artifact"></div>
      <button class="btn-primary" type="submit">Create Challenge</button>
    </form>
  </div>
  <div class="card">
    <h2 style="margin-top:0;">Active Challenges</h2>
    <?php foreach ($challenges as $ch): ?>
      <p style="border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
        <span class="meta-line"><?= e($ch['cat_name']) ?> · <?= e($ch['difficulty']) ?> · <?= (int)$ch['points'] ?> pts</span><br>
        <strong><?= e($ch['title']) ?></strong>
      </p>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
