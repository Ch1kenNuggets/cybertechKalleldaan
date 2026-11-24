# CyberTech Society – CyberTech Academy (XAMPP Setup Guide)

This directory contains the complete **plain PHP + MySQL + HTML5 + CSS3 + JavaScript** codebase ready for local deployment in **XAMPP** and **phpMyAdmin**.

## Running in XAMPP

1. **Copy Project Folder**
   Copy the entire `cybertech-academy/` folder into your XAMPP `htdocs` directory:
   - Windows: `C:\xampp\htdocs\cybertech-academy`
   - macOS/Linux: `/opt/lampp/htdocs/cybertech-academy`

2. **Start Apache & MySQL**
   Open the **XAMPP Control Panel** and start both **Apache** and **MySQL**.

3. **Import the MySQL Database**
   - Open `http://localhost/phpmyadmin` in your browser.
   - Click **Import** -> choose `cybertech-academy/database/cybertech_academy.sql` -> click **Go**.
   - This creates the `cybertech_academy` database, all 12 relational tables with foreign keys, all 7 Academy modules, 9 CTF challenge categories, starter lessons, challenges (including `Hidden Message`), hints, events, and announcements.

4. **Check Database Configuration**
   Verify `includes/config.php`:
   - `BASE_URL`: `/cybertech-academy`
   - `DB_HOST`: `127.0.0.1`
   - `DB_NAME`: `cybertech_academy`
   - `DB_USER`: `root`
   - `DB_PASS`: `""` (default XAMPP empty password)

5. **Open the Platform & Initialize First Admin**
   - Visit `http://localhost/cybertech-academy/`.
   - Go to **Register** (`register.php`). Because no administrator account exists yet, the first registration offers a one-time **Initialize as Administrator** checkbox to claim the officer admin account securely using `password_hash()`.
   - Register additional student accounts normally without checking the admin box.
