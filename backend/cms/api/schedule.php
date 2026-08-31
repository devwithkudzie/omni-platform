<?php
// cms/api/schedule.php

error_reporting(E_ALL);
ini_set('display_errors', 0); // prevent HTML error output
ini_set('log_errors', 1);
$errorLogPath = __DIR__ . '/../error.log';
ini_set('error_log', $errorLogPath);

error_log("=== Schedule.php Request Started ===");

require_once __DIR__ . '/../config.php'; // contains TENANT_ID, CLIENT_ID, CLIENT_SECRET

error_log("Config loaded. SERVICE_ACCOUNT: " . (defined('SERVICE_ACCOUNT') ? SERVICE_ACCOUNT : 'NOT DEFINED'));

header('Content-Type: application/json; charset=utf-8');

/*
 ─────────────────────────────────────────────
 CORS
─────────────────────────────────────────────
*/
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
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

$firstName   = trim($data['firstName'] ?? '');
$lastName    = trim($data['lastName'] ?? '');
$email       = trim($data['email'] ?? '');
$phone       = trim($data['phone'] ?? '');
$company     = trim($data['company'] ?? '');
$jobTitle    = trim($data['jobTitle'] ?? '');
$organization = trim($data['organization'] ?? '');
$service     = trim($data['service'] ?? '');
$industry    = trim($data['industry'] ?? '');
$teamSize    = trim($data['teamSize'] ?? '');
$supportModel = trim($data['supportModel'] ?? '');
$challenge   = trim($data['challenge'] ?? '');
$timeline    = trim($data['timeline'] ?? '');
$country     = trim($data['country'] ?? '');
$date        = trim($data['date'] ?? '');
$time        = trim($data['time'] ?? '');
$timezone    = trim($data['timezone'] ?? '');
$sourcePage  = trim($data['sourcePage'] ?? '');
$submittedAt = trim($data['submittedAt'] ?? '');

