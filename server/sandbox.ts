// Isolated, read-only simulated cybersecurity terminal & crypto workbench.
// Never spawns OS shells or touches the real filesystem.

const VIRTUAL_FILES: Record<string, string> = {
  '/home/student/welcome_flag.txt': 'CTF{welcome_to_cybertech_bcci}\nGreat work inspecting your home directory!',
  '/home/student/notes.txt': 'CyberTech Society – BCCI Practice Lab\nRemember: ls -la reveals hidden dotfiles.',
  '/home/student/vault/.vault_flag': 'CTF{hidden_dotfiles_exposed}',
  '/lab/risk_register.txt':
    'ASSET           VULNERABILITY                 THREAT              RISK\n' +
    'Student Portal  Unvalidated file upload       Webshell upload     HIGH\n' +
    'Lab Wi-Fi       Default router credentials    Rogue access        CRITICAL\n' +
    'Club Website    Missing HTTPS redirect        Traffic sniffing    MEDIUM',
  '/lab/grades_export.csv': 'student_id,course,grade\n2026-001,IT301,94\n2026-002,IT301,91',
  '/lab/suspicious_email.eml':
    'From: "BCCI Registrar" <support@bcci-verify-urgent.example>\n' +
    'Subject: URGENT: Account Suspension Notice\n' +
    'Link: https://bcci-verify-urgent.example/reset\n' +
    'Flagged Indicators: Domain mismatch + artificial urgency.',
  '/lab/hash_examples.txt':
    'scrypt:  $scrypt$ln=14,r=8,p=1$randomsalt$...\n' +
    'bcrypt:  $2y$12$random22charsalt$...\n' +
    'Never store MD5 or unsalted SHA-1 for passwords.',
  '/lab/mfa_audit.log':
    '2026-11-24 08:12:00 MFA_CHALLENGE user=j.santos method=TOTP status=VERIFIED\n' +
    '2026-11-24 08:19:44 MFA_PUSH user=m.reyes status=DENIED (MFA fatigue blocked)',
  '/lab/firewall.rules':
    'CHAIN INPUT (policy DROP)\n' +
    'ALLOW TCP 0.0.0.0/0 -> 443 (HTTPS)\n' +
    'ALLOW TCP 10.20.0.0/16 -> 22 (Campus Admin SSH)\n' +
    'DENY  TCP 0.0.0.0/0 -> 3306 (MySQL blocked externally)',
  '/lab/web_request.http':
    'POST /api/login HTTP/1.1\nHost: academy.cybertech.local\nContent-Type: application/json\n{"username":"student01","password":"********"}',
  '/lab/sample_page.html':
    '<!doctype html>\n<html>\n<body>\n  <h1>Club Login</h1>\n  <!-- Never place secrets or flags inside HTML comments! -->\n</body>\n</html>',
  '/lab/sqli_compare.php':
    "// VULNERABLE:\n$q = \"SELECT * FROM users WHERE username = '\" . $_POST['u'] . \"'\";\n\n" +
    "// SECURE PDO:\n$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');\n$stmt->execute([$_POST['u']]);",
  '/lab/xss_notes.txt':
    "Always escape dynamic output:\nPHP: htmlspecialchars($text, ENT_QUOTES, 'UTF-8')\nReact: {text} (never dangerouslySetInnerHTML on untrusted input)",
  '/lab/csrf_flow.txt':
    '1. Server generates random 32-byte $_SESSION["csrf_token"]\n2. Form includes hidden input csrf_token\n3. POST handler runs hash_equals($_SESSION["csrf_token"], $_POST["csrf_token"])',
  '/lab/owasp_checklist.txt':
    '[x] Parameterized queries everywhere\n[x] Server-side RBAC on every admin route\n[x] CSRF tokens on state-changing forms\n[x] Salted password_hash / scrypt',
  '/lab/crypto_notes.txt':
    'Symmetric (AES-256-GCM): same key encrypts & decrypts fast.\nAsymmetric (RSA/ECC): public key encrypts/verifies, private key decrypts/signs.',
  '/lab/evidence_manifest.txt':
    'Case: BCCI-2026-09\nImage: lab_server_disk.dd\nSHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\nStatus: Verified Copy',
  '/lab/sample_exif.txt':
    'Camera: Canon EOS R10\nDate: 2026-11-18 14:22:10\nGPS: 14.5950 N, 120.9842 E\nSoftware: Adobe Lightroom',
  '/lab/magic_bytes.txt':
    'PNG: 89 50 4E 47\nJPEG: FF D8 FF\nPDF: 25 50 44 46 (%PDF)\nZIP: 50 4B 03 04 (PK)',
  '/lab/image_forensics.txt':
    'PNG ends with IEND chunk (49 45 4E 44 AE 42 60 82). Bytes after IEND may indicate appended payloads.',
  '/lab/roe.txt':
    'RULES OF ENGAGEMENT\nScope: 10.10.20.0/24 CyberTech Practice Subnet ONLY.\nProhibited: Denial of Service, testing external school or public servers.',
  '/lab/cve_sample.txt':
    'CVE-2024-XXXX | CVSS 8.8 (High) | Missing authorization check on admin export endpoint -> Fixed in v2.4.',
  '/lab/security.txt':
    'Contact: mailto:security@cybertech-bcci.example\nPolicy: Coordinated 90-day disclosure',
  '/lab/code_of_conduct.txt':
    'CYBERTECH SOCIETY - BCCI CODE OF CONDUCT\n1. Obtain explicit authorization before testing any system.\n2. Protect user privacy and never exfiltrate real personal data.\n3. Compete fairly in Hack4Gov and CTF events.',
  '/etc/passwd':
    'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nstudent:x:1000:1000:CyberTech Student:/home/student:/bin/bash',
  '/var/log/auth.log':
    '2026-11-24 02:10:11 sshd[412]: Failed password for invalid user admin from 203.0.113.45 port 55210\n' +
    '2026-11-24 02:10:14 sshd[412]: Failed password for root from 203.0.113.45 port 55212\n' +
    '2026-11-24 02:14:01 sshd[498]: Accepted publickey for student from 10.10.1.24 port 44120\n' +
    '2026-11-24 02:18:45 auditd[511]: NOTICE CYBERTECH_FLAG=CTF{linux_grep_fu_champion}',
  '/var/log/access_audit.log':
    '10.10.1.12 - - [24/Nov/2026:01:02:11] "GET /index.php HTTP/1.1" 200 1842\n' +
    '203.0.113.99 - - [24/Nov/2026:03:19:02] "GET /export?token=Q1RGe2ZvcmVuc2ljX2xvZ19pbnZlc3RpZ2F0b3J9 HTTP/1.1" 403 512',
  '/ctf/auth_audit_lab.php':
    "<?php\n// Vulnerable Legacy Code (Isolated Review Sample)\n// Input: $user = \"admin' --\";\n// Fixed with PDO prepared statements:\n$verified_remediation_flag = 'CTF{parameterized_queries_stop_sqli}';",
};

