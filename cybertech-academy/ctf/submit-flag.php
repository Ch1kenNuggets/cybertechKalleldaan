<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

$user = require_login();
verify_csrf();

$chalId = (int)($_POST['challenge_id'] ?? 0);
$submittedFlag = trim((string)($_POST['flag'] ?? ''));

$pdo = getDB();
$stmt = $pdo->prepare('SELECT id, title, points, flag_answer FROM challenges WHERE id = ? AND is_active = 1 LIMIT 1');
$stmt->execute([$chalId]);
$challenge = $stmt->fetch();

$isAjax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function respond_flag(bool $isAjax, bool $correct, string $msg, int $chalId): void {
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['correct' => $correct, 'message' => $msg]);
        exit;
    }
    header('Location: ' . BASE_URL . '/ctf/challenge-detail.php?id=' . $chalId);
    exit;
}

if (!$challenge || $submittedFlag === '') {
    respond_flag($isAjax, false, 'Invalid challenge or empty flag.', $chalId);
}

$dupStmt = $pdo->prepare('SELECT id FROM challenge_submissions WHERE user_id = ? AND challenge_id = ? AND is_correct = 1 LIMIT 1');
$dupStmt->execute([(int)$user['id'], $chalId]);
if ($dupStmt->fetch()) {
    respond_flag($isAjax, true, 'Challenge already solved. Duplicate points are prevented.', $chalId);
}

$correct = hash_equals(trim((string)$challenge['flag_answer']), $submittedFlag);

if (!$correct) {
    $pdo->prepare('INSERT INTO challenge_submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded) VALUES (?, ?, ?, 0, 0)')
        ->execute([(int)$user['id'], $chalId, substr($submittedFlag, 0, 180)]);
    respond_flag($isAjax, false, 'Incorrect flag. Double-check your decoding and CTF{...} format.', $chalId);
}

$pdo->beginTransaction();
try {
    $pts = (int)$challenge['points'];
    $pdo->prepare('INSERT INTO challenge_submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded) VALUES (?, ?, ?, 1, ?)')
        ->execute([(int)$user['id'], $chalId, '[VERIFIED]', $pts]);
    $pdo->prepare('UPDATE users SET total_points = total_points + ? WHERE id = ?')
        ->execute([$pts, (int)$user['id']]);
    $pdo->commit();
    log_activity((int)$user['id'], 'ctf_solve', 'Solved ' . $challenge['title'] . ' (+' . $pts . ' pts)');
    respond_flag($isAjax, true, 'Flag accepted! +' . $pts . ' points awarded.', $chalId);
} catch (Throwable $e) {
    $pdo->rollBack();
    respond_flag($isAjax, false, 'Submission failed. Please retry.', $chalId);
}
