export interface SeedModule {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  level: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SeedLesson {
  categorySlug: string;
  slug: string;
  title: string;
  sortOrder: number;
  difficulty: 'Beginner' | 'Intermediate';
  durationMinutes: number;
  objectives: string[];
  explanation: string;
  examples: string;
  exercisePrompt: string;
  exerciseCommandHint: string;
  quiz: QuizQuestion[];
}

export interface SeedChallengeCategory {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface SeedChallenge {
  categorySlug: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  description: string;
  instructions: string;
  flag: string;
  downloadFileName?: string;
  downloadFileContent?: string;
  sandboxPreset?: string;
  hints: { text: string; cost: number }[];
}

export const SEED_MODULES: SeedModule[] = [
  {
    slug: 'fundamentals',
    name: 'Cybersecurity Fundamentals',
    description: 'Core security concepts, risk awareness, malware defense, phishing detection, and authentication.',
    sortOrder: 1,
    level: 'Beginner',
  },
  {
    slug: 'networking',
    name: 'Networking Fundamentals',
    description: 'How packets travel across IP networks, DNS resolution, TCP/UDP transport, ports, and firewall defense.',
    sortOrder: 2,
    level: 'Beginner',
  },
  {
    slug: 'linux',
    name: 'Linux Fundamentals',
    description: 'Command-line mastery, filesystem navigation, permissions, user management, and log inspection.',
    sortOrder: 3,
    level: 'Beginner',
  },
  {
    slug: 'web-security',
    name: 'Web Security',
    description: 'HTTP request anatomy, SQL injection, Cross-Site Scripting (XSS), session safety, and OWASP Top 10.',
    sortOrder: 4,
    level: 'Beginner to Intermediate',
  },
  {
    slug: 'cryptography',
    name: 'Cryptography',
    description: 'Encoding vs encryption, classical ciphers, Base64, cryptographic hashing, and symmetric/asymmetric keys.',
    sortOrder: 5,
    level: 'Beginner to Intermediate',
  },
  {
    slug: 'digital-forensics',
    name: 'Digital Forensics',
    description: 'Evidence preservation, file signatures, EXIF metadata inspection, and security log analysis.',
    sortOrder: 6,
    level: 'Intermediate',
  },
  {
    slug: 'ethical-hacking',
    name: 'Ethical Hacking',
    description: 'Authorized reconnaissance, vulnerability assessment, responsible disclosure, and cyber ethics.',
    sortOrder: 7,
    level: 'Intermediate',
  },
];

export const SEED_LESSONS: SeedLesson[] = [
  // Module 1: Cybersecurity Fundamentals
  {
    categorySlug: 'fundamentals',
    slug: 'intro-to-cybersecurity',
    title: 'Introduction to Cybersecurity',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Define cybersecurity and explain why digital assets require layered protection.',
      'Identify the main domains of cybersecurity: network, application, endpoint, and human security.',
      'Distinguish between threats, vulnerabilities, and risk.'
    ],
    explanation: `Cybersecurity is the practice of protecting computer systems, networks, programs, and data from unauthorized access, disruption, or theft. For university students and future IT engineers, security is not an afterthought—it is a design mindset.\n\nEvery security decision revolves around three core terms:\n• Vulnerability: A weakness in software, hardware, or human process (such as an unpatched web server or a weak default password).\n• Threat: A potential danger capable of exploiting a vulnerability (such as an automated botnet scanner or a social engineer).\n• Risk: The likelihood and business impact if a threat successfully exploits a vulnerability.`,
    examples: `Real-world BCCI Campus Scenario:\n- Vulnerability: A student portal forgets to validate uploaded profile pictures.\n- Threat: An attacker uploads a disguised script file.\n- Mitigation: Restrict allowed MIME types, rename files randomly, and store uploads outside executable directories.`,
    exercisePrompt: 'Run the status inspection command in the practice terminal to view a sample campus asset risk register.',
    exerciseCommandHint: 'cat /lab/risk_register.txt',
    quiz: [
      {
        question: 'Which term describes a flaw or weakness in a system that could be exploited?',
        options: ['Threat', 'Vulnerability', 'Payload', 'Firewall'],
        correctIndex: 1,
      },
      {
        question: 'What combines the likelihood of an exploit with its potential impact?',
        options: ['Risk', 'Hashing', 'Latency', 'Bandwidth'],
        correctIndex: 0,
      },
      {
        question: 'Which approach uses multiple independent security layers rather than relying on one control?',
        options: ['Single sign-on', 'Defense in depth', 'Port forwarding', 'Plaintext storage'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'cia-triad',
    title: 'The CIA Triad',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Explain Confidentiality, Integrity, and Availability with concrete examples.',
      'Map security controls (encryption, checksums, backups) to each pillar of the CIA Triad.',
      'Recognize which pillar is violated during common cyber incidents.'
    ],
    explanation: `The CIA Triad is the foundational model of information security:\n\n1. Confidentiality ensures that sensitive data is accessible only to authorized individuals. Controls include encryption, access control lists, and multi-factor authentication.\n2. Integrity guarantees that data remains accurate, authentic, and unaltered during storage or transit. Controls include SHA-256 checksums, digital signatures, and database constraints.\n3. Availability ensures that systems and data remain reliable and reachable when authorized users need them. Controls include redundant servers, DDoS protection, and verified backups.`,
    examples: `Mapping Incidents to the CIA Triad:\n- Database leak posted online -> Confidentiality breach.\n- Attacker alters student grades in a database -> Integrity breach.\n- Ransomware encrypts hospital files or DDoS knocks a site offline -> Availability breach.`,
    exercisePrompt: 'Verify file integrity in the terminal using sha256sum on the lab manifest.',
    exerciseCommandHint: 'sha256sum /lab/grades_export.csv',
    quiz: [
      {
        question: 'Which pillar of the CIA Triad is primarily protected by AES encryption?',
        options: ['Availability', 'Confidentiality', 'Redundancy', 'Virtualization'],
        correctIndex: 1,
      },
      {
        question: 'Using SHA-256 checksums to verify a downloaded ISO file has not been modified supports which pillar?',
        options: ['Integrity', 'Availability', 'Confidentiality', 'Anonymity'],
        correctIndex: 0,
      },
      {
        question: 'A DDoS attack that floods a university website until students cannot open it violates which pillar?',
        options: ['Integrity', 'Confidentiality', 'Availability', 'Authentication'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'common-cyber-threats',
    title: 'Common Cyber Threats',
    sortOrder: 3,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Categorize common threat actors including cybercriminals, hacktivists, and insider threats.',
      'Understand attack vectors such as brute-force attacks, credential stuffing, and DDoS.',
      'Identify early warning indicators of automated scanning and unauthorized access.'
    ],
    explanation: `Modern networks face constant automated and targeted threats:\n\n• Brute-Force & Credential Stuffing: Attackers try thousands of password combinations or reuse leaked email/password pairs from other breaches.\n• Denial of Service (DoS / DDoS): Flooding a target server with overwhelming traffic so legitimate users cannot connect.\n• Man-in-the-Middle (MitM): Intercepting unencrypted traffic on public Wi-Fi to read or modify communications.\n• Insider Threats: Accidental misconfigurations or malicious actions by individuals who already hold legitimate credentials.`,
    examples: `Log snippet showing a credential stuffing attempt:\n2026-11-20 09:14:02 FAILED LOGIN user=j.santos ip=203.0.113.45\n2026-11-20 09:14:03 FAILED LOGIN user=m.reyes ip=203.0.113.45\n2026-11-20 09:14:04 FAILED LOGIN user=a.cruz ip=203.0.113.45`,
    exercisePrompt: 'Inspect simulated authentication failure logs to spot brute-force IP addresses.',
    exerciseCommandHint: 'grep FAILED /var/log/auth.log',
    quiz: [
      {
        question: 'Reusing passwords leaked from one website to break into another website is called:',
        options: ['Credential stuffing', 'Port knocking', 'DNS tunneling', 'Salting'],
        correctIndex: 0,
      },
      {
        question: 'What does a Man-in-the-Middle attack target?',
        options: ['Offline backups', 'Communication between two parties', 'BIOS firmware', 'Keyboard hardware'],
        correctIndex: 1,
      },
      {
        question: 'Why do modern login forms implement rate limiting and lockouts?',
        options: ['To speed up SQL queries', 'To stop automated brute-force guessing', 'To compress HTML', 'To bypass HTTPS'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'malware-and-ransomware',
    title: 'Malware and Ransomware',
    sortOrder: 4,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Differentiate between viruses, worms, Trojans, spyware, and ransomware.',
      'Explain how ransomware disrupts organizations and why offline backups are essential.',
      'Recognize safe defensive habits to reduce malware infection risk.'
    ],
    explanation: `Malware (malicious software) is any program designed to harm, spy on, or hijack a system:\n\n• Virus: Attaches to legitimate files and spreads when those files are executed or shared.\n• Worm: Self-replicates across networks without requiring user interaction.\n• Trojan: Disguises itself as useful software (like a cracked utility or fake PDF invoice) while hiding malicious code.\n• Ransomware: Encrypts victim files and demands payment for the decryption key.\n\nDefense starts with least-privilege accounts, timely OS updates, email attachment filtering, and immutable 3-2-1 backups.`,
    examples: `3-2-1 Backup Rule:\n- 3 copies of important data\n- 2 different storage media\n- 1 copy stored offline/offsite so ransomware cannot encrypt it.`,
    exercisePrompt: 'List running processes in the simulated sandbox to spot a suspicious binary name.',
    exerciseCommandHint: 'ps aux',
    quiz: [
      {
        question: 'Which type of malware spreads automatically across a network without needing a user to open a file?',
        options: ['Trojan', 'Worm', 'Adware', 'Keylogger'],
        correctIndex: 1,
      },
      {
        question: 'What is the most reliable recovery defense against a ransomware attack?',
        options: ['Paying the ransom immediately', 'Keeping tested offline backups', 'Disabling HTTPS', 'Using incognito mode'],
        correctIndex: 1,
      },
      {
        question: 'A malicious program disguised inside a fake game installer is best described as a:',
        options: ['Trojan', 'Rootkit', 'Botnet', 'Packet sniffer'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'phishing-and-social-engineering',
    title: 'Phishing and Social Engineering',
    sortOrder: 5,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Spot psychological triggers used in social engineering (urgency, authority, fear).',
      'Inspect email headers, display names, and lookalike domains before clicking links.',
      'Distinguish between bulk phishing, spear phishing, smishing, and pretexting.'
    ],
    explanation: `Social engineering manipulates human trust rather than exploiting software code. Phishing is the most frequent initial entry point in real-world compromises.\n\nRed flags to verify on every unexpected message:\n1. Sender domain mismatch (e.g. "BCCI Registrar" coming from registrar@bcci-portal-verify.xyz).\n2. Artificial urgency ("Your student account will be suspended in 2 hours!").\n3. Lookalike characters (typosquatting such as microsofft.com or goog1e.com).\n4. Requests for MFA codes, passwords, or gift cards.`,
    examples: `Inspecting a suspicious link before clicking:\nDisplay text: https://portal.bcci.edu.ph/login\nActual href:  https://bcci-login.verify-account-now.example/auth\nAlways hover over links and verify the exact root domain.`,
    exercisePrompt: 'Examine a sample phishing email header stored in the lab filesystem.',
    exerciseCommandHint: 'cat /lab/suspicious_email.eml',
    quiz: [
      {
        question: 'Highly targeted phishing crafted specifically for one individual or organization is called:',
        options: ['Spear phishing', 'Port scanning', 'ARP spoofing', 'Fuzzing'],
        correctIndex: 0,
      },
      {
        question: 'Which detail is the most reliable check on an unexpected password-reset email?',
        options: ['The university logo in the banner', 'The actual destination domain of the link and sender header', 'Polite greeting', 'Font size'],
        correctIndex: 1,
      },
      {
        question: 'Phishing carried out over SMS text messages is commonly known as:',
        options: ['Vishing', 'Smishing', 'Whaling', 'Tailgating'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'password-security',
    title: 'Password Security',
    sortOrder: 6,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand why length and unpredictability beat complex short passwords.',
      'Explain why unique passwords per service prevent cascade breaches.',
      'Understand how password managers and slow salted hashes (Argon2/bcrypt/scrypt) protect credentials.'
    ],
    explanation: `Password cracking tools can test billions of simple hashes per second on modern GPUs. Short passwords like "P@ssw0rd1" are cracked almost instantaneously because attackers use dictionary rules.\n\nBest practices:\n• Length over complexity: A 16+ character random passphrase (e.g. "timber-velvet-lantern-quartz") has vastly more entropy than an 8-character password with symbols.\n• Zero reuse: Never reuse passwords across accounts. Use a reputable password manager.\n• Developer responsibility: Never store plaintext passwords. Always hash with a per-user random salt using Argon2id, bcrypt, or scrypt.`,
    examples: `Entropy comparison:\n- "Admin123!" (9 chars, predictable pattern) -> cracked in seconds.\n- "c9#Kv!2mP8$zQ4wR" (16 random chars) -> infeasible to brute force.`,
    exercisePrompt: 'Check the sample shadow/hash format in the lab to see how salted hashes look.',
    exerciseCommandHint: 'cat /lab/hash_examples.txt',
    quiz: [
      {
        question: 'Which factor increases password resistance to brute-force cracking the most?',
        options: ['Replacing "a" with "@"', 'Increasing overall length and randomness', 'Changing it every 7 days to "Pass1", "Pass2"', 'Writing it in uppercase'],
        correctIndex: 1,
      },
      {
        question: 'Why do secure web applications add a unique random "salt" before hashing each password?',
        options: ['To make passwords shorter', 'To defeat precomputed rainbow tables and hide identical passwords', 'To send passwords over HTTP', 'To allow admins to read passwords'],
        correctIndex: 1,
      },
      {
        question: 'Which algorithm is specifically designed for secure password storage?',
        options: ['MD5', 'SHA-1', 'Argon2id / bcrypt / scrypt', 'Base64'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'fundamentals',
    slug: 'multi-factor-authentication',
    title: 'Multi-Factor Authentication',
    sortOrder: 7,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Identify the three authentication factor categories: knowledge, possession, and inherence.',
      'Compare SMS OTP, authenticator apps (TOTP), and phishing-resistant hardware keys (FIDO2/WebAuthn).',
      'Recognize MFA fatigue attacks and how to defend against them.'
    ],
    explanation: `Multi-Factor Authentication (MFA) requires two or more independent evidence types before granting access:\n\n1. Something you know (password, PIN).\n2. Something you have (authenticator app TOTP, FIDO2 security key, smart card).\n3. Something you are (fingerprint, facial recognition).\n\nStrength hierarchy:\n• Hardware FIDO2 / Passkeys (strongest — cryptographically bound to the real website domain, blocking phishing).\n• Authenticator App (TOTP 6-digit rotating codes — much safer than SMS).\n• SMS Codes (weakest MFA — vulnerable to SIM swapping, though still better than password-only).`,
    examples: `Warning against MFA Fatigue:\nIf you receive repeated unexpected push notifications asking "Approve sign-in?", NEVER tap Approve. Deny the request and immediately rotate your password.`,
    exercisePrompt: 'Inspect an example TOTP verification log entry in the sandbox.',
    exerciseCommandHint: 'cat /lab/mfa_audit.log',
    quiz: [
      {
        question: 'Entering a password and tapping a 6-digit code from an authenticator app uses which two factors?',
        options: ['Knowledge + Possession', 'Inherence + Location', 'Possession + Inherence', 'Two knowledge factors'],
        correctIndex: 0,
      },
      {
        question: 'Which MFA method provides the strongest protection against lookalike phishing websites?',
        options: ['Security questions', 'FIDO2 / WebAuthn hardware keys or Passkeys', 'Email confirmation links', 'SMS codes'],
        correctIndex: 1,
      },
      {
        question: 'What should a user do if they receive unexpected MFA push prompts they did not initiate?',
        options: ['Approve once to make them stop', 'Deny the prompt and change their password immediately', 'Turn off MFA', 'Forward the code to IT support over chat'],
        correctIndex: 1,
      },
    ],
  },

  // Module 2: Networking Fundamentals
  {
    categorySlug: 'networking',
    slug: 'intro-to-networking',
    title: 'Introduction to Networking',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand how routers, switches, and endpoints communicate across LANs and the Internet.',
      'Summarize the OSI 7-layer and TCP/IP 4-layer models.',
      'Recognize why packet visibility matters for cybersecurity defense.'
    ],
    explanation: `A computer network connects devices so they can share data and services. Inside a campus lab (LAN), a switch forwards frames between local machines using MAC addresses, while a router connects the campus network to external networks (WAN / Internet) using IP addresses.\n\nSecurity engineers rely on the OSI and TCP/IP models to pinpoint where attacks happen:\n• Physical & Data Link (MAC spoofing, rogue Wi-Fi APs)\n• Network (IP routing, ICMP floods)\n• Transport (TCP SYN floods, port scanning)\n• Application (HTTP SQLi, DNS poisoning)`,
    examples: `Simplified packet encapsulation:\n[Ethernet Header] -> [IP Header] -> [TCP Header] -> [HTTP Payload]`,
    exercisePrompt: 'Run ifconfig / ip addr simulation to inspect local network interfaces.',
    exerciseCommandHint: 'ip addr',
    quiz: [
      {
        question: 'Which network device forwards packets between different IP networks or subnets?',
        options: ['Switch', 'Router', 'Repeater', 'Patch panel'],
        correctIndex: 1,
      },
      {
        question: 'Which address type operates at the Data Link layer (Layer 2) inside a local network?',
        options: ['MAC address', 'Domain name', 'URL path', 'TCP port'],
        correctIndex: 0,
      },
      {
        question: 'Why do security analysts study network layers?',
        options: ['To speed up monitors', 'To classify where attacks occur and where controls like firewalls inspect traffic', 'To replace passwords', 'To compress images'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'ip-addresses',
    title: 'IP Addresses',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Distinguish between IPv4 and IPv6 address formats.',
      'Identify private RFC 1918 IP ranges vs public routable IPs.',
      'Understand CIDR subnet notation such as /24.'
    ],
    explanation: `An IP (Internet Protocol) address uniquely identifies a host interface on a network.\n\n• IPv4 uses 32 bits written as four octets (0–255), e.g., 192.168.10.25.\n• IPv6 uses 128 bits written in hexadecimal, e.g., 2001:db8::1.\n\nPrivate IPv4 Ranges (never routed directly on the public internet):\n• 10.0.0.0/8\n• 172.16.0.0/12\n• 192.168.0.0/16\n• 127.0.0.0/8 (Loopback / localhost)`,
    examples: `CIDR Subnet Example:\n192.168.1.0/24 means the first 24 bits (192.168.1) identify the network, leaving 8 bits (254 usable host addresses: .1 to .254).`,
    exercisePrompt: 'Inspect routing table entries in the simulated terminal.',
    exerciseCommandHint: 'ip route',
    quiz: [
      {
        question: 'Which IPv4 address is reserved exclusively for private internal networks?',
        options: ['8.8.8.8', '192.168.50.10', '1.1.1.1', '142.250.190.46'],
        correctIndex: 1,
      },
      {
        question: 'What does 127.0.0.1 always refer to?',
        options: ['The campus DNS server', 'The local machine itself (loopback)', 'The default gateway router', 'Broadcast traffic'],
        correctIndex: 1,
      },
      {
        question: 'In 10.20.30.0/24, how many bits represent the network prefix?',
        options: ['8 bits', '16 bits', '24 bits', '32 bits'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'dns-and-dhcp',
    title: 'DNS and DHCP',
    sortOrder: 3,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Explain how DNS translates human-readable domain names into IP addresses.',
      'Identify common DNS record types (A, AAAA, MX, TXT, CNAME).',
      'Explain the DHCP DORA lease process for automatic IP assignment.'
    ],
    explanation: `DNS (Domain Name System) acts as the Internet's directory, mapping names like academy.cybertech.local to IP addresses. Common record types include A (IPv4), AAAA (IPv6), MX (mail servers), CNAME (aliases), and TXT (verification & security policies like SPF/DMARC).\n\nDHCP (Dynamic Host Configuration Protocol) automatically assigns an IP address, subnet mask, default gateway, and DNS server to a connecting device using the 4-step DORA exchange: Discover, Offer, Request, Acknowledge.`,
    examples: `Inspecting DNS records with dig:\ndig cybertech.bcci.local TXT\n;; ANSWER SECTION:\ncybertech.bcci.local. 300 IN TXT "v=spf1 include:_spf.bcci.edu ~all"`,
    exercisePrompt: 'Run a simulated DNS lookup for the CyberTech lab domain.',
    exerciseCommandHint: 'dig cybertech.bcci.local',
    quiz: [
      {
        question: 'Which DNS record maps a domain name to an IPv4 address?',
        options: ['MX', 'A', 'TXT', 'PTR'],
        correctIndex: 1,
      },
      {
        question: 'What are the four steps of a DHCP IP assignment?',
        options: ['SYN, SYN-ACK, ACK, FIN', 'Discover, Offer, Request, Acknowledge', 'GET, POST, PUT, DELETE', 'Query, Cache, Forward, Drop'],
        correctIndex: 1,
      },
      {
        question: 'Which DNS record type is often inspected in OSINT and CTF challenges for hidden verification strings?',
        options: ['TXT', 'SOA', 'AAAA', 'SRV'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'tcp-and-udp',
    title: 'TCP and UDP',
    sortOrder: 4,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Compare connection-oriented TCP with connectionless UDP.',
      'Trace the TCP three-way handshake (SYN, SYN-ACK, ACK).',
      'Match real applications (HTTPS, SSH, DNS, VoIP) to their transport protocol.'
    ],
    explanation: `Transport Layer protocols deliver data between specific applications using port numbers (0–65535).\n\n• TCP (Transmission Control Protocol) is reliable and ordered. Before exchanging data, client and server complete the three-way handshake: SYN -> SYN-ACK -> ACK. Lost packets are retransmitted. Used by HTTP/HTTPS, SSH, and SMTP.\n• UDP (User Datagram Protocol) sends datagrams without a handshake or retransmission overhead, prioritizing low latency. Used by DNS queries, DHCP, streaming, and online games.`,
    examples: `TCP Three-Way Handshake:\nClient ---> SYN (seq=100) ---> Server\nClient <--- SYN-ACK (seq=300, ack=101) <--- Server\nClient ---> ACK (ack=301) ---> Server`,
    exercisePrompt: 'View active TCP/UDP listening sockets in the simulated terminal.',
    exerciseCommandHint: 'ss -tuln',
    quiz: [
      {
        question: 'What is the correct sequence of flags in a standard TCP three-way handshake?',
        options: ['ACK, SYN, FIN', 'SYN, SYN-ACK, ACK', 'GET, OK, CLOSE', 'SYN, RST, ACK'],
        correctIndex: 1,
      },
      {
        question: 'Why do live video calls and online games typically prefer UDP over TCP?',
        options: ['UDP encrypts all packets automatically', 'UDP avoids retransmission delays and handshake overhead', 'UDP guarantees zero packet loss', 'UDP uses longer IP addresses'],
        correctIndex: 1,
      },
      {
        question: 'Which protocol guarantees ordered, acknowledged byte delivery?',
        options: ['UDP', 'ICMP', 'TCP', 'ARP'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'http-and-https',
    title: 'HTTP and HTTPS',
    sortOrder: 5,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Read HTTP request methods (GET, POST) and response status codes (200, 301, 403, 404, 500).',
      'Explain how TLS encrypts HTTP traffic in HTTPS.',
      'Identify security headers and cookie attributes.'
    ],
    explanation: `HTTP (Hypertext Transfer Protocol) powers web communication through request/response messages. Common methods include GET (fetch resources) and POST (submit form/API data). Status codes indicate outcomes: 200 OK, 302 Redirect, 401 Unauthorized, 403 Forbidden, 404 Not Found, and 500 Server Error.\n\nPlain HTTP sends data in cleartext, allowing anyone on the same Wi-Fi to read passwords or session cookies. HTTPS wraps HTTP inside TLS (Transport Layer Security), providing confidentiality, integrity, and server identity verification via X.509 digital certificates.`,
    examples: `Sample HTTP Request:\nGET /ctf/challenges HTTP/1.1\nHost: academy.cybertech.local\nCookie: session=abc123`,
    exercisePrompt: 'Inspect simulated HTTP response headers from the practice web node.',
    exerciseCommandHint: 'curl -I https://academy.cybertech.local',
    quiz: [
      {
        question: 'Which HTTP status code means the server understood the request, but access is forbidden?',
        options: ['200', '301', '403', '502'],
        correctIndex: 2,
      },
      {
        question: 'What protocol secures HTTPS traffic against eavesdropping and tampering?',
        options: ['TLS', 'FTP', 'Telnet', 'ICMP'],
        correctIndex: 0,
      },
      {
        question: 'Which HTTP method is normally used to submit login credentials in a request body?',
        options: ['GET', 'HEAD', 'POST', 'OPTIONS'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'common-network-ports',
    title: 'Common Network Ports',
    sortOrder: 6,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Memorize essential well-known ports (21, 22, 23, 25, 53, 80, 443, 3306).',
      'Identify legacy insecure cleartext services vs encrypted replacements.',
      'Interpret basic port scan results during network audits.'
    ],
    explanation: `Ports act like numbered doors on a server (0–65535), letting one IP address host multiple services:\n• 21: FTP (cleartext file transfer)\n• 22: SSH (encrypted remote shell)\n• 23: Telnet (insecure cleartext remote shell — disable!)\n• 25: SMTP (email routing)\n• 53: DNS (domain resolution)\n• 80: HTTP (unencrypted web)\n• 443: HTTPS (encrypted web)\n• 3306: MySQL database (should never be exposed publicly!)`,
    examples: `Safe vs Unsafe pairs:\n- Telnet (23) -> replace with SSH (22)\n- HTTP (80) -> redirect to HTTPS (443)\n- FTP (21) -> replace with SFTP (22)`,
    exercisePrompt: 'Run a simulated service port scan against the authorized training host.',
    exerciseCommandHint: 'nmap 10.10.20.5',
    quiz: [
      {
        question: 'Which port is the default for encrypted SSH remote administration?',
        options: ['21', '22', '23', '80'],
        correctIndex: 1,
      },
      {
        question: 'Why is exposing port 3306 (MySQL) directly to the public internet a major security risk?',
        options: ['It slows down CSS loading', 'Attackers can brute-force or exploit database credentials directly', 'Browsers require port 3306 for HTML', 'It disables DNS'],
        correctIndex: 1,
      },
      {
        question: 'Which port serves standard HTTPS encrypted web traffic?',
        options: ['53', '80', '443', '8080'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'network-security',
    title: 'Network Security',
    sortOrder: 7,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Explain how firewalls, IDS/IPS, VPNs, and network segmentation (DMZ/VLANs) protect systems.',
      'Understand default-deny firewall policy design.',
      'Recognize suspicious outbound beaconing or lateral movement.'
    ],
    explanation: `Network security prevents unauthorized access and contains breaches if an endpoint is compromised:\n\n• Firewalls filter traffic by IP, port, and connection state. Always apply a "default deny" inbound rule and allow only required ports (e.g., 443).\n• Network Segmentation / VLANs separate student Wi-Fi, administrative servers, and databases so a compromised laptop cannot reach critical servers.\n• IDS / IPS (Intrusion Detection/Prevention Systems) inspect traffic signatures and anomalies.\n• VPNs create encrypted tunnels for remote administrators.`,
    examples: `Default-Deny Firewall Policy:\nALLOW TCP ANY -> 443 (Web Server)\nALLOW TCP 10.20.0.0/16 -> 22 (Admin Subnet Only)\nDENY ALL ANY -> ANY (Log & Drop)`,
    exercisePrompt: 'Review the active firewall ruleset in the simulated lab.',
    exerciseCommandHint: 'cat /lab/firewall.rules',
    quiz: [
      {
        question: 'What is the primary security benefit of network segmentation?',
        options: ['It increases Wi-Fi signal power', 'It limits an attacker’s lateral movement between zones', 'It removes the need for passwords', 'It turns off encryption'],
        correctIndex: 1,
      },
      {
        question: 'Which firewall strategy blocks all traffic except explicitly permitted services?',
        options: ['Default allow', 'Default deny (allowlist)', 'Open relay', 'Promiscuous mode'],
        correctIndex: 1,
      },
      {
        question: 'What is the main difference between an IDS and an IPS?',
        options: ['IDS alerts on suspicious traffic; IPS can actively block it inline', 'IDS only works on Windows', 'IPS replaces DNS', 'There is no difference'],
        correctIndex: 0,
      },
    ],
  },

  // Module 3: Linux Fundamentals
  {
    categorySlug: 'linux',
    slug: 'intro-to-linux',
    title: 'Introduction to Linux',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Explain why Linux dominates cybersecurity servers, cloud infrastructure, and CTF tooling.',
      'Identify major distributions (Ubuntu, Debian, Kali Linux, Fedora).',
      'Understand the role of the Linux kernel and shell.'
    ],
    explanation: `Linux is an open-source operating system kernel created in 1991. Combined with GNU utilities, it powers most web servers, cloud containers, and security workstations.\n\nFor cybersecurity students, Linux is indispensable because:\n1. You gain transparent control over processes, sockets, logs, and permissions.\n2. Security tools (nmap, tcpdump, openssl, strings, exiftool) run natively in the shell.\n3. Most CTF targets and web servers run Linux.`,
    examples: `Checking system and kernel information:\nuname -a\ncat /etc/os-release`,
    exercisePrompt: 'Run uname -a in the simulated terminal to inspect the lab kernel.',
    exerciseCommandHint: 'uname -a',
    quiz: [
      {
        question: 'Which component manages hardware, memory, and CPU scheduling in Linux?',
        options: ['The browser', 'The Linux kernel', 'CSS', 'Apache'],
        correctIndex: 1,
      },
      {
        question: 'Why is Linux widely used in cybersecurity training and CTFs?',
        options: ['It hides all system files from admins', 'It gives transparent CLI access and native security tooling', 'It cannot connect to TCP/IP networks', 'It only runs on phones'],
        correctIndex: 1,
      },
      {
        question: 'Which command displays the current Linux kernel version and architecture?',
        options: ['uname -a', 'mkdir', 'chmod', 'ping'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'linux-terminal',
    title: 'Linux Terminal',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand the shell prompt, standard input/output, pipes (|), and redirection (>).',
      'Use tab completion, command history, and manual pages (man).',
      'Chain commands efficiently during investigations.'
    ],
    explanation: `The terminal runs a command interpreter called a shell (usually bash or zsh). Mastering pipes and redirection turns simple utilities into powerful analysis pipelines:\n\n• > redirects output to overwrite a file; >> appends.\n• | (pipe) sends the output of one command directly into the input of the next.\n• man <command> opens the built-in manual.`,
    examples: `Chaining commands with pipes:\ncat /var/log/auth.log | grep "FAILED" | wc -l\nCounts how many failed login lines appear in auth.log.`,
    exercisePrompt: 'Test whoami and id in the simulated terminal.',
    exerciseCommandHint: 'id',
    quiz: [
      {
        question: 'Which operator sends the output of one command as input into another command?',
        options: ['&', '|', '?', '@'],
        correctIndex: 1,
      },
      {
        question: 'What does the command "whoami" print?',
        options: ['Your IP address', 'Your current username', 'Total RAM', 'Open TCP ports'],
        correctIndex: 1,
      },
      {
        question: 'Which operator appends command output to an existing file without overwriting it?',
        options: ['>', '>>', '<', '|'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'basic-linux-commands',
    title: 'Basic Linux Commands',
    sortOrder: 3,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Use ls, pwd, cd, cat, head, tail, grep, and find.',
      'Reveal hidden files starting with a dot using ls -la.',
      'Search inside text logs for keywords.'
    ],
    explanation: `Essential daily commands for every analyst:\n• pwd — Print working directory.\n• ls -la — List all files including hidden dotfiles (like .env or .bash_history) with permissions.\n• cat / less — Read file contents.\n• grep "pattern" file — Search lines matching a pattern.\n• find /path -name "*.log" — Locate files across directories.`,
    examples: `Finding hidden files in a user directory:\nls -la /home/student\ndrwxr-xr-x 2 student student 4096 .ssh\n-rw------- 1 student student  128 .secret_note`,
    exercisePrompt: 'List hidden files inside /home/student in the simulated terminal.',
    exerciseCommandHint: 'ls -la /home/student',
    quiz: [
      {
        question: 'Which flags with ls show hidden files (starting with a dot) and detailed permissions?',
        options: ['-x', '-la', '-p', '-r'],
        correctIndex: 1,
      },
      {
        question: 'Which command searches for matching text patterns inside files?',
        options: ['grep', 'touch', 'rmdir', 'passwd'],
        correctIndex: 0,
      },
      {
        question: 'What does pwd display?',
        options: ['Current user password', 'Present working directory path', 'Process list', 'Network gateway'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'file-permissions',
    title: 'File Permissions',
    sortOrder: 4,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Decode rwx permission strings for Owner, Group, and Others.',
      'Calculate numeric chmod values (4=read, 2=write, 1=execute).',
      'Recognize dangerous permissions like 777 on sensitive files.'
    ],
    explanation: `Linux enforces access control on every file using three permission bits across three scopes (User/Owner, Group, Others):\n• r (4) = Read\n• w (2) = Write\n• x (1) = Execute\n\nFor example, -rw-r----- (640) allows the owner to read/write (4+2=6), the group to read (4), and others no access (0). Never assign 777 (rwxrwxrwx) to production scripts, config files, or keys.`,
    examples: `chmod 600 private_key.pem   # Owner read/write only\nchmod 755 deploy_script.sh  # Owner rwx, group/others r-x`,
    exercisePrompt: 'Inspect file permissions inside /lab using ls -la /lab.',
    exerciseCommandHint: 'ls -la /lab',
    quiz: [
      {
        question: 'What does chmod 600 on a file permit?',
        options: ['Everyone can read and execute', 'Only the owner can read and write; group and others have no access', 'Only root can delete it', 'Everyone can write to it'],
        correctIndex: 1,
      },
      {
        question: 'In numeric chmod notation, what value represents Execute (x)?',
        options: ['4', '2', '1', '7'],
        correctIndex: 2,
      },
      {
        question: 'Why is chmod 777 considered a security hazard?',
        options: ['It deletes the file', 'It allows any local user to read, modify, and execute the file', 'It encrypts the disk', 'It disables SSH'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'users-and-groups',
    title: 'Users and Groups',
    sortOrder: 5,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand the root superuser (UID 0) vs standard unprivileged accounts.',
      'Apply the Principle of Least Privilege using sudo.',
      'Read user metadata in /etc/passwd and group memberships.'
    ],
    explanation: `Linux separates administrative power from daily work:\n• root (UID 0) has unrestricted control over the kernel and all files.\n• Standard users should perform daily tasks without root privileges and use sudo only for specific administrative commands.\n• /etc/passwd lists account usernames, UIDs, home directories, and login shells (hashed passwords live separately in /etc/shadow, readable only by root).`,
    examples: `Checking current groups and /etc/passwd entry:\nstudent:x:1000:1000:Student Account:/home/student:/bin/bash`,
    exercisePrompt: 'Inspect /etc/passwd in the simulated terminal.',
    exerciseCommandHint: 'cat /etc/passwd',
    quiz: [
      {
        question: 'Which UID always belongs to the root superuser in Linux?',
        options: ['1', '0', '1000', '999'],
        correctIndex: 1,
      },
      {
        question: 'Where are salted password hashes securely stored on modern Linux systems?',
        options: ['/etc/passwd', '/etc/shadow', '/var/www/html', '/tmp/users'],
        correctIndex: 1,
      },
      {
        question: 'What principle advises giving users and services only the minimum permissions needed for their job?',
        options: ['Principle of Least Privilege', 'Open Access Policy', 'Security by Obscurity', 'Full Trust Model'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'file-system-navigation',
    title: 'File System Navigation',
    sortOrder: 6,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Navigate the Linux Filesystem Hierarchy Standard (/, /etc, /var/log, /home, /tmp).',
      'Distinguish absolute paths from relative paths.',
      'Locate logs, web roots, and temporary directories during triage.'
    ],
    explanation: `Everything in Linux starts from the root directory (/):\n• /etc — System and service configuration files.\n• /var/log — System, authentication, and web server logs.\n• /home — Personal user directories.\n• /tmp — World-writable temporary files (often checked during forensics!).\n• /var/www — Common web application document root.`,
    examples: `Absolute path: /var/log/auth.log\nRelative path (from /var): log/auth.log`,
    exercisePrompt: 'Explore the /var/log directory in the simulated terminal.',
    exerciseCommandHint: 'ls -la /var/log',
    quiz: [
      {
        question: 'Which directory typically holds Linux system and authentication log files?',
        options: ['/bin', '/var/log', '/boot', '/dev'],
        correctIndex: 1,
      },
      {
        question: 'Where are system-wide configuration files usually stored?',
        options: ['/etc', '/tmp', '/media', '/proc'],
        correctIndex: 0,
      },
      {
        question: 'What makes "/etc/hosts" an absolute path?',
        options: ['It ends in a file name', 'It begins at the root directory /', 'It is read-only', 'It points to a temporary file'],
        correctIndex: 1,
      },
    ],
  },

  // Module 4: Web Security
  {
    categorySlug: 'web-security',
    slug: 'intro-to-web-applications',
    title: 'Introduction to Web Applications',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand the client-server architecture (Browser, Web Server, Application Logic, Database).',
      'Identify trust boundaries where untrusted user input enters the backend.',
      'Explain why client-side validation alone never secures an application.'
    ],
    explanation: `A web application splits work between the Frontend (running in the user's browser) and the Backend (running on the server alongside a database).\n\nGolden Rule of Web Security: NEVER trust client input. Any user can bypass JavaScript validation using browser DevTools, curl, or an intercepting proxy. Every input validation, authorization check, and flag verification must happen on the server.`,
    examples: `Trust Boundary:\nBrowser (Untrusted) --[HTTP POST]--> Backend API (Validate & Authorize) --> Database (Parameterized Query)`,
    exercisePrompt: 'Inspect an example HTTP POST payload in the lab.',
    exerciseCommandHint: 'cat /lab/web_request.http',
    quiz: [
      {
        question: 'Why is JavaScript form validation alone insufficient for security?',
        options: ['JavaScript cannot check string lengths', 'Attackers can modify or bypass browser code and send raw HTTP requests directly to the server', 'Browsers disable HTML forms', 'Databases run JavaScript'],
        correctIndex: 1,
      },
      {
        question: 'Where must authentication and permission checks always be enforced?',
        options: ['CSS stylesheets', 'Server-side backend', 'URL query strings', 'HTML comments'],
        correctIndex: 1,
      },
      {
        question: 'Which layer stores persistent records like users, lessons, and challenge submissions?',
        options: ['Browser cache', 'Database', 'Viewport', 'DNS'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'web-security',
    slug: 'html-css-js-basics',
    title: 'HTML, CSS, and JavaScript Basics',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand how HTML structure, CSS presentation, and JavaScript behavior interact in the DOM.',
      'Recognize why secrets or CTF answers must never be placed in HTML comments or JS files.',
      'Inspect network requests and DOM elements responsibly.'
    ],
    explanation: `Every file sent to the browser—HTML, CSS, and JavaScript—can be read and modified by the user via View Source or Developer Tools.\n\nCommon rookie mistake in web development: hiding admin checks, API keys, or CTF flags inside HTML comments (<!-- secret -->) or client-side JavaScript variables. Anything executed on the client is public.`,
    examples: `Insecure anti-pattern:\n<!-- TODO: remove debug flag CTF{never_hide_in_html} -->\nAlways keep secrets and flag checks strictly on the server.`,
    exercisePrompt: 'Inspect the sample vulnerable HTML source file in /lab.',
    exerciseCommandHint: 'cat /lab/sample_page.html',
    quiz: [
      {
        question: 'Can a user view JavaScript files and HTML comments loaded by their browser?',
        options: ['No, they are hidden on the server', 'Yes, all client-side code and comments are visible in View Source and DevTools', 'Only if they use Linux', 'Only on port 22'],
        correctIndex: 1,
      },
      {
        question: 'Which technology defines the structural elements (forms, headings, links) of a webpage?',
        options: ['HTML', 'SQL', 'SSH', 'TLS'],
        correctIndex: 0,
      },
      {
        question: 'Where should CTF flag verification logic live?',
        options: ['Inside main.js', 'Inside a hidden HTML input', 'On the backend server', 'Inside CSS variables'],
        correctIndex: 2,
      },
    ],
  },
  {
    categorySlug: 'web-security',
    slug: 'sql-injection-concepts',
    title: 'SQL Injection Concepts',
    sortOrder: 3,
    difficulty: 'Intermediate',
    durationMinutes: 25,
    objectives: [
      'Explain how string concatenation allows user input to alter SQL query logic.',
      'Recognize vulnerable SQL patterns in PHP/PDO or SQLite.',
      'Implement parameterized prepared statements to eliminate SQL injection.'
    ],
    explanation: `SQL Injection (SQLi) occurs when untrusted user input is concatenated directly into a database query string, allowing an attacker to break out of data context and execute unintended SQL syntax.\n\nThe permanent fix is **Prepared Statements (Parameterized Queries)** using placeholders (? or :name). Prepared statements compile the SQL structure separately from the data, making it impossible for input values to become SQL commands.`,
    examples: `Vulnerable PHP:\n$sql = "SELECT * FROM users WHERE username = '" . $_POST['user'] . "'";\n\nSecure PHP PDO:\n$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");\n$stmt->execute([$_POST['user']]);`,
    exercisePrompt: 'Inspect the vulnerable vs patched PHP query snippet in /lab/sqli_compare.php.',
    exerciseCommandHint: 'cat /lab/sqli_compare.php',
    quiz: [
      {
        question: 'What is the root cause of SQL Injection vulnerabilities?',
        options: ['Using HTTPS', 'Concatenating untrusted user input directly into SQL query strings', 'Using too many tables', 'Indexing primary keys'],
        correctIndex: 1,
      },
      {
        question: 'What is the primary defense against SQL Injection?',
        options: ['CSS hiding', 'Prepared statements with bound parameters', 'Base64 encoding SQL errors', 'Renaming database columns'],
        correctIndex: 1,
      },
      {
        question: 'In a prepared statement, how does the database treat user-supplied parameter values?',
        options: ['As executable SQL keywords', 'Strictly as literal data values, never as SQL code', 'As HTML tags', 'As shell commands'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'web-security',
    slug: 'cross-site-scripting-xss',
    title: 'Cross-Site Scripting (XSS)',
    sortOrder: 4,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Distinguish Reflected, Stored, and DOM-based XSS.',
      'Understand the impact of attacker-controlled JavaScript running in a victim browser.',
      'Apply context-aware output escaping (htmlspecialchars) and safe DOM bindings.'
    ],
    explanation: `Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users. If an announcement or comment form renders raw user input without escaping, a payload like <script>...</script> executes in every reader's browser.\n\nDefenses:\n1. Context-aware output encoding: In PHP use htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); in React rely on safe JSX text interpolation instead of dangerouslySetInnerHTML.\n2. Mark session cookies HttpOnly so JavaScript cannot read them.\n3. Enforce Content Security Policy (CSP) headers.`,
    examples: `Vulnerable PHP:\necho $_GET['search'];\n\nSecure PHP:\necho htmlspecialchars($_GET['search'], ENT_QUOTES, 'UTF-8');`,
    exercisePrompt: 'Compare escaped vs unescaped output examples in /lab/xss_notes.txt.',
    exerciseCommandHint: 'cat /lab/xss_notes.txt',
    quiz: [
      {
        question: 'Which XSS type saves malicious script inside a database (e.g., forum post) and serves it to future visitors?',
        options: ['Stored XSS', 'Reflected XSS', 'ARP poisoning', 'CSRF'],
        correctIndex: 0,
      },
      {
        question: 'In PHP, which function safely encodes HTML special characters before outputting user text?',
        options: ['md5()', 'htmlspecialchars(..., ENT_QUOTES, "UTF-8")', 'base64_encode()', 'eval()'],
        correctIndex: 1,
      },
      {
        question: 'Which cookie flag prevents client-side JavaScript from reading document.cookie?',
        options: ['HttpOnly', 'Path', 'Max-Age', 'Domain'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'web-security',
    slug: 'auth-and-session-security',
    title: 'Authentication and Session Security',
    sortOrder: 5,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Implement secure session lifecycle rules (regeneration on login, expiration, logout invalidation).',
      'Understand Cross-Site Request Forgery (CSRF) and anti-CSRF tokens.',
      'Enforce server-side Role-Based Access Control (RBAC).'
    ],
    explanation: `Once a user logs in, the server tracks them via a session token or cookie. Critical safeguards include:\n• Regenerating session IDs immediately upon login (session_regenerate_id(true)) to prevent session fixation.\n• Protecting state-changing POST forms with unpredictable CSRF tokens verified on the server.\n• Checking role authorization on every admin endpoint—never just hiding the Admin button in the UI.`,
    examples: `PHP Login Safeguards:\nsession_regenerate_id(true);\n$_SESSION['user_id'] = $user['id'];\n$_SESSION['role'] = $user['role'];`,
    exercisePrompt: 'Inspect a sample CSRF token verification flow in /lab/csrf_flow.txt.',
    exerciseCommandHint: 'cat /lab/csrf_flow.txt',
    quiz: [
      {
        question: 'Why should an application call session_regenerate_id(true) after a user logs in?',
        options: ['To clear browser history', 'To prevent session fixation attacks', 'To hash the user password', 'To compress cookies'],
        correctIndex: 1,
      },
      {
        question: 'What does a CSRF token protect against?',
        options: ['SQL Injection', 'Forged state-changing requests triggered from an external malicious site', 'Weak Wi-Fi passwords', 'Port scanning'],
        correctIndex: 1,
      },
      {
        question: 'If an admin menu link is hidden in HTML, is the admin panel secure?',
        options: ['Yes, nobody can find it', 'No, the server must verify the admin role on every admin route', 'Only if CSS hides it', 'Yes, if using GET requests'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'web-security',
    slug: 'owasp-top-10',
    title: 'OWASP Top 10',
    sortOrder: 6,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Summarize major OWASP Top 10 web application risks.',
      'Recognize Broken Access Control (IDOR) and Security Misconfiguration.',
      'Apply secure coding checklists during development.'
    ],
    explanation: `The OWASP Top 10 highlights the most critical web security risks worldwide:\n• Broken Access Control (e.g., changing ?user_id=5 to ?user_id=6 to read someone else's private profile — IDOR).\n• Cryptographic Failures (plaintext passwords, HTTP instead of HTTPS).\n• Injection (SQLi, command injection).\n• Security Misconfiguration (default admin passwords, directory listing enabled, verbose stack traces).`,
    examples: `Broken Access Control Check:\nAlways verify: $requestedUserId === $_SESSION['user_id'] || $_SESSION['role'] === 'admin'`,
    exercisePrompt: 'View the CyberTech OWASP audit checklist in /lab/owasp_checklist.txt.',
    exerciseCommandHint: 'cat /lab/owasp_checklist.txt',
    quiz: [
      {
        question: 'Changing ?invoice_id=101 to ?invoice_id=102 to view another student’s private data is an example of:',
        options: ['Broken Access Control (IDOR)', 'DDoS', 'DNS caching', 'Base64 encoding'],
        correctIndex: 0,
      },
      {
        question: 'Leaving debug mode and verbose database error traces enabled in production falls under:',
        options: ['Security Misconfiguration', 'Hardware Failure', 'MFA Fatigue', 'Steganography'],
        correctIndex: 0,
      },
      {
        question: 'Which organization maintains the Top 10 web security awareness standard?',
        options: ['IEEE', 'OWASP', 'ICANN', 'W3C'],
        correctIndex: 1,
      },
    ],
  },

  // Module 5: Cryptography
  {
    categorySlug: 'cryptography',
    slug: 'intro-to-cryptography',
    title: 'Introduction to Cryptography',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Differentiate encoding, hashing, and encryption.',
      'Identify the goals of cryptography: confidentiality, integrity, authentication, and non-repudiation.',
      'Understand why Kerckhoffs’s principle favors public algorithms with secret keys.'
    ],
    explanation: `Students often confuse three distinct operations:\n1. Encoding (Base64, Hex, URL encoding): Reversible format translation for transport — NO secret key and NO security.\n2. Hashing (SHA-256, Argon2): One-way fingerprint — cannot be reversed to recover original data.\n3. Encryption (AES, RSA): Reversible transformation requiring a secret key to decrypt.\n\nNever invent custom "secret" encryption algorithms; rely on peer-reviewed standards like AES-GCM and SHA-256.`,
    examples: `Encoding: "CTF" -> "Q1RG" (anyone can decode)\nHashing:  "CTF" -> "d5c..." (one-way)\nAES-256:  "CTF" + key -> ciphertext (requires key)`,
    exercisePrompt: 'Test Base64 and Hex conversions in the CyberTech Terminal / Crypto Workbench.',
    exerciseCommandHint: 'base64 -d Q1RGe2hlbGxvX2NyeXB0b30=',
    quiz: [
      {
        question: 'Which process is one-way and cannot be mathematically reversed back to the original input?',
        options: ['Base64 encoding', 'AES encryption', 'Cryptographic hashing', 'Hexadecimal conversion'],
        correctIndex: 2,
      },
      {
        question: 'Does Base64 provide confidentiality against an attacker?',
        options: ['Yes, it is military-grade encryption', 'No, Base64 is a public encoding scheme with no secret key', 'Only when doubled', 'Only on Linux'],
        correctIndex: 1,
      },
      {
        question: 'What does Kerckhoffs’s principle state?',
        options: ['Keep the algorithm secret', 'A cryptosystem should stay secure even if the algorithm is public, as long as the key is secret', 'Always use short keys', 'Avoid mathematics'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'encoding-and-decoding',
    title: 'Encoding and Decoding',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Convert between ASCII text, binary, and hexadecimal representations.',
      'Recognize URL encoding (%20, %3C) and ASCII byte patterns in CTF tasks.',
      'Decode multi-step encodings methodically.'
    ],
    explanation: `Computers represent characters as numbers (ASCII/UTF-8). In CTF challenges, flags are frequently represented in hexadecimal (base 16, digits 0–9 and a–f) or binary (base 2).\n\nRecognizing signatures speeds up solving:\n• Hex of "CTF{" is "43 54 46 7b".\n• URL encoding uses % followed by two hex digits (e.g., %20 = space).`,
    examples: `ASCII: C=67 (0x43), T=84 (0x54), F=70 (0x46)\nHex string "4354467b6865787d" -> "CTF{hex}"`,
    exercisePrompt: 'Decode a hex string using the terminal hex utility.',
    exerciseCommandHint: 'hexdecode 4354467b61736369695f72656164797d',
    quiz: [
      {
        question: 'What base does hexadecimal notation use?',
        options: ['Base 2', 'Base 8', 'Base 16', 'Base 64'],
        correctIndex: 2,
      },
      {
        question: 'In ASCII, what characters do the hex bytes 43 54 46 represent?',
        options: ['ABC', 'CTF', 'KEY', '123'],
        correctIndex: 1,
      },
      {
        question: 'What does %20 represent in URL encoding?',
        options: ['A newline', 'A space character', 'An equals sign', 'A slash'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'caesar-cipher',
    title: 'Caesar Cipher',
    sortOrder: 3,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Encrypt and decrypt substitution messages using a fixed alphabet shift.',
      'Recognize ROT13 (shift by 13) as a self-inverse Caesar cipher.',
      'Understand why a keyspace of only 25 shifts is trivially broken by brute force.'
    ],
    explanation: `The Caesar cipher shifts every letter in the alphabet by a fixed number (e.g., shift +3 turns A into D, B into E). Numbers and punctuation such as braces { } usually remain unchanged.\n\nA famous variant is ROT13 (shift 13): applying ROT13 twice returns the original text because 13 + 13 = 26. Because there are only 25 non-trivial shifts, an analyst can try all 25 possibilities in milliseconds.`,
    examples: `Plaintext:  CTF{caesar}\nShift +3:   FWI{fdhvdu}\nROT13:      PGS{pnrfne}`,
    exercisePrompt: 'Decrypt a Caesar-shifted sample string in the terminal.',
    exerciseCommandHint: 'caesar -s 13 PGS{pnrfne}',
    quiz: [
      {
        question: 'How many unique non-zero shifts exist in a standard English 26-letter Caesar cipher?',
        options: ['25', '128', '256', '1024'],
        correctIndex: 0,
      },
      {
        question: 'Why is ROT13 convenient for simple obfuscation?',
        options: ['It uses 256-bit AES keys', 'Applying ROT13 twice restores the original plaintext', 'It compresses files by 50%', 'It is quantum-resistant'],
        correctIndex: 1,
      },
      {
        question: 'If A shifts to D (+3), what does C shift to?',
        options: ['E', 'F', 'G', 'Z'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'base64',
    title: 'Base64',
    sortOrder: 4,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Identify Base64 strings by their 64-character alphabet and "=" padding.',
      'Encode and decode Base64 strings in CLI and code.',
      'Spot Base64-encoded CTF flags starting with "Q1RGe" ("CTF{").'
    ],
    explanation: `Base64 converts binary bytes into printable ASCII text using A–Z, a–z, 0–9, +, and / (with = or == used as padding at the end when input length is not a multiple of 3 bytes).\n\nPro CTF Tip: Because "CTF{" encodes to "Q1RGe" in Base64, whenever you see a string starting with "Q1RGe..." in a forensic log or challenge file, try Base64 decoding immediately!`,
    examples: `"CTF{demo}" -> "Q1RGe2RlbW99"\nNotice the "Q1RGe" prefix!`,
    exercisePrompt: 'Decode the practice Base64 clue in the simulated terminal.',
    exerciseCommandHint: 'base64 -d Q1RGe2Jhc2U2NF9kZWNvZGVkIX0=',
    quiz: [
      {
        question: 'What is the purpose of "=" or "==" at the end of many Base64 strings?',
        options: ['Password salt', 'Length padding to a 4-character boundary', 'Encryption key', 'Checksum'],
        correctIndex: 1,
      },
      {
        question: 'Which Base64 prefix commonly hints that the decoded text begins with "CTF{"?',
        options: ['ABCD', 'Q1RGe', 'ZZZZ', '4354'],
        correctIndex: 1,
      },
      {
        question: 'Which Linux command decodes a Base64 string?',
        options: ['base64 -d', 'sha256sum', 'chmod +x', 'grep -r'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'hashing',
    title: 'Hashing',
    sortOrder: 5,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Understand key properties of cryptographic hashes: deterministic, fixed-length, avalanche effect, pre-image resistance.',
      'Compare MD5/SHA-1 (deprecated for security) with SHA-256 and SHA-3.',
      'Use hashes for file integrity verification and password verification.'
    ],
    explanation: `A cryptographic hash function maps arbitrary input data to a fixed-size digest (for SHA-256, always 64 hex characters = 256 bits). Changing even a single bit of the input completely scrambles the output (the avalanche effect).\n\nLegacy hashes MD5 and SHA-1 suffer from collision attacks and must not be used for digital signatures or passwords. Use SHA-256 for integrity checks and Argon2id/bcrypt/scrypt for passwords.`,
    examples: `SHA-256("cybertech") = fixed 64-hex-char digest\nSHA-256("Cybertech") = completely different digest`,
    exercisePrompt: 'Compute the SHA-256 digest of a lab file in the terminal.',
    exerciseCommandHint: 'sha256sum /lab/grades_export.csv',
    quiz: [
      {
        question: 'What happens to a SHA-256 hash if one letter in a 10MB file is changed?',
        options: ['Only the last character changes', 'The entire 256-bit hash changes unpredictably (avalanche effect)', 'The hash gets longer', 'Nothing changes'],
        correctIndex: 1,
      },
      {
        question: 'Which hash algorithm is 256 bits (64 hex characters) and widely used for integrity verification?',
        options: ['MD5', 'SHA-256', 'ROT13', 'CRC32'],
        correctIndex: 1,
      },
      {
        question: 'Why are MD5 and SHA-1 avoided for certificates and signatures today?',
        options: ['They are too slow', 'Practical collision vulnerabilities have been demonstrated', 'They require internet access', 'They output variable lengths'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'encryption-and-decryption',
    title: 'Encryption and Decryption',
    sortOrder: 6,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Compare symmetric encryption (AES, ChaCha20) and asymmetric encryption (RSA, ECC).',
      'Explain how TLS uses asymmetric key exchange to establish a fast symmetric session key.',
      'Understand XOR encryption basics frequently tested in beginner CTFs.'
    ],
    explanation: `Encryption protects confidentiality using mathematical keys:\n• Symmetric Encryption (AES-256, ChaCha20): The same secret key encrypts and decrypts data. Extremely fast for bulk files and network streams.\n• Asymmetric Encryption (RSA, ECC): Uses a mathematically linked key pair—a Public Key (shared openly to encrypt or verify signatures) and a Private Key (kept strictly secret to decrypt or sign).\n\nIn beginner CTFs, you will also encounter single-byte or repeating-key XOR: plaintext ^ key = ciphertext, and ciphertext ^ key = plaintext.`,
    examples: `Hybrid TLS Pattern:\n1. Server presents Public Key certificate.\n2. Client & Server agree on a shared session key via asymmetric crypto.\n3. All web pages flow encrypted with fast symmetric AES-GCM.`,
    exercisePrompt: 'Read the cryptography key exchange summary in /lab/crypto_notes.txt.',
    exerciseCommandHint: 'cat /lab/crypto_notes.txt',
    quiz: [
      {
        question: 'In asymmetric cryptography, which key must NEVER be shared?',
        options: ['Public key', 'Private key', 'Certificate serial number', 'Domain name'],
        correctIndex: 1,
      },
      {
        question: 'Which encryption type uses the exact same secret key for both encryption and decryption?',
        options: ['Symmetric encryption (e.g. AES)', 'Asymmetric encryption', 'Hashing', 'URL encoding'],
        correctIndex: 0,
      },
      {
        question: 'In XOR encryption, if C = P ^ K, how do you recover P?',
        options: ['P = C + K', 'P = C ^ K', 'P = C / K', 'P cannot be recovered'],
        correctIndex: 1,
      },
    ],
  },

  // Module 6: Digital Forensics
  {
    categorySlug: 'digital-forensics',
    slug: 'intro-to-digital-forensics',
    title: 'Introduction to Digital Forensics',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Explain the core phases of digital forensics: Identification, Preservation, Analysis, and Reporting.',
      'Understand why analysts always work on a verified forensic copy rather than original evidence.',
      'Document findings accurately with timestamps and hashes.'
    ],
    explanation: `Digital forensics uncovers and preserves electronic evidence after an incident or during a CTF investigation.\n\nGolden Rule: Never analyze the original disk or file directly. First acquire a bit-for-bit image, compute its cryptographic hash (SHA-256), record the Chain of Custody, and perform all analysis on a verified working copy.`,
    examples: `Forensic Workflow:\n1. Acquire image -> 2. Hash original (SHA-256) -> 3. Duplicate working copy -> 4. Investigate logs/files -> 5. Report timeline.`,
    exercisePrompt: 'Review the incident evidence manifest in /lab/evidence_manifest.txt.',
    exerciseCommandHint: 'cat /lab/evidence_manifest.txt',
    quiz: [
      {
        question: 'Why should forensic examiners always analyze a copy instead of the original evidence drive?',
        options: ['Copies run faster', 'To avoid altering timestamps or contents of original evidence', 'Original drives cannot be hashed', 'Operating systems forbid reading originals'],
        correctIndex: 1,
      },
      {
        question: 'What proves that an evidence image has not changed between acquisition and courtroom/report presentation?',
        options: ['File extension', 'Matching cryptographic hash (e.g. SHA-256)', 'Screen brightness', 'File name'],
        correctIndex: 1,
      },
      {
        question: 'What is the log recording everyone who handled a piece of evidence called?',
        options: ['Routing table', 'Chain of Custody', 'DNS zone', 'Call stack'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'file-metadata',
    title: 'File Metadata',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Identify hidden metadata inside images (EXIF), PDFs, and documents.',
      'Extract camera model, author names, software versions, and GPS coordinates.',
      'Strip sensitive metadata before publishing files publicly.'
    ],
    explanation: `Files store data about data—called metadata. Photos taken on phones often embed EXIF tags containing camera model, timestamp, and exact GPS latitude/longitude. Office documents and PDFs often embed author usernames and internal folder paths.\n\nIn CTFs and OSINT, tools like exiftool frequently reveal forgotten comments or coordinates.`,
    examples: `Sample exiftool output:\nAuthor     : j.delacruz\nGPS Position: 14 deg 35' 42.00" N, 120 deg 59' 3.00" E\nComment    : internal_draft_v2`,
    exercisePrompt: 'Inspect extracted EXIF metadata for a sample lab image.',
    exerciseCommandHint: 'cat /lab/sample_exif.txt',
    quiz: [
      {
        question: 'Which metadata standard commonly stores camera settings and GPS coordinates inside JPEG photos?',
        options: ['EXIF', 'HTML', 'DHCP', 'SQL'],
        correctIndex: 0,
      },
      {
        question: 'Why should organizations strip metadata from public documents before uploading them?',
        options: ['To make fonts larger', 'To prevent leaking internal usernames, software versions, or location data', 'To convert text to audio', 'To increase file size'],
        correctIndex: 1,
      },
      {
        question: 'Which popular CLI tool inspects and edits file metadata across images and PDFs?',
        options: ['exiftool', 'ping', 'mkdir', 'cron'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'file-analysis',
    title: 'File Analysis',
    sortOrder: 3,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Verify true file types using magic bytes (file signatures) rather than trusting extensions.',
      'Extract readable ASCII text from binary files using strings.',
      'Spot concatenated or disguised files.'
    ],
    explanation: `Renaming evil.exe to report.pdf changes nothing inside the file. Every standard binary format starts with signature "magic bytes":\n• PNG: 89 50 4E 47\n• JPEG: FF D8 FF\n• PDF: 25 50 44 46 (%PDF)\n• ZIP: 50 4B 03 04 (PK)\n\nTools like file, xxd, hexedit, and strings reveal what a file truly contains.`,
    examples: `Running strings on a mystery binary:\nstrings mystery.bin | grep "CTF{"`,
    exercisePrompt: 'Inspect magic byte signatures in /lab/magic_bytes.txt.',
    exerciseCommandHint: 'cat /lab/magic_bytes.txt',
    quiz: [
      {
        question: 'What identifies a file’s real format even if someone renames its extension?',
        options: ['File size', 'Magic bytes (header signature)', 'Creation date', 'Desktop icon'],
        correctIndex: 1,
      },
      {
        question: 'Which command extracts printable ASCII sequences embedded inside a binary file?',
        options: ['strings', 'touch', 'chmod', 'traceroute'],
        correctIndex: 0,
      },
      {
        question: 'A file starting with bytes "50 4B 03 04" ("PK") is actually what format?',
        options: ['PNG image', 'ZIP archive', 'Plaintext', 'ELF executable'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'image-investigation',
    title: 'Image Investigation',
    sortOrder: 4,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Understand basic image forensics and steganography concepts.',
      'Detect data appended after an image EOF marker or hidden in LSB channels.',
      'Verify integrity and visual anomalies in suspected manipulated images.'
    ],
    explanation: `Images are favorite containers for hidden data in CTF competitions:\n1. Appended Data: Files or text appended after the JPEG End-Of-Image (FF D9) or PNG IEND chunk don't affect normal display but remain in the file bytes.\n2. Least Significant Bit (LSB): Tweaking the lowest bit of red/green/blue pixel values hides messages invisibly to the human eye.\n3. Color plane separation: Adjusting contrast or viewing individual RGB/Alpha channels can expose faint hidden text.`,
    examples: `Inspecting appended text after PNG IEND:\nbinwalk suspicious.png\nstrings suspicious.png | tail -n 10`,
    exercisePrompt: 'Check the simulated image byte inspection summary.',
    exerciseCommandHint: 'cat /lab/image_forensics.txt',
    quiz: [
      {
        question: 'What does LSB stand for in image steganography?',
        options: ['Linux System Binary', 'Least Significant Bit', 'Local Subnet Bridge', 'Large Storage Block'],
        correctIndex: 1,
      },
      {
        question: 'Why does changing the Least Significant Bit of a pixel usually go unnoticed by human eyes?',
        options: ['It deletes the pixel', 'A change of 1 out of 255 in color intensity is visually imperceptible', 'Monitors ignore bit 0', 'It converts PNG to MP3'],
        correctIndex: 1,
      },
      {
        question: 'Which tool scans binary images for embedded archives or appended files?',
        options: ['binwalk', 'whoami', 'ifconfig', 'nslookup'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'log-analysis',
    title: 'Log Analysis',
    sortOrder: 5,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Read Apache/Nginx access logs and Linux auth.log entries.',
      'Correlate IP addresses, timestamps, HTTP status codes, and suspicious paths.',
      'Use grep and sorting pipelines to reconstruct an attack timeline.'
    ],
    explanation: `Logs tell the story of what happened on a server. Web access logs record client IP, timestamp, HTTP method, URL path, status code (200/404/500), and User-Agent.\n\nIndicators of probing or attack:\n• Rapid 404 errors scanning for /admin, /.env, or /phpmyadmin.\n• SQL characters (' OR 1=1, UNION SELECT) inside query parameters.\n• Repeated SSH failures followed by a single Accepted password.`,
    examples: `Sample suspicious access.log line:\n198.51.100.77 - - [24/Nov/2026:02:14:11] "GET /login.php?id=1'%20OR%201=1-- HTTP/1.1" 200 4120 "sqlmap/1.7"`,
    exercisePrompt: 'Search /var/log/auth.log in the simulated terminal for accepted logins.',
    exerciseCommandHint: 'grep Accepted /var/log/auth.log',
    quiz: [
      {
        question: 'A sudden spike of 404 Not Found requests for /.git, /.env, and /wp-admin from one IP indicates:',
        options: ['Normal homepage traffic', 'Automated directory/vulnerability scanning', 'DNS cache expiration', 'Hardware overheating'],
        correctIndex: 1,
      },
      {
        question: 'Which HTTP field in access logs reveals the client software or scanner name (if not spoofed)?',
        options: ['User-Agent', 'Subnet Mask', 'MAC Address', 'TTL'],
        correctIndex: 0,
      },
      {
        question: 'Why is synchronized UTC time (NTP) critical across servers during incident log analysis?',
        options: ['To save disk space', 'To correlate events accurately across multiple machines into one timeline', 'To encrypt logs', 'To speed up PHP'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'basic-evidence-handling',
    title: 'Basic Evidence Handling',
    sortOrder: 6,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Follow proper first-responder steps for volatile vs persistent evidence.',
      'Avoid accidentally contaminating timestamps or memory.',
      'Write clear, factual incident notes.'
    ],
    explanation: `Volatility order guides what to collect first:\n1. CPU registers & RAM (volatile — lost if you pull the power cord!)\n2. Active network connections & running processes\n3. Disk files & logs\n4. Backups\n\nWhen triaging a potentially compromised machine, resist the urge to immediately reboot or run random tools on the live drive—document actions and preserve volatile state first.`,
    examples: `Order of Volatility:\nRAM / Network State (most volatile) -> Disk Files -> Archival Backups (least volatile).`,
    exercisePrompt: 'View active process & network evidence snapshot commands.',
    exerciseCommandHint: 'ss -tuln',
    quiz: [
      {
        question: 'Why should an investigator NOT immediately unplug a running compromised server before considering RAM?',
        options: ['Volatile memory (RAM), active sockets, and decryption keys are lost on power-off', 'It breaks the monitor', 'Hard drives erase themselves', 'The CPU melts'],
        correctIndex: 0,
      },
      {
        question: 'Which evidence source is MOST volatile?',
        options: ['DVD backup', 'RAM / live memory', 'SSD file', 'Printed log sheet'],
        correctIndex: 1,
      },
      {
        question: 'What makes a forensic report credible?',
        options: ['Speculation about motives', 'Reproducible steps, exact timestamps, and verified hashes', 'Hiding mistakes', 'Using vague estimates'],
        correctIndex: 1,
      },
    ],
  },

  // Module 7: Ethical Hacking
  {
    categorySlug: 'ethical-hacking',
    slug: 'intro-to-ethical-hacking',
    title: 'Introduction to Ethical Hacking',
    sortOrder: 1,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Distinguish White Hat (authorized), Grey Hat, and Black Hat hackers.',
      'Understand the Rules of Engagement and written authorization requirement.',
      'Outline the 5 phases of ethical hacking.'
    ],
    explanation: `Ethical hackers (penetration testers and red/purple teamers) use offensive techniques ONLY with explicit written permission to help organizations find and fix weaknesses before malicious actors exploit them.\n\nThe 5 core phases:\n1. Reconnaissance (information gathering)\n2. Scanning & Enumeration\n3. Gaining Access (controlled validation)\n4. Post-exploitation / Impact assessment\n5. Reporting & Remediation verification.`,
    examples: `Golden Rule:\nSame tool (e.g., nmap) + Written Authorization = Ethical Audit.\nSame tool without permission = Unauthorized intrusion.`,
    exercisePrompt: 'Inspect the CyberTech Society Rules of Engagement in /lab/roe.txt.',
    exerciseCommandHint: 'cat /lab/roe.txt',
    quiz: [
      {
        question: 'What strictly separates ethical hacking from illegal computer intrusion?',
        options: ['The operating system used', 'Explicit written authorization and defined scope', 'Using a VPN', 'Testing at night'],
        correctIndex: 1,
      },
      {
        question: 'Which phase focuses on documenting findings and practical fixes for developers?',
        options: ['Reconnaissance', 'Reporting', 'Scanning', 'Spoofing'],
        correctIndex: 1,
      },
      {
        question: 'What is a Rules of Engagement (RoE) document?',
        options: ['A list of passwords', 'The signed agreement defining scope, allowed targets, timing, and emergency contacts', 'A firewall rule', 'A Linux script'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'ethical-hacking',
    slug: 'reconnaissance',
    title: 'Reconnaissance',
    sortOrder: 2,
    difficulty: 'Beginner',
    durationMinutes: 20,
    objectives: [
      'Contrast passive OSINT reconnaissance with active network scanning.',
      'Identify public information sources (DNS, WHOIS, certificate transparency, public repos).',
      'Recognize how organizations minimize unnecessary public exposure.'
    ],
    explanation: `Reconnaissance maps the target's attack surface:\n• Passive Recon gathers public data without touching target servers directly (DNS records, public job listings revealing tech stacks, GitHub repositories, certificate logs).\n• Active Recon interacts directly with the target (ping sweeps, nmap port scans, HTTP banner grabbing) and therefore leaves entries in target logs.`,
    examples: `Passive: dig TXT domain.edu, certificate search\nActive: nmap -sV 10.10.20.5 (authorized scope only)`,
    exercisePrompt: 'Practice passive DNS lookup in the simulated terminal.',
    exerciseCommandHint: 'dig cybertech.bcci.local',
    quiz: [
      {
        question: 'Which activity is an example of Passive Reconnaissance?',
        options: ['Running an aggressive port scan against a web server', 'Reading public DNS records and official press releases', 'Testing SQL injection payloads on a login form', 'Brute-forcing SSH'],
        correctIndex: 1,
      },
      {
        question: 'Why does Active Reconnaissance require strict scope authorization?',
        options: ['It sends packets directly to target systems and may trigger alerts or load', 'It only works offline', 'It costs money per packet', 'It requires physical access'],
        correctIndex: 0,
      },
      {
        question: 'What does "attack surface" mean?',
        options: ['The physical size of a server rack', 'The sum of all exposed entry points, services, and APIs a system presents', 'Monitor resolution', 'Wi-Fi range'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'ethical-hacking',
    slug: 'vulnerability-assessment',
    title: 'Vulnerability Assessment',
    sortOrder: 3,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Understand CVEs (Common Vulnerabilities and Exposures) and CVSS severity scores.',
      'Differentiate automated vulnerability scanning from manual verification.',
      'Prioritize patching based on exploitability and asset criticality.'
    ],
    explanation: `A Vulnerability Assessment systematically identifies, classifies, and prioritizes weaknesses across systems.\n\n• CVE IDs (e.g., CVE-2024-12345) provide standardized public tracking for known flaws.\n• CVSS (0.0–10.0) scores severity based on attack vector, complexity, privileges required, and CIA impact.\n• Automated scanners help catch outdated software quickly, while human analysts eliminate false positives and catch business-logic flaws.`,
    examples: `CVSS Severity Tiers:\n0.0: None | 0.1-3.9: Low | 4.0-6.9: Medium | 7.0-8.9: High | 9.0-10.0: Critical`,
    exercisePrompt: 'View the sample CVE triage report in /lab/cve_sample.txt.',
    exerciseCommandHint: 'cat /lab/cve_sample.txt',
    quiz: [
      {
        question: 'What is a CVE identifier?',
        options: ['A Wi-Fi encryption mode', 'A standardized public identifier for a known security vulnerability', 'A Linux file permission', 'A type of malware'],
        correctIndex: 1,
      },
      {
        question: 'What scale does CVSS use to rate vulnerability severity?',
        options: ['1 to 5 stars', '0.0 to 10.0', 'A to F', '0 to 1000'],
        correctIndex: 1,
      },
      {
        question: 'Why should analysts manually validate automated scanner alerts?',
        options: ['Scanners can produce false positives and miss logic flaws', 'Scanners delete databases', 'Manual checks never use computers', 'To increase CVSS scores'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'ethical-hacking',
    slug: 'basic-security-testing',
    title: 'Basic Security Testing',
    sortOrder: 4,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objectives: [
      'Conduct safe, non-destructive verification inside authorized test labs.',
      'Check for default credentials, missing security headers, and verbose error messages.',
      'Understand why destructive tests (DoS) are excluded from standard testing.'
    ],
    explanation: `Safe security testing validates whether a control works without breaking availability. Beginners should start with configuration hygiene checks:\n1. Verify HTTPS redirection and TLS validity.\n2. Check HTTP security headers (X-Content-Type-Options, Content-Security-Policy).\n3. Confirm test/staging accounts and default passwords are removed.\n4. Practice exploitation exclusively in isolated CTF sandboxes—never on live school or public servers.`,
    examples: `Checking response headers safely:\ncurl -I https://academy.cybertech.local`,
    exercisePrompt: 'Inspect HTTP headers in the simulated terminal.',
    exerciseCommandHint: 'curl -I https://academy.cybertech.local',
    quiz: [
      {
        question: 'Where should students practice vulnerability exploitation techniques?',
        options: ['Live university grade portals', 'Isolated CTF labs and intentionally vulnerable sandboxes', 'Random public websites', 'Friends’ personal accounts'],
        correctIndex: 1,
      },
      {
        question: 'Which check is safe and non-destructive during a web configuration review?',
        options: ['Running a DDoS flood', 'Inspecting HTTP security response headers', 'Dropping production tables', 'Deleting user accounts'],
        correctIndex: 1,
      },
      {
        question: 'Why should default vendor credentials always be changed before deployment?',
        options: ['They are publicly documented and targeted by automated bots', 'They expire in 1 hour', 'They break CSS', 'They slow down DNS'],
        correctIndex: 0,
      },
    ],
  },
  {
    categorySlug: 'ethical-hacking',
    slug: 'responsible-disclosure',
    title: 'Responsible Disclosure',
    sortOrder: 5,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Follow Coordinated Vulnerability Disclosure (CVD) steps when discovering a real bug.',
      'Write a clear, reproducible vulnerability report without exfiltrating user data.',
      'Respect remediation timelines before discussing issues publicly.'
    ],
    explanation: `If you accidentally notice a security flaw on a real website, Responsible (Coordinated) Disclosure means:\n1. Stop testing immediately once proof-of-concept is confirmed—do NOT download personal records or modify data.\n2. Report privately to the organization's security contact (check /.well-known/security.txt) with clear reproduction steps.\n3. Allow reasonable time for patching before any public write-up.`,
    examples: `Good Report Structure:\n- Summary & Severity\n- Affected Endpoint\n- Minimal Non-Destructive Steps to Reproduce\n- Recommended Fix`,
    exercisePrompt: 'Read the sample security.txt file in /lab/security.txt.',
    exerciseCommandHint: 'cat /lab/security.txt',
    quiz: [
      {
        question: 'Where do many organizations publish their official vulnerability reporting contact?',
        options: ['/.well-known/security.txt', '/robots.exe', '/etc/shadow', '/passwords.html'],
        correctIndex: 0,
      },
      {
        question: 'When verifying an access-control bug during responsible disclosure, you should:',
        options: ['Download the entire user database as proof', 'Stop after minimal proof-of-concept and report privately', 'Post it immediately on social media', 'Demand payment'],
        correctIndex: 1,
      },
      {
        question: 'What is the primary goal of Coordinated Vulnerability Disclosure?',
        options: ['Public embarrassment', 'Getting the flaw fixed safely before malicious exploitation', 'Selling zero-days', 'Bypassing backups'],
        correctIndex: 1,
      },
    ],
  },
  {
    categorySlug: 'ethical-hacking',
    slug: 'legal-and-ethical-responsibilities',
    title: 'Legal and Ethical Responsibilities',
    sortOrder: 6,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objectives: [
      'Understand cybercrime laws (such as RA 10175 Cybercrime Prevention Act in the Philippines and international equivalents).',
      'Commit to CyberTech Society’s Code of Conduct.',
      'Build a trustworthy reputation for competitions like Hack4Gov and future cybersecurity careers.'
    ],
    explanation: `Cybersecurity skills carry real legal and ethical weight. Under laws such as the Philippine Cybercrime Prevention Act (RA 10175), unauthorized access, system interference, data interference, and misuse of devices are criminal offenses—even if done "out of curiosity."\n\nAs members of CyberTech Society – BCCI, we uphold integrity, respect privacy, obtain written permission before testing any system, and use our knowledge to defend communities and compete honorably in events like Hack4Gov.`,
    examples: `CyberTech Society Pledge:\n"I will apply my technical skills strictly within authorized environments, protect user privacy, and uphold ethical engineering standards."`,
    exercisePrompt: 'Display the CyberTech Society Code of Conduct in the simulated terminal.',
    exerciseCommandHint: 'cat /lab/code_of_conduct.txt',
    quiz: [
      {
        question: 'Is testing a real company’s website "just to learn" legal without permission?',
        options: ['Yes, if you do not delete anything', 'No, unauthorized access or scanning can still violate cybercrime laws', 'Yes, if you are a student', 'Only on weekends'],
        correctIndex: 1,
      },
      {
        question: 'In the Philippines, which law criminalizes unauthorized access and computer-related offenses?',
        options: ['RA 10175 (Cybercrime Prevention Act)', 'ASCII Standard', 'HTTP/2 RFC', 'IEEE 802.11'],
        correctIndex: 0,
      },
      {
        question: 'What ethical habit builds long-term trust for cybersecurity careers?',
        options: ['Sharing leaked student passwords', 'Strict respect for scope, privacy, and honest reporting', 'Brute-forcing campus Wi-Fi', 'Disabling campus logs'],
        correctIndex: 1,
      },
    ],
  },
];

export const SEED_CHALLENGE_CATEGORIES: SeedChallengeCategory[] = [
  { slug: 'general-skills', name: 'General Skills', description: 'CLI fluency, data conversion, and environment basics.', sortOrder: 1 },
  { slug: 'cryptography', name: 'Cryptography', description: 'Ciphers, encodings, XOR, and cryptographic analysis.', sortOrder: 2 },
  { slug: 'web-exploitation', name: 'Web Exploitation', description: 'HTTP inspection, cookies, injection logic, and OWASP flaws.', sortOrder: 3 },
  { slug: 'digital-forensics', name: 'Digital Forensics', description: 'Log triage, file headers, metadata, and artifact recovery.', sortOrder: 4 },
  { slug: 'networking', name: 'Networking', description: 'Ports, DNS records, traffic analysis, and protocol clues.', sortOrder: 5 },
  { slug: 'linux', name: 'Linux', description: 'Shell navigation, dotfiles, grep pipelines, and permissions.', sortOrder: 6 },
  { slug: 'reverse-engineering', name: 'Reverse Engineering', description: 'Static code reading, logic tracing, and flag reconstruction.', sortOrder: 7 },
  { slug: 'osint', name: 'OSINT', description: 'Open-source intelligence correlation and public history.', sortOrder: 8 },
  { slug: 'steganography', name: 'Steganography', description: 'Hidden channels inside text, whitespace, and binary streams.', sortOrder: 9 },
];

export const SEED_CHALLENGES: SeedChallenge[] = [
  // 1. General Skills
  {
    categorySlug: 'general-skills',
    slug: 'welcome-terminal',
    title: 'Welcome Terminal',
    difficulty: 'Beginner',
    points: 50,
    description: 'Your first mission inside the CyberTech Academy sandbox. Locate the welcome flag stored inside the student home directory.',
    instructions: 'Open the built-in Challenge Terminal below, inspect the files inside `/home/student`, and read the welcome flag file. Submit in the format `CTF{...}`.',
    flag: 'CTF{welcome_to_cybertech_bcci}',
    sandboxPreset: 'general-welcome',
    hints: [
      { text: 'Use `ls -la /home/student` to list files in the home directory.', cost: 0 },
      { text: 'Read the file using `cat /home/student/welcome_flag.txt`.', cost: 10 },
    ],
  },
  {
    categorySlug: 'general-skills',
    slug: 'hexadecimal-trail',
    title: 'Hexadecimal Trail',
    difficulty: 'Beginner',
    points: 100,
    description: 'A network beacon transmitted an ASCII message encoded entirely as hexadecimal bytes: `4354467b6865785f746f5f61736369695f6465636f6465647d`.',
    instructions: 'Convert the hex string back to readable ASCII text using the terminal `hexdecode` command or your own script.',
    flag: 'CTF{hex_to_ascii_decoded}',
    sandboxPreset: 'crypto-workbench',
    hints: [
      { text: 'Notice `43 54 46 7b` in ASCII hex equals `C T F {`.', cost: 0 },
      { text: 'Run `hexdecode 4354467b6865785f746f5f61736369695f6465636f6465647d` in the terminal.', cost: 15 },
    ],
  },

  // 2. Cryptography
  {
    categorySlug: 'cryptography',
    slug: 'hidden-message',
    title: 'Hidden Message',
    difficulty: 'Beginner',
    points: 100,
    description: 'A mysterious encoded message was discovered: `Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=`. Your task is to identify the encoding method and decode the message to discover the flag.',
    instructions: 'Inspect the character set and trailing `=` padding, then decode the string using Base64. Flag format: `CTF{your_answer}`.',
    flag: 'CTF{base64_is_not_encryption}',
    downloadFileName: 'hidden_message.txt',
    downloadFileContent: 'Intercepted Transmission:\nQ1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=\n\nNote: Identify the encoding format and submit as CTF{...}.',
    sandboxPreset: 'crypto-workbench',
    hints: [
      { text: 'Strings starting with `Q1RGe` and ending with `=` are almost always Base64.', cost: 0 },
      { text: 'Run `base64 -d Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=` in the terminal.', cost: 15 },
    ],
  },
  {
    categorySlug: 'cryptography',
    slug: 'caesars-dispatch',
    title: "Caesar's Dispatch",
    difficulty: 'Beginner',
    points: 125,
    description: 'Our club officer encrypted a practice dispatch with a classic Caesar shift: `JAM{jhlzhy_zopma_thzalya}` (shifted forward by 7 letters).',
    instructions: 'Shift each alphabetical character backwards by 7 positions (keep braces and underscores unchanged) to recover the flag.',
    flag: 'CTF{caesar_shift_mastery}',
    sandboxPreset: 'crypto-workbench',
    hints: [
      { text: 'J shifted back by 7 letters becomes C; A shifted back by 7 wraps around Z to T.', cost: 0 },
      { text: 'Run `caesar -s -7 JAM{jhlzhy_zopma_thzalya}` in the terminal.', cost: 20 },
    ],
  },

  // 3. Web Exploitation
  {
    categorySlug: 'web-exploitation',
    slug: 'cookie-jar-tamper',
    title: 'Cookie Jar Tamper',
    difficulty: 'Beginner',
    points: 150,
    description: 'An older student club portal stored a Base64-encoded role token inside a cookie instead of verifying permissions on the server.',
    instructions: 'Download or inspect `session_capture.http`, examine the `Set-Cookie` header value, and decode the token payload to find the secret flag.',
    flag: 'CTF{never_trust_client_cookies}',
    downloadFileName: 'session_capture.http',
    downloadFileContent: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nSet-Cookie: club_role=Q1RGe25ldmVyX3RydXN0X2NsaWVudF9jb29raWVzfQ==; Path=/\nX-Debug-Note: Legacy cookie serialization demo\n',
    sandboxPreset: 'web-headers',
    hints: [
      { text: 'Look closely at the `club_role` cookie value inside `session_capture.http`.', cost: 0 },
      { text: 'Decode the Base64 value `Q1RGe25ldmVyX3RydXN0X2NsaWVudF9jb29raWVzfQ==`.', cost: 20 },
    ],
  },
  {
    categorySlug: 'web-exploitation',
    slug: 'login-bypass-audit',
    title: 'Login Bypass Audit',
    difficulty: 'Intermediate',
    points: 250,
    description: 'Review an isolated PHP authentication snippet where string concatenation caused a critical vulnerability, and extract the flag returned by the test case.',
    instructions: 'Download `auth_audit_lab.php`, trace the logic bug, and check the simulated test output using `cat /ctf/auth_audit_lab.php` in the terminal.',
    flag: 'CTF{parameterized_queries_stop_sqli}',
    downloadFileName: 'auth_audit_lab.php',
    downloadFileContent: "<?php\n// Vulnerable Legacy Code (Isolated Review Sample)\n// Input: $user = \"admin' --\";\n// Query: SELECT * FROM accounts WHERE username = 'admin' --' AND password = '...'\n// When fixed with PDO prepared statements, the flag below confirms remediation:\n$verified_remediation_flag = 'CTF{parameterized_queries_stop_sqli}';\n",
    sandboxPreset: 'web-sqli',
    hints: [
      { text: 'Download and open `auth_audit_lab.php` or inspect it with `cat /ctf/auth_audit_lab.php`.', cost: 0 },
      { text: "Notice why `' --` comments out the rest of the SQL query unless bound parameters are used.", cost: 25 },
    ],
  },

  // 4. Digital Forensics
  {
    categorySlug: 'digital-forensics',
    slug: 'suspicious-access-log',
    title: 'Suspicious Access Log',
    difficulty: 'Beginner',
    points: 150,
    description: 'A staging server captured anomalous HTTP requests late at night. One request leaked a Base64-encoded flag inside a query string.',
    instructions: 'Download `access_audit.log` (or search `/var/log/access_audit.log` in the terminal) to find the anomalous request and decode its flag.',
    flag: 'CTF{forensic_log_investigator}',
    downloadFileName: 'access_audit.log',
    downloadFileContent: '10.10.1.12 - - [24/Nov/2026:01:02:11] "GET /index.php HTTP/1.1" 200 1842\n10.10.1.15 - - [24/Nov/2026:01:05:44] "GET /academy.php HTTP/1.1" 200 2210\n203.0.113.99 - - [24/Nov/2026:03:19:02] "GET /export?token=Q1RGe2ZvcmVuc2ljX2xvZ19pbnZlc3RpZ2F0b3J9 HTTP/1.1" 403 512\n10.10.1.12 - - [24/Nov/2026:03:22:08] "GET /leaderboard.php HTTP/1.1" 200 1988\n',
    sandboxPreset: 'forensics-logs',
    hints: [
      { text: 'Look for external IP `203.0.113.99` requesting `/export?token=...`.', cost: 0 },
      { text: 'Base64-decode `Q1RGe2ZvcmVuc2ljX2xvZ19pbnZlc3RpZ2F0b3J9`.', cost: 20 },
    ],
  },
  {
    categorySlug: 'digital-forensics',
    slug: 'photo-metadata-leak',
    title: 'Photo Metadata Leak',
    difficulty: 'Intermediate',
    points: 200,
    description: 'An investigator extracted EXIF metadata from a public event photo. Hidden inside one of the EXIF tags is a leftover staging flag.',
    instructions: 'Download `campus_camera_exif.txt` and review all EXIF fields carefully.',
    flag: 'CTF{exif_gps_never_lies}',
    downloadFileName: 'campus_camera_exif.txt',
    downloadFileContent: 'File Name           : hack4gov_banner.jpg\nCamera Model Name   : Canon EOS R10\nSoftware            : GIMP 2.10.36\nArtist              : CyberTech Media Team\nGPS Latitude        : 14 deg 35\' 42.00" N\nGPS Longitude       : 120 deg 59\' 3.00" E\nUser Comment        : Q1RGe2V4aWZfZ3BzX25ldmVyX2xpZXN9\n',
    sandboxPreset: 'forensics-exif',
    hints: [
      { text: 'Check the `User Comment` tag inside `campus_camera_exif.txt`.', cost: 0 },
      { text: 'Decode the Base64 comment string using `base64 -d`.', cost: 25 },
    ],
  },

  // 5. Networking
  {
    categorySlug: 'networking',
    slug: 'open-port-scan',
    title: 'Open Port Scan',
    difficulty: 'Beginner',
    points: 125,
    description: 'During an authorized network audit of `10.10.20.5`, an unexpected non-standard service port was left open with a diagnostic banner.',
    instructions: 'Run `nmap 10.10.20.5` in the Challenge Terminal and inspect the unusual open port service banner.',
    flag: 'CTF{port_31337_service_found}',
    sandboxPreset: 'net-nmap',
    hints: [
      { text: 'Run `nmap 10.10.20.5` in the terminal to discover open ports.', cost: 0 },
      { text: 'Connect or inspect the banner on port 31337 using `nc 10.10.20.5 31337`.', cost: 20 },
    ],
  },
  {
    categorySlug: 'networking',
    slug: 'dns-zone-clue',
    title: 'DNS Zone Clue',
    difficulty: 'Intermediate',
    points: 200,
    description: 'A practice challenge domain `ctf-lab.bcci.local` stores an administrative verification token inside its DNS TXT record.',
    instructions: 'Query the TXT record for `ctf-lab.bcci.local` in the Challenge Terminal using `dig`.',
    flag: 'CTF{dns_txt_records_revealed}',
    sandboxPreset: 'net-dns',
    hints: [
      { text: 'Use `dig ctf-lab.bcci.local TXT` in the terminal.', cost: 0 },
    ],
  },

  // 6. Linux
  {
    categorySlug: 'linux',
    slug: 'permission-denied-dotfile',
    title: 'Hidden Dotfile',
    difficulty: 'Beginner',
    points: 100,
    description: 'A student backed up a secret file in `/home/student/vault`, but a standard `ls` command appears empty!',
    instructions: 'Navigate or list hidden files inside `/home/student/vault` using the Linux flag for hidden files, then read the file.',
    flag: 'CTF{hidden_dotfiles_exposed}',
    sandboxPreset: 'linux-dotfiles',
    hints: [
      { text: 'Files starting with `.` are hidden from plain `ls`. Use `ls -la /home/student/vault`.', cost: 0 },
      { text: 'Read the hidden file with `cat /home/student/vault/.vault_flag`.', cost: 15 },
    ],
  },
  {
    categorySlug: 'linux',
    slug: 'log-grep-hunt',
    title: 'Log Grep Hunt',
    difficulty: 'Intermediate',
    points: 200,
    description: 'A noisy authentication log `/var/log/auth.log` contains hundreds of decoy entries, plus one line tagged with `CYBERTECH_FLAG`.',
    instructions: 'Use `grep` on `/var/log/auth.log` in the Challenge Terminal to filter out the noise and find the flag.',
    flag: 'CTF{linux_grep_fu_champion}',
    sandboxPreset: 'linux-grep',
    hints: [
      { text: 'Try `grep CYBERTECH_FLAG /var/log/auth.log`.', cost: 0 },
    ],
  },

  // 7. Reverse Engineering
  {
    categorySlug: 'reverse-engineering',
    slug: 'python-gatekeeper',
    title: 'Python Gatekeeper',
    difficulty: 'Beginner',
    points: 150,
    description: 'We recovered a small Python license-checking script `gatekeeper.py`. Instead of guessing the password, reverse the character offsets in code.',
    instructions: 'Download `gatekeeper.py` and trace the `expected` ASCII array (each integer shifted by +2) back into characters.',
    flag: 'CTF{static_analysis_unlocked}',
    downloadFileName: 'gatekeeper.py',
    downloadFileContent: "# CyberTech Reverse Engineering Challenge 1\n# Each character in the flag had +2 added to its ASCII code:\nexpected = [69, 86, 72, 125, 117, 118, 99, 118, 107, 101, 97, 99, 112, 99, 110, 123, 117, 107, 117, 97, 119, 112, 110, 113, 101, 109, 103, 102, 127]\n\ndef check(user_input):\n    if len(user_input) != len(expected):\n        return False\n    return all(ord(c) + 2 == expected[i] for i, c in enumerate(user_input))\n",
    sandboxPreset: 're-python',
    hints: [
      { text: 'Subtract 2 from every number in `expected`: 69-2 = 67 ("C"), 86-2 = 84 ("T"), 72-2 = 70 ("F").', cost: 0 },
      { text: 'In the terminal, run `rev_shift -2 69,86,72,125,117,118,99,118,107,101,97,99,112,99,110,123,117,107,117,97,119,112,110,113,101,109,103,102,127` to verify.', cost: 25 },
    ],
  },
  {
    categorySlug: 'reverse-engineering',
    slug: 'assembly-password-check',
    title: 'Assembly Trace Check',
    difficulty: 'Intermediate',
    points: 300,
    description: 'Analyze a simplified x86 assembly-style instruction trace `check_pin.asm` that constructs a flag token by XORing bytes with `0x20`.',
    instructions: 'Download `check_pin.asm` and XOR each hex byte in the target constant array with `0x20` to reconstruct the inner flag string.',
    flag: 'CTF{reverse_engineering_101}',
    downloadFileName: 'check_pin.asm',
    downloadFileContent: "; Simplified Pseudocode Trace - CyberTech RE Lab\n; Compare input inner text against XOR(0x20) of bytes:\n; 52 45 56 45 52 53 45 7f 45 4e 47 49 4e 45 45 52 49 4e 47 7f 11 10 11\n; Note: ASCII uppercase/lowercase flips on XOR 0x20! Wrap result in CTF{...}\n",
    sandboxPreset: 're-asm',
    hints: [
      { text: 'XORing ASCII uppercase letters with `0x20` turns them lowercase (`0x52 ^ 0x20 = 0x72 = r`), and `0x7f ^ 0x20 = 0x5f = _`.', cost: 0 },
      { text: 'Run `xor20 524556455253457f454e47494e454552494e477f111011` in the terminal.', cost: 35 },
    ],
  },

  // 8. OSINT
  {
    categorySlug: 'osint',
    slug: 'campus-event-recon',
    title: 'Campus Event Recon',
    difficulty: 'Beginner',
    points: 125,
    description: 'An archived CyberTech Society bulletin left clues about our Hack4Gov preparation room and founding motto.',
    instructions: 'Download `bcci_bulletin_archive.txt`, extract the three uppercase keywords in the notice, join them with underscores in lowercase, and submit as `CTF{word1_word2_word3}`.',
    flag: 'CTF{osint_open_sleuth}',
    downloadFileName: 'bcci_bulletin_archive.txt',
    downloadFileContent: 'CYBERTECH SOCIETY - BCCI ARCHIVE NOTICE #04\nDate: October 2026\nLocation: Computer Lab 3B\nNote from Coordinator: Remember the three pillars of public intelligence gathering:\nAlways start with OSINT, verify OPEN sources, and think like a SLEUTH.\nFormat: CTF{first_second_third} in lowercase.\n',
    hints: [
      { text: 'Look for the three capitalized words in the coordinator’s note.', cost: 0 },
    ],
  },
  {
    categorySlug: 'osint',
    slug: 'developer-commit-slip',
    title: 'Developer Commit Slip',
    difficulty: 'Intermediate',
    points: 225,
    description: 'A student developer accidentally committed a staging flag in an early Git revision before deleting it in the next commit.',
    instructions: 'Download `git_log_export.txt`, read the diff history across commits, and recover the flag that was removed in commit `a91f4c2`.',
    flag: 'CTF{git_history_remembers_all}',
    downloadFileName: 'git_log_export.txt',
    downloadFileContent: 'commit a91f4c2 (HEAD -> main)\nAuthor: dev.student <dev@bcci.local>\nMessage: Remove accidental test secret\n- $STAGING_FLAG = "CTF{git_history_remembers_all}";\n+ $STAGING_FLAG = getenv("STAGING_FLAG");\n\ncommit 72b10e1\nAuthor: dev.student <dev@bcci.local>\nMessage: Initial config setup\n',
    hints: [
      { text: 'Lines prefixed with `-` in a unified diff show what was deleted in the commit.', cost: 0 },
    ],
  },

  // 9. Steganography
  {
    categorySlug: 'steganography',
    slug: 'trailing-bytes-note',
    title: 'Hidden in Plain Sight',
    difficulty: 'Beginner',
    points: 150,
    description: 'A short announcement file looks ordinary at first glance, but reading the first letter of each line spells out the secret flag.',
    instructions: 'Download `cover_note.txt` and read the acrostic formed by the first character of every line inside the body (wrap inner word in `CTF{...}`).',
    flag: 'CTF{plain_sight}',
    downloadFileName: 'cover_note.txt',
    downloadFileContent: 'CyberTech Acrostic Memo (read first letter of each line below, underscore after line 5):\n\nPackets travel across routers every millisecond.\nLogs record every connection made at midnight.\nAlways verify checksums before opening downloads.\nInspect headers carefully during triage.\nNever reuse passwords across campus accounts.\n\nSecurity starts with small daily habits.\nIntegrity keeps data trustworthy.\nGroup permissions isolate shared files.\nHashes verify downloaded packages.\nTesting ethically protects the community.\n',
    hints: [
      { text: 'First 5 lines: P-L-A-I-N. Next 5 lines: S-I-G-H-T. Combine in lowercase with an underscore.', cost: 0 },
    ],
  },
  {
    categorySlug: 'steganography',
    slug: 'binary-whitespace-channel',
    title: 'Binary Whitespace Channel',
    difficulty: 'Intermediate',
    points: 250,
    description: 'An intercepted message encodes a 5-letter flag suffix using binary bits (`0` = `.` and `1` = `-`) disguised as signal pulses.',
    instructions: 'Download `pulse_channel.txt`, convert each 8-bit group from `.` (0) and `-` (1) into ASCII characters, and submit as `CTF{...}`.',
    flag: 'CTF{stego}',
    downloadFileName: 'pulse_channel.txt',
    downloadFileContent: 'Intercepted Pulse Stream (. = 0, - = 1):\n.--.-.--  (01110011)\n---..---  Wait—use the explicit bit groups below:\nGroup 1: .---..-- (01110011)\nGroup 2: .---.-.. (01110100)\nGroup 3: .--..-.- (01100101)\nGroup 4: .--..--- (01100111)\nGroup 5: .--..... (wait: check 01101111 = o)\n\nVerified 8-bit binary stream:\n01110011 01110100 01100101 01100111 01101111\nWrap the 5 decoded ASCII letters inside CTF{...}.\n',
    hints: [
      { text: '01110011 in binary = 115 decimal = ASCII `s`.', cost: 0 },
      { text: 'Use `bindecode 01110011 01110100 01100101 01100111 01101111` in the Challenge Terminal.', cost: 25 },
    ],
  },
];

export const SEED_EVENTS = [
  {
    title: 'Hack4Gov Regional Qualifier Practice CTF',
    slug: 'hack4gov-practice-2026',
    description: 'Official CyberTech Society – BCCI mock competition designed to prepare student teams for DICT Hack4Gov regional challenges across Web, Crypto, Forensics, and OSINT.',
    startDate: '2026-12-05T09:00:00',
    endDate: '2026-12-06T18:00:00',
    status: 'upcoming',
    location: 'BCCI Computer Laboratory 2 & Online Arena',
  },
  {
    title: 'CyberTech Freshers Cyber Cup',
    slug: 'freshers-cyber-cup-2026',
    description: 'Beginner-friendly Capture The Flag sprint for 1st and 2nd year IT and Computer Science students covering Linux CLI, Base64, and network fundamentals.',
    startDate: '2026-11-20T08:00:00',
    endDate: '2026-12-20T23:59:00',
    status: 'active',
    location: 'CyberTech Academy Online Arena',
  },
  {
    title: 'October Forensics & Log Triage Bootcamp',
    slug: 'october-forensics-bootcamp',
    description: 'Weekend hands-on workshop focusing on Apache access logs, EXIF extraction, and evidence handling.',
    startDate: '2026-10-12T13:00:00',
    endDate: '2026-10-12T17:00:00',
    status: 'completed',
    location: 'BCCI Auditorium',
  },
];

export const SEED_ANNOUNCEMENTS = [
  {
    title: 'Hack4Gov 2026 Training Cohort Registration Open',
    category: 'Competition',
    content: 'CyberTech Society – BCCI is forming our official Hack4Gov training squad. Complete Modules 1–5 in CyberTech Academy and solve at least 6 beginner CTF challenges to qualify for team tryouts on December 5.',
    pinned: 1,
  },
  {
    title: 'Weekly Friday Terminal & Linux Clinic',
    category: 'Schedule',
    content: 'Join our student mentors every Friday from 3:00 PM to 5:00 PM at Computer Lab 3B for hands-on Linux CLI, Wireshark packet inspection, and Python scripting drills.',
    pinned: 1,
  },
  {
    title: 'New Web Security & OWASP Top 10 Labs Published',
    category: 'Academy',
    content: 'Module 4 (Web Security) now includes updated exercises on Prepared Statements vs SQL Injection, Output Escaping against XSS, and CSRF token verification.',
    pinned: 0,
  },
  {
    title: 'Responsible Disclosure & Lab Ethics Reminder',
    category: 'Policy',
    content: 'All security testing techniques taught in CyberTech Academy must be practiced exclusively inside the provided sandbox and CTF arena. Unauthorized testing against external systems is strictly prohibited.',
    pinned: 0,
  },
];
