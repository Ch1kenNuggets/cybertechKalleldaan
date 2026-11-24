<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/auth.php';
$user = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $chalId = (int)($_POST['challenge_id'] ?? 0);
    $hintId = (int)($_POST['hint_id'] ?? 0);
    $pdo = getDB();

    $stmt = $pdo->prepare('SELECT * FROM challenge_hints WHERE id = ? AND challenge_id = ? LIMIT 1');
    $stmt->execute([$hintId, $chalId]);
    $hint = $stmt->fetch();

    if ($hint) {
        $cost = (int)$hint['cost_points'];
        if ($cost === 0 || (int)$user['total_points'] >= $cost) {
            $pdo->prepare('INSERT IGNORE INTO hint_unlocks (user_id, hint_id) VALUES (?, ?)')->execute([(int)$user['id'], $hintId]);
            if ($cost > 0) {
                $pdo->prepare('UPDATE users SET total_points = GREATEST(0, total_points - ?) WHERE id = ?')->execute([$cost, (int)$user['id']]);
            }
        }
    }
    header('Location: ' . BASE_URL . '/ctf/challenge-detail.php?id=' . $chalId);
    exit;
}
header('Location: ' . BASE_URL . '/ctf/challenges.php');
exit;
