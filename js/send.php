<?php
header('Content-Type: application/json; charset=UTF-8');

// ── Nastavení ──────────────────────────────────────────────
$prijemce = 'konicek.matej@seznam.cz';
$predmet  = 'Nová zpráva z webu';
// ──────────────────────────────────────────────────────────

// Pouze POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Neplatná metoda']);
    exit;
}

// Honeypot anti-spam (skryté pole "website" musí být prázdné)
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true]); // Tváříme se, že to prošlo
    exit;
}

// Rate limiting — max 3 odeslání za minutu z jedné IP
session_start();
$now = time();
$_SESSION['sends'] = array_filter($_SESSION['sends'] ?? [], fn($t) => $now - $t < 60);
if (count($_SESSION['sends']) >= 3) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Příliš mnoho zpráv. Počkejte chvíli.']);
    exit;
}
$_SESSION['sends'][] = $now;

// Sanitace vstupů
$jmeno   = htmlspecialchars(trim($_POST['name']    ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$zprava  = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');

if (!$subject) $subject = '(bez předmětu)';

// Validace
if (!$jmeno || !$email || !$zprava) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Vyplňte všechna povinná pole.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Neplatná e-mailová adresa.']);
    exit;
}

if (mb_strlen($zprava) > 5000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Zpráva je příliš dlouhá.']);
    exit;
}

// Sestavení e-mailu
$telo  = "Nová zpráva z kontaktního formuláře\n";
$telo .= str_repeat('─', 40) . "\n\n";
$telo .= "Jméno:    $jmeno\n";
$telo .= "E-mail:   $email\n";
$telo .= "Předmět:  $subject\n\n";
$telo .= "Zpráva:\n$zprava\n\n";
$telo .= str_repeat('─', 40) . "\n";
$telo .= "Odesláno: " . date('d.m.Y H:i:s') . "\n";
$telo .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'neznámá') . "\n";

$plnyPredmet = $predmet . ($subject !== '(bez předmětu)' ? ': ' . $subject : '');

$hlavicky  = "From: =?UTF-8?B?" . base64_encode($jmeno) . "?= <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
$hlavicky .= "Reply-To: $email\r\n";
$hlavicky .= "MIME-Version: 1.0\r\n";
$hlavicky .= "Content-Type: text/plain; charset=UTF-8\r\n";
$hlavicky .= "Content-Transfer-Encoding: base64\r\n";

$odeslano = mail(
    $prijemce,
    "=?UTF-8?B?" . base64_encode($plnyPredmet) . "?=",
    base64_encode($telo),
    $hlavicky
);

if ($odeslano) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Zprávu se nepodařilo odeslat. Zkuste to znovu.']);
}