const VIRTUAL_DIRS: Record<string, { normal: string[]; hidden: string[] }> = {
  '/': { normal: ['home', 'lab', 'var', 'etc', 'ctf'], hidden: [] },
  '/home': { normal: ['student'], hidden: [] },
  '/home/student': { normal: ['welcome_flag.txt', 'notes.txt', 'vault'], hidden: ['.bashrc'] },
  '/home/student/vault': { normal: [], hidden: ['.vault_flag'] },
  '/lab': {
    normal: [
      'risk_register.txt',
      'grades_export.csv',
      'suspicious_email.eml',
      'hash_examples.txt',
      'mfa_audit.log',
      'firewall.rules',
      'web_request.http',
      'sample_page.html',
      'sqli_compare.php',
      'xss_notes.txt',
      'csrf_flow.txt',
      'owasp_checklist.txt',
      'crypto_notes.txt',
      'evidence_manifest.txt',
      'sample_exif.txt',
      'magic_bytes.txt',
      'image_forensics.txt',
      'roe.txt',
      'cve_sample.txt',
      'security.txt',
      'code_of_conduct.txt',
    ],
    hidden: [],
  },
  '/var': { normal: ['log'], hidden: [] },
  '/var/log': { normal: ['auth.log', 'access_audit.log'], hidden: [] },
  '/etc': { normal: ['passwd'], hidden: [] },
  '/ctf': { normal: ['auth_audit_lab.php'], hidden: [] },
};

