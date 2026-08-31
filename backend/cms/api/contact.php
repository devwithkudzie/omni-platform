<?php
// cms/api/contact.php

error_reporting(E_ALL);
ini_set('display_errors', 0); // prevent HTML error output
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../error.log');

require_once __DIR__ . '/../config.php'; // contains TENANT_ID, CLIENT_ID, CLIENT_SECRET

header('Content-Type: application/json; charset=utf-8');

/*
 ─────────────────────────────────────────────
 CORS
─────────────────────────────────────────────
*/
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://omnicontact.biz',
    'https://www.omnicontact.biz',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/*
 ─────────────────────────────────────────────
 INPUT VALIDATION
─────────────────────────────────────────────
*/
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

$name    = trim($data['name'] ?? '');
$email   = trim($data['email'] ?? '');
$company = trim($data['company'] ?? '');
$message = trim($data['message'] ?? '');
$region  = trim($data['region'] ?? 'zw');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and message are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

// Route to region-specific inbox
$toAddress = ($region === 'za') ? 'info@omnicontact.biz' : 'info@omnicontact.biz';
$regionLabel = ($region === 'za') ? 'South Africa' : 'Zimbabwe';

/*
 ─────────────────────────────────────────────
 EMAIL CONTENT
─────────────────────────────────────────────
*/
$subject = "OmniContact Website – New Enquiry ({$regionLabel})";

$body = "
<h3>New Website Enquiry — {$regionLabel}</h3>
<p><strong>Name:</strong> {$name}</p>
<p><strong>Email:</strong> {$email}</p>
<p><strong>Company:</strong> " . ($company !== '' ? htmlspecialchars($company) : '[not provided]') . "</p>
<p><strong>Region:</strong> {$regionLabel}</p>
<hr>
<p><strong>Message:</strong></p>
<p>" . nl2br(htmlspecialchars($message)) . "</p>
<hr>
<p style='font-size:12px;color:#888'>
IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "<br>
User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "
</p>
";

/*
 ─────────────────────────────────────────────
 GRAPH API SEND
─────────────────────────────────────────────
*/
function getGraphToken() {
    $url = "https://login.microsoftonline.com/" . TENANT_ID . "/oauth2/v2.0/token";

    $postFields = [
        'client_id'     => CLIENT_ID,
        'scope'         => 'https://graph.microsoft.com/.default',
        'client_secret' => CLIENT_SECRET,
        'grant_type'    => 'client_credentials'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

$token = getGraphToken();
if (!$token) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to acquire Graph token']);
    exit;
}

$emailPayload = [
    "message" => [
        "subject" => $subject,
        "body" => [
            "contentType" => "HTML",
            "content" => $body
        ],
        "from" => [
            "emailAddress" => ["address" => SERVICE_ACCOUNT]
        ],
        "toRecipients" => [
            ["emailAddress" => ["address" => $toAddress]],
        ],
        "ccRecipients" => [
            ["emailAddress" => ["address" => "web@omnicontact.biz"]],
            ["emailAddress" => ["address" => "kudzai.mukungu@omnicontact.biz"]],
        ],
        "replyTo" => [
            ["emailAddress" => [
                "address" => $email,
                "name" => $name
            ]]
        ]
    ],
    "saveToSentItems" => true
];

$ch = curl_init("https://graph.microsoft.com/v1.0/users/" . SERVICE_ACCOUNT . "/sendMail");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailPayload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(['status' => 'ok', 'email_sent' => true]);
} else {
    echo json_encode([
        'status' => 'error',
        'email_sent' => false,
        'response' => $response
    ]);
}
