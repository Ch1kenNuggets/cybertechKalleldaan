<?php
$navUser = current_user();
?>
<header class="site-header">
  <div class="header-inner">
    <a class="brand-link" href="<?= BASE_URL ?>/index.php">CyberTech Society</a>
    <nav class="nav-links" aria-label="Main Navigation">
      <a href="<?= BASE_URL ?>/academy/index.php">Academy</a>
      <a href="<?= BASE_URL ?>/ctf/index.php">CTF Arena</a>
      <a href="<?= BASE_URL ?>/leaderboard.php">Leaderboard</a>
      <a href="<?= BASE_URL ?>/announcements.php">Announcements</a>
      <?php if ($navUser && $navUser['role'] === 'admin'): ?>
        <a href="<?= BASE_URL ?>/admin/index.php">Admin</a>
      <?php endif; ?>
    </nav>
    <div class="header-action">
      <?php if ($navUser): ?>
        <a class="btn-primary" href="<?= BASE_URL ?>/dashboard.php">Dashboard</a>
      <?php else: ?>
        <a class="btn-primary" href="<?= BASE_URL ?>/login.php">Sign In</a>
      <?php endif; ?>
    </div>
  </div>
</header>
