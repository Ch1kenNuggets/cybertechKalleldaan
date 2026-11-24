<?php
$pageTitle = 'Manage Lessons | Admin';
require __DIR__ . '/../includes/header.php';
$admin = require_admin();
$pdo = getDB();
$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $catId = (int)($_POST['category_id'] ?? 1);
    $title = trim((string)($_POST['title'] ?? ''));
    $diff = (string)($_POST['difficulty'] ?? 'Beginner');
    $objectives = trim((string)($_POST['objectives'] ?? 'Understand core concept'));
    $explanation = trim((string)($_POST['explanation'] ?? ''));
    $examples = trim((string)($_POST['examples'] ?? ''));
    $exercise = trim((string)($_POST['exercise_prompt'] ?? 'Practice in sandbox.'));
    $quizJson = json_encode([['question' => 'Core takeaway from ' . $title . '?', 'options' => ['Security by design', 'Plaintext storage'], 'correct' => 0]]);
    $materialFile = !empty($_FILES['material']['name']) ? validate_safe_upload($_FILES['material']) : null;

    if ($title !== '' && $explanation !== '') {
        $slug = slugify($title) . '-' . substr((string)time(), -4);
        $pdo->prepare(
            'INSERT INTO lessons (category_id, slug, title, difficulty, objectives, explanation, examples, exercise_prompt, quiz_json, material_file)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$catId, $slug, $title, $diff, $objectives, $explanation, $examples, $exercise, $quizJson, $materialFile]);
        $msg = 'Lesson created successfully.';
    }
}

$categories = $pdo->query('SELECT * FROM lesson_categories ORDER BY sort_order ASC')->fetchAll();
$lessons = $pdo->query('SELECT l.*, lc.name AS module_name FROM lessons l JOIN lesson_categories lc ON lc.id = l.category_id ORDER BY lc.sort_order ASC, l.sort_order ASC')->fetchAll();
?>
<h1>Manage Academy Lessons</h1>
<?php if ($msg !== ''): ?><div class="alert alert-success"><?= e($msg) ?></div><?php endif; ?>
<div class="grid-2">
  <div class="card">
    <h2 style="margin-top:0;">Create New Lesson</h2>
    <form method="post" enctype="multipart/form-data">
      <?= csrf_field() ?>
      <div class="form-group">
        <label>Module</label>
        <select name="category_id">
          <?php foreach ($categories as $c): ?>
            <option value="<?= (int)$c['id'] ?>"><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group"><label>Title</label><input name="title" required></div>
      <div class="form-group"><label>Difficulty</label><select name="difficulty"><option>Beginner</option><option>Intermediate</option></select></div>
      <div class="form-group"><label>Objectives (pipe | separated)</label><input name="objectives" required></div>
      <div class="form-group"><label>Explanation</label><textarea name="explanation" rows="4" required></textarea></div>
      <div class="form-group"><label>Examples</label><textarea name="examples" rows="2"></textarea></div>
      <div class="form-group"><label>Exercise Prompt</label><input name="exercise_prompt"></div>
      <div class="form-group"><label>Optional Study File (.txt, .md, .pdf)</label><input type="file" name="material"></div>
      <button class="btn-primary" type="submit">Publish Lesson</button>
    </form>
  </div>
  <div class="card">
    <h2 style="margin-top:0;">Published Lessons</h2>
    <?php foreach ($lessons as $l): ?>
      <p style="border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
        <span class="meta-line"><?= e($l['module_name']) ?> · <?= e($l['difficulty']) ?></span><br>
        <strong><?= e($l['title']) ?></strong>
      </p>
    <?php endforeach; ?>
  </div>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