if ($firstName === '' || $lastName === '' || $email === '' || $phone === '' || $date === '' || $time === '') {
    http_response_code(400);
    echo json_encode(['error' => 'First name, last name, email, phone, date, and time are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

if ($company === '' && $organization !== '' && preg_match('/Organization:\s*([^|]+)/', $organization, $matches)) {
    $company = trim($matches[1]);
}

$receivedAtUtc = gmdate('Y-m-d H:i:s \\U\\T\\C');
$receivedAtSast = (new DateTime('now', new DateTimeZone('Africa/Johannesburg')))->format('Y-m-d H:i:s T');
$displayTime24 = $time;

try {
    $parsedTime = DateTime::createFromFormat('H:i', $time) ?: DateTime::createFromFormat('H:i:s', $time);
    if ($parsedTime instanceof DateTime) {
        $displayTime24 = $parsedTime->format('H:i');
    }
} catch (Exception $e) {
    error_log("Time formatting error: " . $e->getMessage());
}

function esc($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

/*
 ─────────────────────────────────────────────
 EMAIL CONTENT
─────────────────────────────────────────────
*/
$subject = "OmniContact – Discovery Call Scheduled";

$body = "
<h3>Discovery Call Scheduled</h3>
<p>Dear {$firstName} {$lastName},</p>
<p>Your discovery call with OmniContact has been successfully scheduled. Here are the details:</p>
<hr>
<p><strong>Personal Information:</strong></p>
<ul>
  <li><strong>Name:</strong> {$firstName} {$lastName}</li>
  <li><strong>Email:</strong> {$email}</li>
  <li><strong>Phone:</strong> {$phone}</li>
  <li><strong>Organization:</strong> " . ($organization !== '' ? htmlspecialchars($organization) : '[not provided]') . "</li>
</ul>
<hr>
<p><strong>Call Details:</strong></p>
<ul>
  <li><strong>Service:</strong> " . ($service !== '' ? htmlspecialchars($service) : '[not specified]') . "</li>
  <li><strong>Country:</strong> " . ($country !== '' ? htmlspecialchars($country) : '[not specified]') . "</li>
  <li><strong>Date:</strong> {$date}</li>
  <li><strong>Time:</strong> {$time}</li>
  <li><strong>Timezone:</strong> " . ($timezone !== '' ? htmlspecialchars($timezone) : 'UTC') . "</li>
</ul>
<hr>
<p>We look forward to discussing how we can help your organization achieve its goals.</p>
<p>If you need to reschedule or have any questions, please don't hesitate to contact us.</p>
<hr>
<p>Best regards,<br><strong>OmniContact Team</strong></p>
<p style='font-size:12px;color:#888'>
IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "<br>
User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "
</p>
";

// Override with an ops-focused internal alert format.
$subject = "New Discovery Call Request | {$firstName} {$lastName} | " .
    ($company !== '' ? $company : 'No Company') .
    " | {$date} {$displayTime24} " . ($timezone !== '' ? $timezone : 'UTC');

$body = "
<h2>New Discovery Call Request</h2>
<p><strong>Action:</strong> Reply to the lead and assign an owner within one business day.</p>
<hr>
<p><strong>Lead Contact</strong></p>
<ul>
  <li><strong>Name:</strong> " . esc("{$firstName} {$lastName}") . "</li>
  <li><strong>Email:</strong> " . esc($email) . "</li>
  <li><strong>Phone:</strong> " . esc($phone) . "</li>
  <li><strong>Country:</strong> " . ($country !== '' ? esc($country) : '[not provided]') . "</li>
</ul>
<hr>
<p><strong>Business Qualification</strong></p>
<ul>
  <li><strong>Company:</strong> " . ($company !== '' ? esc($company) : '[not provided]') . "</li>
  <li><strong>Job title:</strong> " . ($jobTitle !== '' ? esc($jobTitle) : '[not provided]') . "</li>
  <li><strong>Industry:</strong> " . ($industry !== '' ? esc($industry) : '[not provided]') . "</li>
  <li><strong>Team size:</strong> " . ($teamSize !== '' ? esc($teamSize) : '[not provided]') . "</li>
  <li><strong>Support model:</strong> " . ($supportModel !== '' ? esc($supportModel) : '[not provided]') . "</li>
  <li><strong>Biggest challenge:</strong> " . ($challenge !== '' ? esc($challenge) : '[not provided]') . "</li>
  <li><strong>Timeline:</strong> " . ($timeline !== '' ? esc($timeline) : '[not provided]') . "</li>
</ul>
<hr>
<p><strong>Requested Session</strong></p>
<ul>
  <li><strong>Service:</strong> " . ($service !== '' ? esc($service) : '[not specified]') . "</li>
  <li><strong>Date:</strong> " . esc($date) . "</li>
  <li><strong>Time (24-hour):</strong> " . esc($displayTime24) . "</li>
  <li><strong>Timezone:</strong> " . ($timezone !== '' ? esc($timezone) : 'UTC') . "</li>
</ul>
<hr>
<p><strong>Submission Metadata</strong></p>
<ul>
  <li><strong>Source page:</strong> " . ($sourcePage !== '' ? esc($sourcePage) : '[not provided]') . "</li>
  <li><strong>Submitted at (client):</strong> " . ($submittedAt !== '' ? esc($submittedAt) : '[not provided]') . "</li>
  <li><strong>Received at (server UTC):</strong> " . esc($receivedAtUtc) . "</li>
  <li><strong>Received at (server SAST):</strong> " . esc($receivedAtSast) . "</li>
</ul>
<hr>
<p><strong>Raw organization summary</strong></p>
<ul>
  <li>" . ($organization !== '' ? esc($organization) : '[not provided]') . "</li>
</ul>
<hr>
<p style='font-size:12px;color:#888'>
IP: " . esc($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "<br>
User Agent: " . esc($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "
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
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("Token Request cURL Error: $curlError");
        return null;
    }

    error_log("Token Response: " . substr($response, 0, 200)); // Log first 200 chars
    $data = json_decode($response, true);
    $token = $data['access_token'] ?? null;
    error_log("Token acquired: " . ($token ? "YES" : "NO - " . ($data['error'] ?? 'unknown error')));
    return $token;
}

$token = getGraphToken();
error_log("Token in main flow: " . ($token ? "YES" : "NO"));
if (!$token) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to acquire Graph token']);
    exit;
}

// Email 1: Send to internal team
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
            ["emailAddress" => ["address" => "web@omnicontact.biz"]],
        ],
        "replyTo" => [
            ["emailAddress" => [
                "address" => $email,
                "name" => "$firstName $lastName"
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
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

error_log("Sending internal email to: web@omnicontact.biz");

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

error_log("Internal email - HTTP Code: $httpCode, cURL Error: $curlError");

if ($curlError || !($httpCode >= 200 && $httpCode < 300)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'email_sent' => false,
        'message' => 'Failed to send internal email'
    ]);
    exit;
}

// Email 2: Send confirmation to user
$userSubject = "Your Discovery Call Has Been Scheduled - OmniContact";
$userBody = "
<h2>Hi {$firstName},</h2>
<p>Thank you for scheduling a discovery call with OmniContact!</p>
<p>We've received your request and our team will contact you shortly to confirm the details.</p>
<hr>
<p><strong>Call Details:</strong></p>
<ul>
  <li><strong>Requested Date:</strong> {$date}</li>
  <li><strong>Requested Time (24-hour):</strong> {$displayTime24}</li>
  <li><strong>Timezone:</strong> " . ($timezone !== '' ? htmlspecialchars($timezone) : 'UTC') . "</li>
  <li><strong>Service Interest:</strong> " . ($service !== '' ? htmlspecialchars($service) : '[General Inquiry]') . "</li>
</ul>
<hr>
<p>If you need to make any changes before we contact you, please reply to this email.</p>
<p>Best regards,<br><strong>OmniContact Team</strong></p>
";

$userEmailPayload = [
    "message" => [
        "subject" => $userSubject,
        "body" => [
            "contentType" => "HTML",
            "content" => $userBody
        ],
        "from" => [
            "emailAddress" => ["address" => SERVICE_ACCOUNT]
        ],
        "toRecipients" => [
            ["emailAddress" => ["address" => $email, "name" => "$firstName $lastName"]],
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
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($userEmailPayload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

error_log("Sending confirmation email to user: $email");

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

error_log("User confirmation email - HTTP Code: $httpCode, cURL Error: $curlError");

/*
 ─────────────────────────────────────────────
 CALENDAR EVENT CREATION
─────────────────────────────────────────────
*/
function createOutlookCalendarEvent($token, $serviceAccount, $firstName, $lastName, $email, $date, $time, $timezone, $service, $organization) {
    try {
        // Combine date and time into ISO 8601 format
        $dateTime = $date . 'T' . $time . ':00';
        
        // Parse the date and create start/end times
        try {
            $dt = new DateTime($dateTime);
            if ($timezone && $timezone !== 'UTC') {
                $dt->setTimezone(new DateTimeZone($timezone));
            }
        } catch (Exception $e) {
            error_log("DateTime parsing error: " . $e->getMessage());
            $dt = new DateTime($dateTime);
        }
        
        $startTime = $dt->format('Y-m-d\TH:i:s');
        $dt->modify('+30 minutes'); // 30-minute meeting
        $endTime = $dt->format('Y-m-d\TH:i:s');
        
        $eventPayload = [
            "subject" => "Discovery Call - $firstName $lastName",
            "body" => [
                "contentType" => "HTML",
                "content" => "
                    <p>Discovery Call with <strong>$firstName $lastName</strong> ($email)</p>
                    <p><strong>Organization:</strong> " . ($organization ?: 'N/A') . "</p>
                    <p><strong>Service Interest:</strong> " . htmlspecialchars($service) . "</p>
                    <p><strong>Timezone:</strong> " . ($timezone ?: 'UTC') . "</p>
                    <hr>
                    <p>Meeting details will be sent to the participant.</p>
                "
            ],
            "start" => [
                "dateTime" => $startTime,
                "timeZone" => $timezone ?: "UTC"
            ],
            "end" => [
                "dateTime" => $endTime,
                "timeZone" => $timezone ?: "UTC"
            ],
            "attendees" => [
                [
                    "emailAddress" => [
                        "address" => $email,
                        "name" => "$firstName $lastName"
                    ],
                    "type" => "required"
                ]
            ],
            "isReminderOn" => true,
            "reminderMinutesBeforeStart" => 15
        ];
        
        $encodedServiceAccount = rawurlencode($serviceAccount);
        $ch = curl_init("https://graph.microsoft.com/v1.0/users/{$encodedServiceAccount}/events");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $token",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($eventPayload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        error_log("Creating Outlook calendar event for: $email");
        
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        error_log("Calendar event creation - HTTP Code: $httpCode, cURL Error: $curlError, Response: " . substr($response, 0, 200));
        
        return [
            'success' => ($httpCode >= 200 && $httpCode < 300),
            'httpCode' => $httpCode,
            'error' => $curlError
        ];
    } catch (Exception $e) {
        error_log("Exception in createOutlookCalendarEvent: " . $e->getMessage());
        return [
            'success' => false,
            'httpCode' => 0,
            'error' => $e->getMessage()
        ];
    }
}

/*
 Generate ICS calendar file for email attachment
*/
function generateICSFile($firstName, $lastName, $email, $date, $time, $timezone, $service, $organization) {
    try {
        $dt = new DateTime($date . 'T' . $time . ':00');
        if ($timezone && $timezone !== 'UTC') {
            $dt->setTimezone(new DateTimeZone($timezone));
        }
    } catch (Exception $e) {
        error_log("DateTime parsing in ICS: " . $e->getMessage());
        $dt = new DateTime($date . 'T' . $time . ':00');
    }
    
    $startDateTime = $dt->format('Ymd\THis\Z');
    $dt->modify('+30 minutes');
    $endDateTime = $dt->format('Ymd\THis\Z');
    $now = date('Ymd\THis\Z');
    
    $ics = "BEGIN:VCALENDAR\r\n";
    $ics .= "VERSION:2.0\r\n";
    $ics .= "PRODID:-//OmniContact//Discovery Call//EN\r\n";
    $ics .= "CALSCALE:GREGORIAN\r\n";
    $ics .= "METHOD:REQUEST\r\n";
    $ics .= "BEGIN:VEVENT\r\n";
    $ics .= "UID:" . uniqid() . "@omnicontact.biz\r\n";
    $ics .= "DTSTAMP:$now\r\n";
    $ics .= "DTSTART:$startDateTime\r\n";
    $ics .= "DTEND:$endDateTime\r\n";
    $ics .= "SUMMARY:Discovery Call - OmniContact\r\n";
    $ics .= "DESCRIPTION:Your scheduled discovery call with OmniContact.\n";
    $ics .= "Organization: " . ($organization ?: 'N/A') . "\n";
    $ics .= "Service: " . htmlspecialchars($service) . "\r\n";
    $ics .= "LOCATION:Video Conference\r\n";
    $ics .= "ATTENDEE;CN=$firstName $lastName;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:$email\r\n";
    $ics .= "ORGANIZER;CN=OmniContact:mailto:forms@omnicontact.biz\r\n";
    $ics .= "END:VEVENT\r\n";
    $ics .= "END:VCALENDAR\r\n";
    
    return $ics;
}

// Create calendar event and prepare response
try {
    $calendarResult = createOutlookCalendarEvent($token, SERVICE_ACCOUNT, $firstName, $lastName, $email, $date, $time, $timezone, $service, $organization);
    error_log("Calendar event result: " . json_encode($calendarResult));

    // Generate ICS file (for users to import to their own calendar)
    $icsContent = generateICSFile($firstName, $lastName, $email, $date, $time, $timezone, $service, $organization);

    // Always return success response with calendar status
    $response = [
        'status' => 'ok',
        'email_sent' => ($httpCode >= 200 && $httpCode < 300),
        'calendar_created' => $calendarResult['success'],
        'message' => 'Discovery call scheduled successfully!'
    ];

    http_response_code(200);
    echo json_encode($response);
} catch (Exception $e) {
    error_log("Exception in main flow: " . $e->getMessage() . " - " . $e->getFile() . ":" . $e->getLine());
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'email_sent' => true,
        'calendar_created' => false,
        'message' => 'Discovery call notification sent. Calendar sync pending.'
    ]);
}
exit;
