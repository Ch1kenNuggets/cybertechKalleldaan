<?php
declare(strict_types=1);
require_once __DIR__ . '/database.php';

function e(?string $value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function slugify(string $text): string {
    $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $text) ?? '', '-'));
    return $slug !== '' ? substr($slug, 0, 60) : 'item-' . time();
}

function log_activity(?int $userId, string $actionType, string $summary): void {
    $pdo = getDB();
    $stmt = $pdo->prepare('INSERT INTO activity_logs (user_id, action_type, summary) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $actionType, substr($summary, 0, 250)]);
}

function get_user_rank(int $userId): int {
    $pdo = getDB();
    $rows = $pdo->query("SELECT id FROM users WHERE is_active = 1 AND role = 'student' ORDER BY total_points DESC, created_at ASC")->fetchAll(PDO::FETCH_COLUMN);
    $index = array_search($userId, array_map('intval', $rows), true);
    return $index !== false ? $index + 1 : 0;
}

function get_user_badges(int $userId): array {
    $pdo = getDB();
    $stmt1 = $pdo->prepare('SELECT COUNT(DISTINCT challenge_id) FROM challenge_submissions WHERE user_id = ? AND is_correct = 1');
    $stmt1->execute([$userId]);
    $solves = (int)$stmt1->fetchColumn();

    $stmt2 = $pdo->prepare('SELECT COUNT(*) FROM lesson_progress WHERE user_id = ?');
    $stmt2->execute([$userId]);
    $lessons = (int)$stmt2->fetchColumn();

    $badges = [];
    if ($solves >= 1) $badges[] = ['title' => 'First Flag Captured', 'desc' => 'Solved your first CTF challenge.'];
    if ($solves >= 5) $badges[] = ['title' => 'Hack4Gov Contender', 'desc' => 'Captured 5 or more verified flags.'];
    if ($lessons >= 3) $badges[] = ['title' => 'Academy Initiate', 'desc' => 'Completed 3+ cybersecurity lessons.'];
    if ($lessons >= 7) $badges[] = ['title' => 'CyberTech Scholar', 'desc' => 'Completed 7+ cybersecurity lessons.'];
    return $badges;
}

function validate_safe_upload(array $file, array $allowedExt = ['txt', 'md', 'pdf', 'csv', 'json']): ?string {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }
    if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
        throw new RuntimeException('Uploaded file exceeds 2MB limit.');
    }
    $ext = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        throw new RuntimeException('Disallowed file extension. Allowed: ' . implode(', ', $allowedExt));
    }
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    $safeName = bin2hex(random_bytes(8)) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename((string)$file['name']));
    $dest = UPLOAD_DIR . $safeName;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new RuntimeException('Failed to store uploaded file.');
    }
    return $safeName;
}
