<?php
$pageTitle = 'Lesson | CyberTech Academy';
require __DIR__ . '/../includes/header.php';
$user = require_login();
$pdo = getDB();

$slug = trim((string)($_GET['slug'] ?? ''));
$stmt = $pdo->prepare(
    'SELECT l.*, lc.name AS module_name, lc.slug AS module_slug
     FROM lessons l JOIN lesson_categories lc ON lc.id = l.category_id
     WHERE l.slug = ? AND l.is_published = 1 LIMIT 1'
);
$stmt->execute([$slug]);
$lesson = $stmt->fetch();

if (!$lesson) {
    echo '<div class="alert alert-error">Lesson not found. <a href="' . BASE_URL . '/academy/index.php">Return to Academy</a></div>';
    require __DIR__ . '/../includes/footer.php';
    exit;
}

$quiz = json_decode((string)$lesson['quiz_json'], true) ?: [];
$quizFeedback = '';
$quizPassed = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $answers = $_POST['answers'] ?? [];
    $score = 0;
    $total = count($quiz);
    foreach ($quiz as $idx => $q) {
        if (isset($answers[$idx]) && (int)$answers[$idx] === (int)$q['correct']) {
            $score++;
        }
    }
    if ($total === 0 || $score >= (int)ceil($total * 0.66)) {
        $pdo->prepare(
            'INSERT INTO lesson_progress (user_id, lesson_id, quiz_score, quiz_total)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quiz_score = VALUES(quiz_score), completed_at = CURRENT_TIMESTAMP'
        )->execute([(int)$user['id'], (int)$lesson['id'], $score, $total]);
        log_activity((int)$user['id'], 'lesson_complete', 'Completed lesson: ' . $lesson['title']);
        $quizPassed = true;
        $quizFeedback = "Lesson completed! Score: {$score}/{$total}.";
    } else {
        $quizFeedback = "You scored {$score}/{$total}. Please review the material and score at least 66% to complete.";
    }
}

$progStmt = $pdo->prepare('SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?');
$progStmt->execute([(int)$user['id'], (int)$lesson['id']]);
$progress = $progStmt->fetch();
$objectives = explode('|', (string)$lesson['objectives']);
?>
<p class="meta-line">
  <a href="<?= BASE_URL ?>/academy/index.php">Academy</a> /
  <a href="<?= BASE_URL ?>/academy/<?= e($lesson['module_slug']) ?>.php"><?= e($lesson['module_name']) ?></a> /
  <?= e($lesson['title']) ?>
</p>

<h1><?= e($lesson['title']) ?></h1>
<p class="meta-line"><?= e($lesson['difficulty']) ?> · <?= (int)$lesson['duration_minutes'] ?> min · <?= $progress ? 'Completed' : 'In Progress' ?></p>

<div class="card" style="margin-bottom:1.25rem;">
  <h2 style="margin-top:0;">Learning Objectives</h2>
  <ul>
    <?php foreach ($objectives as $obj): ?>
      <li><?= e(trim($obj)) ?></li>
    <?php endforeach; ?>
  </ul>
</div>

<div class="card" style="margin-bottom:1.25rem;">
  <h2 style="margin-top:0;">Explanation</h2>
  <p style="white-space:pre-line;"><?= e($lesson['explanation']) ?></p>
</div>

<?php if (!empty($lesson['examples'])): ?>
  <div class="card" style="margin-bottom:1.25rem;">
    <h2 style="margin-top:0;">Examples</h2>
    <pre class="terminal-box"><?= e($lesson['examples']) ?></pre>
  </div>
<?php endif; ?>

<div class="card" style="margin-bottom:1.25rem;">
  <h2 style="margin-top:0;">Practical Exercise</h2>
  <p><?= e($lesson['exercise_prompt']) ?></p>
</div>

<div class="card">
  <h2 style="margin-top:0;">Knowledge Assessment</h2>
  <?php if ($quizFeedback !== ''): ?>
    <div class="alert <?= $quizPassed ? 'alert-success' : 'alert-error' ?>"><?= e($quizFeedback) ?></div>
  <?php endif; ?>
  <form method="post">
    <?= csrf_field() ?>
    <?php foreach ($quiz as $idx => $q): ?>
      <div style="margin-bottom:1.1rem;">
        <p><strong><?= $idx + 1 ?>. <?= e($q['question']) ?></strong></p>
        <?php foreach ($q['options'] as $oIdx => $opt): ?>
          <label style="display:block; margin:0.3rem 0;">
            <input type="radio" name="answers[<?= $idx ?>]" value="<?= $oIdx ?>" required>
            <?= e($opt) ?>
          </label>
        <?php endforeach; ?>
      </div>
    <?php endforeach; ?>
    <button class="btn-primary" type="submit">Submit Assessment</button>
  </form>
</div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