function caesarShift(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' && ch <= 'z' ? 97 : 65;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

export function runSandboxCommand(rawCommand: string): string {
  const cmd = rawCommand.trim();
  if (!cmd) return '';

  const parts = cmd.split(/\s+/);
  const bin = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (bin === 'help') {
    return [
      'CyberTech Academy Isolated Sandbox Terminal',
      'Available safe commands:',
      '  help                         Show this command list',
      '  whoami / id / uname -a       Inspect current simulated host & identity',
      '  pwd                          Show current directory (/home/student)',
      '  ls [-la] [dir]               List directory contents (-la reveals hidden dotfiles)',
      '  cat <path>                   Print file contents',
      '  grep <term> <path>           Search matching lines in a file',
      '  sha256sum <path>             Compute SHA-256 digest of a lab file',
      '  base64 -d <string>           Decode a Base64 string',
      '  base64 -e <string>           Encode text to Base64',
      '  hexdecode <hex>              Convert hexadecimal bytes to ASCII text',
      '  bindecode <bits...>          Convert 8-bit binary groups to ASCII text',
      '  caesar -s <shift> <text>     Apply Caesar cipher shift',
      '  rev_shift <offset> <csv>     Shift comma-separated ASCII codes',
      '  xor20 <hex>                  XOR hex bytes with 0x20',
      '  nmap 10.10.20.5              Simulated scan of authorized lab target',
      '  nc 10.10.20.5 <port>         Inspect simulated service banner',
      '  dig <domain> [TXT]           Simulated DNS lookup',
      '  curl -I <url>                Simulated HTTP header inspection',
      '  ip addr | ip route | ss -tuln | ps aux',
    ].join('\n');
  }

  if (bin === 'whoami') return 'student';
  if (bin === 'id') return 'uid=1000(student) gid=1000(student) groups=1000(student),27(cybertech)';
  if (bin === 'pwd') return '/home/student';
  if (bin === 'uname') return 'Linux cybertech-lab 6.8.0-bcci #1 SMP x86_64 GNU/Linux';

  if (bin === 'ls') {
    const showHidden = args.some((a) => a.startsWith('-') && a.includes('a'));
    const dirArg = args.find((a) => !a.startsWith('-')) || '/home/student';
    const normalized = dirArg === '.' ? '/home/student' : dirArg.replace(/\/+$/, '') || '/';
    const entry = VIRTUAL_DIRS[normalized];
    if (!entry) return `ls: cannot access '${dirArg}': No such file or directory`;
    const items = showHidden ? ['.', '..', ...entry.hidden, ...entry.normal] : entry.normal;
    return items.length ? items.join('\n') : '(empty directory — try ls -la if hidden files exist)';
  }

  if (bin === 'cat') {
    const target = args[0];
    if (!target) return 'Usage: cat <file_path>';
    const resolved = target.startsWith('/') ? target : `/home/student/${target}`;
    if (VIRTUAL_FILES[resolved]) return VIRTUAL_FILES[resolved];
    return `cat: ${target}: No such file in sandbox`;
  }

  if (bin === 'grep') {
    if (args.length < 2) return 'Usage: grep <pattern> <file_path>';
    const pattern = args[0].replace(/^["']|["']$/g, '');
    const target = args[1];
    const resolved = target.startsWith('/') ? target : `/home/student/${target}`;
    const content = VIRTUAL_FILES[resolved];
    if (!content) return `grep: ${target}: No such file in sandbox`;
    const matches = content.split('\n').filter((line) => line.toLowerCase().includes(pattern.toLowerCase()));
    return matches.length ? matches.join('\n') : '(no matching lines)';
  }

  if (bin === 'sha256sum') {
    const target = args[0];
    if (!target) return 'Usage: sha256sum <file_path>';
    if (target === '/lab/grades_export.csv') {
      return `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  ${target}`;
    }
    return `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  ${target}`;
  }

  if (bin === 'base64') {
    if (args[0] === '-d' && args[1]) {
      try {
        return Buffer.from(args.slice(1).join(' '), 'base64').toString('utf8');
      } catch {
        return 'base64: invalid input';
      }
    }
    if (args[0] === '-e' && args[1]) {
      return Buffer.from(args.slice(1).join(' '), 'utf8').toString('base64');
    }
    return 'Usage: base64 -d <encoded>  OR  base64 -e <text>';
  }

  if (bin === 'hexdecode') {
    const hex = args.join('').replace(/[^0-9a-fA-F]/g, '');
    if (!hex || hex.length % 2 !== 0) return 'Usage: hexdecode <even-length hex string>';
    return Buffer.from(hex, 'hex').toString('utf8');
  }

  if (bin === 'bindecode') {
    if (!args.length) return 'Usage: bindecode 01110011 01110100 ...';
    return args
      .map((b) => {
        const clean = b.replace(/[^01]/g, '');
        if (!clean) return '';
        return String.fromCharCode(parseInt(clean, 2));
      })
      .join('');
  }

  if (bin === 'caesar') {
    if (args[0] === '-s' && args[1] && args[2]) {
      const shift = Number(args[1]);
      if (Number.isNaN(shift)) return 'Shift must be an integer, e.g. caesar -s -7 JAM{...}';
      return caesarShift(args.slice(2).join(' '), shift);
    }
    return 'Usage: caesar -s <shift> <text>';
  }

  if (bin === 'rev_shift') {
    if (args.length < 2) return 'Usage: rev_shift -2 69,86,72,...';
    const offset = Number(args[0]);
    const nums = args[1].split(',').map((n) => Number(n.trim()));
    if (Number.isNaN(offset) || nums.some(Number.isNaN)) return 'Invalid integer arguments';
    return nums.map((n) => String.fromCharCode(n + offset)).join('');
  }

  if (bin === 'xor20') {
    const hex = args.join('').replace(/[^0-9a-fA-F]/g, '');
    if (!hex || hex.length % 2 !== 0) return 'Usage: xor20 <hex_bytes>';
    const buf = Buffer.from(hex, 'hex');
    const out = Buffer.from(buf.map((b) => b ^ 0x20)).toString('utf8');
    return out;
  }

  if (bin === 'nmap') {
    const host = args[0] || '10.10.20.5';
    if (host !== '10.10.20.5') {
      return `Scope Notice: Authorized target is 10.10.20.5 only. Run: nmap 10.10.20.5`;
    }
    return [
      'Starting CyberTech Authorized Lab Scan ( 10.10.20.5 )',
      'PORT      STATE SERVICE    VERSION',
      '22/tcp    open  ssh        OpenSSH 9.2',
      '443/tcp   open  https      nginx 1.24 (TLS 1.3)',
      '31337/tcp open  diagnostic CyberTech Banner Service (connect via: nc 10.10.20.5 31337)',
    ].join('\n');
  }

  if (bin === 'nc') {
    if (args[0] === '10.10.20.5' && args[1] === '31337') {
      return 'Connected to 10.10.20.5:31337\nDiagnostic Banner: CTF{port_31337_service_found}';
    }
    return 'Usage: nc 10.10.20.5 31337';
  }

  if (bin === 'dig') {
    const domain = (args[0] || '').toLowerCase();
    if (domain === 'ctf-lab.bcci.local') {
      return ';; ANSWER SECTION:\nctf-lab.bcci.local.  300  IN  TXT  "CTF{dns_txt_records_revealed}"';
    }
    if (domain === 'cybertech.bcci.local') {
      return ';; ANSWER SECTION:\ncybertech.bcci.local.  300  IN  A    10.10.20.5\ncybertech.bcci.local.  300  IN  TXT  "v=spf1 include:_spf.bcci.edu ~all"';
    }
    return `;; Query simulated domains: cybertech.bcci.local or ctf-lab.bcci.local`;
  }

  if (bin === 'curl') {
    return [
      'HTTP/2 200',
      'server: nginx/1.24',
      'content-type: text/html; charset=UTF-8',
      'strict-transport-security: max-age=31536000',
      'x-content-type-options: nosniff',
      'x-frame-options: SAMEORIGIN',
    ].join('\n');
  }

  if (bin === 'ip') {
    if (args[0] === 'route') return 'default via 10.10.20.1 dev eth0\n10.10.20.0/24 dev eth0 proto kernel scope link src 10.10.20.42';
    return '1: lo: <LOOPBACK> inet 127.0.0.1/8\n2: eth0: <BROADCAST,MULTICAST,UP> inet 10.10.20.42/24';
  }

  if (bin === 'ss') {
    return 'Netid  State   Local Address:Port\ntcp    LISTEN  127.0.0.1:3306\ntcp    LISTEN  0.0.0.0:443\ntcp    LISTEN  0.0.0.0:22';
  }

  if (bin === 'ps') {
    return 'USER   PID %CPU %MEM COMMAND\nroot     1  0.0  0.1 /sbin/init\nwww    412  0.2  1.1 nginx: worker\nstudent 880 0.0  0.2 -bash';
  }

  return `Command '${bin}' is not enabled in this isolated sandbox. Type 'help' to see supported utilities.`;
}
