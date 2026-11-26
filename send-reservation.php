<?php
// Fartak Beauty Clinic - booking receipt mailer (runs on the clinic's own host, no third party needed)
$TO        = 'fartakcenter@gmail.com';
$MAX_BYTES = 5 * 1024 * 1024;

$host = strtolower(preg_replace('/^www\./i', '', $_SERVER['HTTP_HOST'] ?? 'fartakclinic.ir'));
$host = preg_replace('/[^a-z0-9.\-]/', '', $host);
$FROM = 'noreply@' . $host; // ideally create this mailbox in your hosting panel for better inbox delivery

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($ok, $err = '') {
    echo json_encode(['ok' => $ok, 'error' => $err], JSON_UNESCAPED_UNICODE);
    exit;
}
function clean($s, $max = 120) {
    $s = preg_replace('/[\r\n\t]+/', ' ', trim((string)$s));
    return mb_substr($s, 0, $max, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); out(false, 'method'); }
if (!empty($_POST['website'])) { out(true); } // honeypot: bots fill this field

$name    = clean($_POST['name'] ?? '');
$phone   = preg_replace('/\D/', '', (string)($_POST['phone'] ?? ''));
$service = clean($_POST['service'] ?? '');
if ($name === '' || !preg_match('/^09\d{9}$/', $phone) || $service === '') { out(false, 'invalid'); }

if (!isset($_FILES['attachment']) || $_FILES['attachment']['error'] !== UPLOAD_ERR_OK) { out(false, 'file'); }
$f = $_FILES['attachment'];
if ($f['size'] > $MAX_BYTES) { out(false, 'size'); }

$mime = '';
if (function_exists('finfo_open')) {
    $fi = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($fi, $f['tmp_name']);
    finfo_close($fi);
} else {
    $info = @getimagesize($f['tmp_name']);
    $mime = $info ? $info['mime'] : '';
}
$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
if (!isset($allowed[$mime])) { out(false, 'type'); }
$ext = $allowed[$mime];

$boundary = '==fartak_' . md5(uniqid('', true));
$subject  = '=?UTF-8?B?' . base64_encode('درخواست رزرو نوبت جدید - کلینیک فرتاک') . '?=';
$text = "نام و نام خانوادگی: $name\r\n"
      . "شماره تماس: $phone\r\n"
      . "خدمت مورد نظر: $service\r\n"
      . "مبلغ بیعانه: 500,000 تومان\r\n"
      . "زمان ثبت: " . date('Y-m-d H:i') . "\r\n\r\n"
      . "اسکرین‌شات واریز بیعانه پیوست شده است.";

$headers = "From: Fartak Clinic <$FROM>\r\n"
         . "Reply-To: $FROM\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$message = "--$boundary\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "Content-Transfer-Encoding: base64\r\n\r\n"
         . chunk_split(base64_encode($text))
         . "--$boundary\r\n"
         . "Content-Type: $mime; name=\"receipt.$ext\"\r\n"
         . "Content-Transfer-Encoding: base64\r\n"
         . "Content-Disposition: attachment; filename=\"receipt.$ext\"\r\n\r\n"
         . chunk_split(base64_encode(file_get_contents($f['tmp_name'])))
         . "--$boundary--";

$sent = @mail($TO, $subject, $message, $headers, '-f' . $FROM);
if (!$sent) { $sent = @mail($TO, $subject, $message, $headers); }

out((bool)$sent, $sent ? '' : 'mail');
