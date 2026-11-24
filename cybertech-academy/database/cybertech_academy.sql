-- CyberTech Society - CyberTech Academy & CTF Platform
-- Complete MySQL / MariaDB Schema for XAMPP & phpMyAdmin
-- Engine: InnoDB | Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS `cybertech_academy`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `cybertech_academy`;

-- 1. Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `student_id` VARCHAR(40) DEFAULT '',
  `year_level` VARCHAR(60) DEFAULT '1st Year BSIT',
  `bio` TEXT DEFAULT NULL,
  `total_points` INT UNSIGNED NOT NULL DEFAULT 0,
  `failed_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_points` (`total_points` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Lesson Categories (7 Academy Modules)
CREATE TABLE IF NOT EXISTS `lesson_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(60) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `level` VARCHAR(40) NOT NULL DEFAULT 'Beginner',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Lessons
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 15,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `objectives` TEXT NOT NULL,
  `explanation` LONGTEXT NOT NULL,
  `examples` TEXT DEFAULT NULL,
  `exercise_prompt` TEXT NOT NULL,
  `quiz_json` JSON NOT NULL,
  `material_file` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lessons_slug` (`slug`),
  KEY `idx_lessons_category` (`category_id`),
  CONSTRAINT `fk_lessons_category`
    FOREIGN KEY (`category_id`) REFERENCES `lesson_categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Lesson Progress
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `lesson_id` INT UNSIGNED NOT NULL,
  `quiz_score` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `quiz_total` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `completed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_lesson` (`user_id`, `lesson_id`),
  KEY `idx_lp_lesson` (`lesson_id`),
  CONSTRAINT `fk_lp_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_lesson`
    FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Challenge Categories (9 CTF Categories)
CREATE TABLE IF NOT EXISTS `challenge_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(60) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_chal_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Challenges
CREATE TABLE IF NOT EXISTS `challenges` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
  `points` INT UNSIGNED NOT NULL DEFAULT 100,
  `description` TEXT NOT NULL,
  `instructions` TEXT NOT NULL,
  `flag_answer` VARCHAR(255) NOT NULL,
  `download_file` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_challenges_slug` (`slug`),
  KEY `idx_challenges_category` (`category_id`),
  CONSTRAINT `fk_challenges_category`
    FOREIGN KEY (`category_id`) REFERENCES `challenge_categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Challenge Hints
CREATE TABLE IF NOT EXISTS `challenge_hints` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `challenge_id` INT UNSIGNED NOT NULL,
  `hint_text` TEXT NOT NULL,
  `cost_points` INT UNSIGNED NOT NULL DEFAULT 0,
  `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_hints_challenge` (`challenge_id`),
  CONSTRAINT `fk_hints_challenge`
    FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Challenge Submissions
CREATE TABLE IF NOT EXISTS `challenge_submissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `challenge_id` INT UNSIGNED NOT NULL,
  `submitted_flag` VARCHAR(255) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `points_awarded` INT UNSIGNED NOT NULL DEFAULT 0,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user_chal` (`user_id`, `challenge_id`, `is_correct`),
  KEY `idx_sub_chal` (`challenge_id`),
  CONSTRAINT `fk_sub_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_challenge`
    FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. CTF Events
CREATE TABLE IF NOT EXISTS `ctf_events` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('upcoming', 'active', 'completed') NOT NULL DEFAULT 'upcoming',
  `location` VARCHAR(150) NOT NULL DEFAULT 'Online Arena',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_events_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Event Participants
CREATE TABLE IF NOT EXISTS `event_participants` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `team_name` VARCHAR(80) NOT NULL DEFAULT 'Solo',
  `registered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_event_user` (`event_id`, `user_id`),
  CONSTRAINT `fk_ep_event`
    FOREIGN KEY (`event_id`) REFERENCES `ctf_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ep_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Announcements
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General',
  `content` TEXT NOT NULL,
  `pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `author_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ann_pinned` (`pinned`, `created_at`),
  CONSTRAINT `fk_ann_author`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `summary` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_user` (`user_id`, `created_at`),
  CONSTRAINT `fk_logs_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hint Unlocks Tracking
CREATE TABLE IF NOT EXISTS `hint_unlocks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `hint_id` INT UNSIGNED NOT NULL,
  `unlocked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_hint` (`user_id`, `hint_id`),
  CONSTRAINT `fk_hu_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hu_hint`
    FOREIGN KEY (`hint_id`) REFERENCES `challenge_hints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA: 7 Academy Modules, Starter Lessons, 9 CTF Categories & Challenges
-- ============================================================================

INSERT INTO `lesson_categories` (`slug`, `name`, `description`, `level`, `sort_order`) VALUES
('fundamentals', 'Cybersecurity Fundamentals', 'Core security concepts, CIA Triad, threats, malware, phishing, passwords, and MFA.', 'Beginner', 1),
('networking', 'Networking Fundamentals', 'IP addressing, DNS/DHCP, TCP/UDP, HTTP/HTTPS, ports, and firewall defense.', 'Beginner', 2),
('linux', 'Linux Fundamentals', 'Linux shell, basic commands, file permissions, users/groups, and filesystem layout.', 'Beginner', 3),
('web-security', 'Web Security', 'Web architecture, HTML/CSS/JS, SQL injection, XSS, session security, and OWASP Top 10.', 'Intermediate', 4),
('cryptography', 'Cryptography', 'Encoding vs encryption, Caesar cipher, Base64, hashing, and modern encryption.', 'Beginner', 5),
('digital-forensics', 'Digital Forensics', 'Metadata, file signatures, image investigation, log analysis, and evidence handling.', 'Intermediate', 6),
('ethical-hacking', 'Ethical Hacking', 'Reconnaissance, vulnerability assessment, safe testing, responsible disclosure, and ethics.', 'Intermediate', 7);

INSERT INTO `lessons` (`category_id`, `slug`, `title`, `difficulty`, `duration_minutes`, `sort_order`, `objectives`, `explanation`, `examples`, `exercise_prompt`, `quiz_json`) VALUES
(1, 'intro-to-cybersecurity', 'Introduction to Cybersecurity', 'Beginner', 15, 1,
 'Define cybersecurity|Distinguish threats, vulnerabilities, and risk',
 'Cybersecurity protects systems, networks, and data from unauthorized access or disruption. Vulnerabilities are weaknesses; threats exploit them; risk measures likelihood and impact.',
 'Vulnerability: Unpatched upload form -> Mitigation: Strict MIME & extension validation.',
 'Review a campus portal and list three assets that require Confidentiality, Integrity, or Availability.',
 '[{"question":"Which term describes a flaw that can be exploited?","options":["Threat","Vulnerability","Firewall"],"correct":1},{"question":"What combines likelihood and impact?","options":["Risk","Hashing","Latency"],"correct":0}]'),
(1, 'cia-triad', 'The CIA Triad', 'Beginner', 15, 2,
 'Explain Confidentiality, Integrity, and Availability|Map security controls to each pillar',
 'Confidentiality keeps data private (encryption, RBAC). Integrity guarantees accuracy (SHA-256 hashes, signatures). Availability keeps systems reachable (backups, redundancy).',
 'Database leak = Confidentiality breach; Ransomware = Availability breach.',
 'Identify which CIA pillar is protected by TLS encryption and which is protected by SHA-256 checksums.',
 '[{"question":"AES encryption primarily protects which pillar?","options":["Availability","Confidentiality","Latency"],"correct":1}]'),
(2, 'intro-to-networking', 'Introduction to Networking', 'Beginner', 15, 1,
 'Understand routers vs switches|Summarize the TCP/IP model',
 'Switches forward Ethernet frames within a LAN using MAC addresses. Routers connect networks using IP addresses.',
 'Packet encapsulation: Ethernet -> IP -> TCP -> HTTP.',
 'Inspect your local network interface address using ipconfig (Windows) or ip addr (Linux).',
 '[{"question":"Which device routes packets between different IP subnets?","options":["Switch","Router","Hub"],"correct":1}]'),
(2, 'common-network-ports', 'Common Network Ports', 'Beginner', 15, 2,
 'Identify well-known TCP/UDP ports|Distinguish encrypted vs cleartext services',
 'Well-known ports include 21 (FTP), 22 (SSH), 23 (Telnet), 53 (DNS), 80 (HTTP), 443 (HTTPS), and 3306 (MySQL).',
 'Prefer SSH (22) over Telnet (23) and HTTPS (443) over HTTP (80).',
 'Check which services are listening locally on your XAMPP setup.',
 '[{"question":"Which port serves encrypted HTTPS traffic?","options":["80","22","443"],"correct":2}]'),
(3, 'basic-linux-commands', 'Basic Linux Commands', 'Beginner', 20, 1,
 'Navigate filesystems with ls, pwd, cd, cat, and grep|Inspect hidden dotfiles',
 'Use pwd to print your working directory, ls -la to reveal hidden files starting with a dot, cat to read files, and grep to search patterns.',
 'grep "FAILED" /var/log/auth.log',
 'Practice listing hidden files in a home directory using ls -la.',
 '[{"question":"Which flag reveals hidden dotfiles in ls?","options":["-x","-la","-p"],"correct":1}]'),
(4, 'sql-injection-concepts', 'SQL Injection Concepts', 'Intermediate', 25, 1,
 'Understand why string concatenation causes SQLi|Write PDO prepared statements',
 'Concatenating user input directly into SQL allows attackers to alter query logic. Prepared statements separate SQL syntax from bound parameter values.',
 '$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?"); $stmt->execute([$u]);',
 'Audit a sample PHP login query and convert it to PDO prepared statements.',
 '[{"question":"What is the primary defense against SQL Injection?","options":["Prepared statements","HTML comments","Base64"],"correct":0}]'),
(5, 'base64', 'Base64 Encoding', 'Beginner', 15, 1,
 'Identify Base64 padding and character set|Decode Base64 strings',
 'Base64 translates binary data into printable ASCII text using A-Z, a-z, 0-9, +, /, and = padding. It is encoding, not encryption.',
 'CTF{demo} -> Q1RGe2RlbW99 (Notice the Q1RGe prefix for CTF{).',
 'Decode Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0= using PHP base64_decode or Linux base64 -d.',
 '[{"question":"Is Base64 an encryption algorithm?","options":["Yes","No, it is public encoding","Only with padding"],"correct":1}]'),
(6, 'log-analysis', 'Log Analysis', 'Intermediate', 20, 1,
 'Read HTTP access logs|Spot automated scanning patterns',
 'Access logs capture IP addresses, timestamps, HTTP methods, paths, and status codes. Repeated 404 probes for /.env or /admin signal scanning.',
 '203.0.113.99 - "GET /export?token=..." 403',
 'Review sample web access log lines to identify anomalous external requests.',
 '[{"question":"A burst of 404 requests for /.env and /admin indicates:","options":["Normal traffic","Automated scanning","DNS caching"],"correct":1}]'),
(7, 'responsible-disclosure', 'Responsible Disclosure & Cyber Ethics', 'Beginner', 15, 1,
 'Follow Coordinated Vulnerability Disclosure|Understand cybercrime law and scope',
 'Only test systems with explicit written authorization. If you discover a flaw responsibly, stop after minimal proof and report privately to the owner.',
 'Check /.well-known/security.txt for reporting contacts.',
 'Read the CyberTech Society Code of Conduct and summarize the scope rule.',
 '[{"question":"What separates ethical hacking from unauthorized intrusion?","options":["Written authorization and scope","Using Linux","Night testing"],"correct":0}]');

INSERT INTO `challenge_categories` (`slug`, `name`, `description`, `sort_order`) VALUES
('general-skills', 'General Skills', 'CLI fluency, data conversion, and core utilities.', 1),
('cryptography', 'Cryptography', 'Ciphers, encodings, hashing, and cryptanalysis.', 2),
('web-exploitation', 'Web Exploitation', 'HTTP headers, cookies, injection logic, and OWASP flaws.', 3),
('digital-forensics', 'Digital Forensics', 'Log triage, EXIF metadata, and file inspection.', 4),
('networking', 'Networking', 'Ports, DNS records, and traffic inspection.', 5),
('linux', 'Linux', 'Filesystem navigation, dotfiles, and grep pipelines.', 6),
('reverse-engineering', 'Reverse Engineering', 'Static code analysis and logic tracing.', 7),
('osint', 'OSINT', 'Open-source intelligence and commit history.', 8),
('steganography', 'Steganography', 'Hidden data inside text and binary channels.', 9);

INSERT INTO `challenges` (`category_id`, `slug`, `title`, `difficulty`, `points`, `description`, `instructions`, `flag_answer`) VALUES
(1, 'hexadecimal-trail', 'Hexadecimal Trail', 'Beginner', 100,
 'An intercepted beacon sent a hex-encoded flag: 4354467b6865785f746f5f61736369695f6465636f6465647d.',
 'Convert the hexadecimal bytes back to ASCII text. Flag format: CTF{...}',
 'CTF{hex_to_ascii_decoded}'),
(2, 'hidden-message', 'Hidden Message', 'Beginner', 100,
 'A mysterious encoded message was discovered: Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=. Your task is to identify the encoding method and decode the message to discover the flag.',
 'Decode the Base64 string and submit the flag in CTF{your_answer} format.',
 'CTF{base64_is_not_encryption}'),
(2, 'caesars-dispatch', 'Caesar''s Dispatch', 'Beginner', 125,
 'Encrypted dispatch (Caesar shift +7): JAM{jhlzhy_zopma_thzalya}.',
 'Shift letters backward by 7 positions to recover the original flag.',
 'CTF{caesar_shift_mastery}'),
(3, 'cookie-jar-tamper', 'Cookie Jar Tamper', 'Beginner', 150,
 'A legacy server sent Set-Cookie: club_role=Q1RGe25ldmVyX3RydXN0X2NsaWVudF9jb29raWVzfQ==; Path=/',
 'Decode the cookie payload to uncover why client cookies must never hold trusted authorization.',
 'CTF{never_trust_client_cookies}'),
(4, 'suspicious-access-log', 'Suspicious Access Log', 'Beginner', 150,
 'Log snippet: 203.0.113.99 - "GET /export?token=Q1RGe2ZvcmVuc2ljX2xvZ19pbnZlc3RpZ2F0b3J9 HTTP/1.1" 403 512',
 'Extract and decode the Base64 token leaked in the query string.',
 'CTF{forensic_log_investigator}'),
(5, 'open-port-banner', 'Open Port Banner', 'Beginner', 125,
 'Scan summary for 10.10.20.5: Port 31337/tcp open banner = Q1RGe3BvcnRfMzEzMzdfc2VydmljZV9mb3VuZH0=',
 'Decode the diagnostic service banner.',
 'CTF{port_31337_service_found}'),
(6, 'hidden-dotfile', 'Hidden Dotfile', 'Beginner', 100,
 'Directory listing shows .vault_flag containing 4354467b68696464656e5f646f7466696c65735f6578706f7365647d.',
 'Convert the dotfile hex payload back to ASCII.',
 'CTF{hidden_dotfiles_exposed}'),
(7, 'python-gatekeeper', 'Python Gatekeeper', 'Beginner', 150,
 'Each character of the flag had +2 added to its ASCII code: [69,86,72,125,117,118,99,118,107,101,97,99,112,99,110,123,117,107,117,97,119,112,110,113,101,109,103,102,127].',
 'Subtract 2 from each integer and convert ASCII codes to text.',
 'CTF{static_analysis_unlocked}'),
(8, 'developer-commit-slip', 'Developer Commit Slip', 'Intermediate', 225,
 'Git diff excerpt: - $STAGING_FLAG = "CTF{git_history_remembers_all}";',
 'Recover the removed staging flag from the commit diff.',
 'CTF{git_history_remembers_all}'),
(9, 'binary-pulse-channel', 'Binary Pulse Channel', 'Intermediate', 250,
 'Verified 8-bit binary stream: 01110011 01110100 01100101 01100111 01101111',
 'Convert the 5 binary bytes into ASCII letters and wrap inside CTF{...}.',
 'CTF{stego}');

INSERT INTO `challenge_hints` (`challenge_id`, `hint_text`, `cost_points`, `sort_order`) VALUES
(2, 'Strings beginning with Q1RGe and ending with = are Base64 encoded.', 0, 1),
(2, 'In PHP or Linux terminal, run base64_decode("Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=").', 15, 2),
(3, 'J shifted back 7 letters becomes C.', 0, 1);

INSERT INTO `ctf_events` (`slug`, `title`, `description`, `start_date`, `end_date`, `status`, `location`) VALUES
('hack4gov-practice-2026', 'Hack4Gov Regional Qualifier Practice CTF', 'Official CyberTech Society – BCCI practice competition preparing student teams for DICT Hack4Gov.', '2026-12-05 09:00:00', '2026-12-06 18:00:00', 'upcoming', 'BCCI Computer Laboratory 2 & Online'),
('freshers-cyber-cup-2026', 'CyberTech Freshers Cyber Cup', 'Beginner-friendly CTF sprint for BCCI IT and Computer Science students.', '2026-11-20 08:00:00', '2026-12-20 23:59:00', 'active', 'CyberTech Academy Online Arena');

INSERT INTO `announcements` (`title`, `category`, `content`, `pinned`) VALUES
('Hack4Gov 2026 Training Cohort Open', 'Competition', 'Complete Academy Modules 1-5 and solve at least 5 CTF challenges to qualify for CyberTech Society Hack4Gov team tryouts.', 1),
('Weekly Friday Linux & Terminal Clinic', 'Schedule', 'Student mentors host hands-on Linux CLI and log forensics practice every Friday from 3:00 PM to 5:00 PM at Computer Lab 3B.', 1);
