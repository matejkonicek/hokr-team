<?php
header('Content-Type: application/json');

// Načtení JSON dat z těla požadavku
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Žádná data nebyla přijata.']);
    exit;
}

$to = "konicek.matej@seznam.cz";
$subject = "Nová zpráva z webu od: " . $data['name'];
$message = "Jméno: " . $data['name'] . "\n" .
           "Email: " . $data['email'] . "\n\n" .
           "Zpráva:\n" . $data['message'];

$headers = "From: web@vasedomena.cz";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Odeslání selhalo.']);
}
?>