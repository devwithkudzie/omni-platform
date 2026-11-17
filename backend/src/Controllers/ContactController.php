<?php

namespace OmniContact\Controllers;

use OmniContact\Http\Request;
use OmniContact\Http\Response;
use OmniContact\Support\MarketingHealthCheck;
use OmniContact\Support\ZohoCrm;

final class ContactController
{
    public static function submit(array $params, array $config): void
    {
        $payload = Request::json();

        $name = trim((string)($payload['name'] ?? ''));
        $email = trim((string)($payload['email'] ?? ''));
        $company = trim((string)($payload['company'] ?? ''));
        $message = trim((string)($payload['message'] ?? ''));
        $region = trim((string)($payload['region'] ?? 'zw'));
        $source = trim((string)($payload['source'] ?? 'Website'));

        if ($name === '' || $email === '' || $message === '') {
            Response::error('VALIDATION_ERROR', 'Name, email, and message are required.', 400);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('VALIDATION_ERROR', 'Invalid email address.', 400);
            return;
        }

        $isAssessment = str_contains(strtolower($source), 'assessment')
            || str_contains(strtolower($source), 'health check')
            || isset($payload['assessmentTitle']);
        $isMarketingHealth = MarketingHealthCheck::isHealthCheck($payload);
        $healthScore = null;

        // Authoritative scoring happens on the server before any mail/CRM side effects.
        if ($isMarketingHealth) {
            try {
                $healthScore = MarketingHealthCheck::scorePayload($payload);
            } catch (\InvalidArgumentException $error) {
                Response::error('VALIDATION_ERROR', $error->getMessage(), 400);
                return;
            }

            $payload['snapshot'] = [
                'ooi' => $healthScore['overallScore'],
                'level' => $healthScore['category'],
                'summary' => $healthScore['categoryMessage'],
                'band' => $healthScore['categoryMessage'],
                'dimensionScores' => $healthScore['pillarScores'],
            ];
            $payload['weakestAreas'] = $healthScore['weakest'];
            $payload['leadSourceTag'] = 'MaaS';
            if (trim((string)($payload['source'] ?? '')) === '') {
                $payload['source'] = 'MaaS Digital Marketing Health Check';
            }
        }

        $mailConfig = is_array($config['mail'] ?? null) ? $config['mail'] : [];
        $tenantId = trim((string)($mailConfig['tenant_id'] ?? ''));
        $clientId = trim((string)($mailConfig['client_id'] ?? ''));
        $clientSecret = trim((string)($mailConfig['client_secret'] ?? ''));
        $serviceAccount = trim((string)($mailConfig['service_account'] ?? ''));
        $mailConfigured = $tenantId !== '' && $clientId !== '' && $clientSecret !== '' && $serviceAccount !== '';

        // Health-check scoring can succeed without mail. Other contact forms still require mail.
        if (!$mailConfigured && !$isMarketingHealth) {
            Response::error('MAIL_CONFIG_MISSING', 'Contact mail service is not configured.', 500);
            return;
        }

        $regionLabel = $region === 'za' ? 'South Africa' : 'Zimbabwe';
        $contactConfig = is_array($config['contact'] ?? null) ? $config['contact'] : [];
        $defaultToAddress = 'info@omnicontact.biz';
        $toAddress = trim((string)($contactConfig[$region === 'za' ? 'to_za' : 'to_zw'] ?? '')) ?: $defaultToAddress;
        $ccAddresses = self::mailRecipients((string)($contactConfig['cc'] ?? ''));
        $safe = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

        if ($isAssessment) {
            $leadId = sprintf('OC-%s-%06d', date('Y'), random_int(0, 999999));
            $lowestDimension = self::lowestDimensionLabel($payload);
            if ($isMarketingHealth) {
                $scoreLabel = (string)($healthScore['overallScore'] ?? 'N/A');
                $subject = "New MaaS Health Check | {$scoreLabel}/100 | " . ($name !== '' ? $name : $email);
            } else {
                $subject = "New Assessment | {$lowestDimension} | " . ($name !== '' ? $name : $email);
            }
            $body = self::buildAssessmentBrief($payload, $leadId, $regionLabel, $safe);
        } else {
            $subject = "OmniContact Website - New Enquiry ({$regionLabel})";
            $body = "
            <h3>New Website Enquiry - {$safe($regionLabel)}</h3>
            <p><strong>Source:</strong> {$safe($source)}</p>
            <p><strong>Name:</strong> {$safe($name)}</p>
            <p><strong>Email:</strong> {$safe($email)}</p>
            <p><strong>Company:</strong> " . ($company !== '' ? $safe($company) : '[not provided]') . "</p>
            <p><strong>Region:</strong> {$safe($regionLabel)}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>" . nl2br($safe($message)) . "</p>
            <hr>
            <p style='font-size:12px;color:#888'>
                IP: " . $safe((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown')) . "<br>
                User Agent: " . $safe((string)($_SERVER['HTTP_USER_AGENT'] ?? 'unknown')) . "
            </p>
        ";
        }

        $emailSent = false;
        $prospectEmailSent = null;
        $zohoResult = null;
        $mailError = null;

        if ($mailConfigured) {
            $token = self::getGraphToken($tenantId, $clientId, $clientSecret);
            if (!$token) {
                if (!$isMarketingHealth) {
                    Response::error('MAIL_TOKEN_FAILED', 'Failed to acquire Graph token.', 500);
                    return;
                }
                $mailError = 'MAIL_TOKEN_FAILED';
            } else {
                $mailPayload = [
                    'message' => [
                        'subject' => $subject,
                        'body' => [
                            'contentType' => 'HTML',
                            'content' => $body,
                        ],
                        'from' => [
                            'emailAddress' => ['address' => $serviceAccount],
                        ],
                        'toRecipients' => [
                            ['emailAddress' => ['address' => $toAddress]],
                        ],
                        'ccRecipients' => array_map(
                            static fn (string $address): array => ['emailAddress' => ['address' => $address]],
                            $ccAddresses
                        ),
                        'replyTo' => [
                            ['emailAddress' => [
                                'address' => $email,
                                'name' => $name,
                            ]],
                        ],
                    ],
                    'saveToSentItems' => true,
                ];

                $result = self::postJson(
                    "https://graph.microsoft.com/v1.0/users/{$serviceAccount}/sendMail",
                    $mailPayload,
                    ["Authorization: Bearer {$token}", 'Content-Type: application/json']
                );

                if ($result['status'] >= 200 && $result['status'] < 300) {
                    $emailSent = true;
                    if ($isAssessment) {
                        $confirmationPayload = $isMarketingHealth && is_array($healthScore)
                            ? self::buildMarketingHealthResultsMail($serviceAccount, $email, $name, $healthScore, $safe)
                            : self::buildProspectConfirmationMail($serviceAccount, $email, $name, $safe);
                        $confirmationResult = self::postJson(
                            "https://graph.microsoft.com/v1.0/users/{$serviceAccount}/sendMail",
                            $confirmationPayload,
                            ["Authorization: Bearer {$token}", 'Content-Type: application/json']
                        );
                        $prospectEmailSent = $confirmationResult['status'] >= 200 && $confirmationResult['status'] < 300;
                    }

                } else {
                    $mailError = 'MAIL_SEND_FAILED';
                    error_log(sprintf(
                        '[mail] Graph sendMail failed (HTTP %d) from %s: %s',
                        $result['status'],
                        $serviceAccount,
                        substr((string)$result['body'], 0, 400)
                    ));
                }
            }
        } else {
            $mailError = 'MAIL_CONFIG_MISSING';
        }

        // The CRM lead is created whether or not the emails went out, so a mail
        // outage never loses a Health Check lead.
        if ($isMarketingHealth && is_array($healthScore)) {
            $zohoResult = ZohoCrm::upsertMarketingHealthLead($config, $payload, $healthScore);
        }

        if ($isMarketingHealth && is_array($healthScore)) {
            Response::json([
                'email_sent' => $emailSent,
                'prospect_email_sent' => $prospectEmailSent,
                'zoho' => $zohoResult,
                'mail_error' => $mailError,
                'health_check' => $healthScore,
            ]);
            return;
        }

        if ($emailSent) {
            Response::json([
                'email_sent' => true,
                'prospect_email_sent' => $prospectEmailSent,
                'zoho' => $zohoResult,
            ]);
            return;
        }

        Response::error($mailError ?: 'MAIL_SEND_FAILED', 'Unable to send the contact email.', $mailError === 'MAIL_CONFIG_MISSING' ? 500 : 502);
    }

    private static function mailRecipients(string $addresses): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/[,;]/', $addresses) ?: []),
            static fn (string $address): bool => $address !== ''
        ));
    }

    private static function lowestDimensionLabel(array $payload): string
    {
        $dimensions = $payload['snapshot']['dimensionScores'] ?? [];
        if (!is_array($dimensions) || count($dimensions) === 0) {
            return 'Opportunity Snapshot';
        }

        usort($dimensions, static function (array $a, array $b): int {
            return (int)($a['score'] ?? 100) <=> (int)($b['score'] ?? 100);
        });

        return (string)($dimensions[0]['label'] ?? 'Opportunity Snapshot');
    }

    private static function buildAssessmentBrief(array $payload, string $leadId, string $regionLabel, callable $safe): string
    {
        $name = trim((string)($payload['name'] ?? ''));
        $email = trim((string)($payload['email'] ?? ''));
        $company = trim((string)($payload['company'] ?? ''));
        $source = trim((string)($payload['source'] ?? 'Assessment'));
        $assessmentTitle = trim((string)($payload['assessmentTitle'] ?? 'Operational Opportunity Assessment'));
        $businessObjective = trim((string)($payload['businessObjective'] ?? 'Not specified'));
        $profile = is_array($payload['profile'] ?? null) ? $payload['profile'] : [];
        $snapshot = is_array($payload['snapshot'] ?? null) ? $payload['snapshot'] : [];
        $responses = is_array($payload['responses'] ?? null) ? $payload['responses'] : [];
        $priorities = is_array($payload['priorities'] ?? null) ? $payload['priorities'] : [];
        $meeting = is_array($payload['meeting'] ?? null) ? $payload['meeting'] : [];
        $recommendations = is_array($snapshot['recommendations'] ?? null) ? $snapshot['recommendations'] : [];
        $capabilities = is_array($snapshot['capabilities'] ?? null) ? $snapshot['capabilities'] : [];
        $dimensionScores = is_array($snapshot['dimensionScores'] ?? null) ? $snapshot['dimensionScores'] : [];

        $ooiScore = (string)($snapshot['ooi'] ?? 'N/A');
        $band = trim((string)($snapshot['band'] ?? 'Operational opportunity identified.'));
        $level = trim((string)($snapshot['level'] ?? 'Opportunity'));
        $headlineCompany = $company !== '' ? $company : ((string)($profile['businessName'] ?? '') ?: 'Company not provided');
        $challenge = trim((string)($payload['challenge'] ?? ''));
        $leadSourceTag = trim((string)($payload['leadSourceTag'] ?? ''));
        $isMarketingHealth = MarketingHealthCheck::isHealthCheck($payload);
        $summaryRows = self::renderStripedRows(array_values(array_filter([
            ['Lead ID', $leadId],
            ['Region', $regionLabel],
            ['Status', 'New Opportunity'],
            ['Source', $source],
            $leadSourceTag !== '' ? ['Lead tag', $leadSourceTag] : null,
            ['Maturity band', trim($level . ' — ' . $band)],
            ['Stated objective', $businessObjective],
            $challenge !== '' ? ['Marketing challenge', $challenge] : null,
            $isMarketingHealth ? ['Assessment type', 'Digital Marketing Health Check'] : null,
        ])), $safe);
        $respondentRows = self::renderStripedRows([
            ['Name', $name],
            ['Email', $email],
            ['Company', $company],
            ['Industry', (string)($profile['industry'] ?? '')],
            ['Company size', (string)($profile['companySize'] ?? '')],
            ['Country', (string)($profile['country'] ?? '')],
        ], $safe);
        $snapshotRows = self::renderOperationalSnapshotRows($responses, $safe);
        $priorityRecommendationRows = self::renderPriorityRecommendationRows($priorities, $recommendations, $capabilities, $safe);
        $talkingPoints = self::assessmentTalkingPoints($dimensionScores, $safe);
        $meetingBlock = '';
        if (!empty($meeting)) {
            $meetingBlock = "
                <tr><td class='pad-cell' style='padding:8px 48px 0;'>
                    <p style='margin:0 0 4px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Requested live session</p>
                </td></tr>
                <tr><td class='pad-cell' style='padding:8px 48px 24px;'>
                    " . self::renderStripedRows([
                        ['Booked date', (string)($meeting['bookedDate'] ?? '')],
                        ['Preferred platform', (string)($meeting['platform'] ?? '')],
                        ['Details', (string)($meeting['details'] ?? '')],
                    ], $safe) . "
                </td></tr>
            ";
        }

        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>Business Opportunity Brief</title>
                <style>
                    @media only screen and (max-width: 640px) {
                        .header-text-cell { display:block !important; width:100% !important; }
                        .header-badge-cell { display:block !important; width:100% !important; padding:16px 0 0 !important; text-align:left !important; }
                        .pad-cell { padding-left:24px !important; padding-right:24px !important; }
                        .brand-right { text-align:left !important; padding-top:8px !important; }
                    }
                </style>
            </head>
            <body style='margin:0; padding:0; background:#E9EBEF;'>
                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#E9EBEF;'>
                    <tr><td align='center' style='padding:32px 20px;'>
                        <!--[if mso]>
                        <table role='presentation' align='center' width='900'><tr><td>
                        <![endif]-->
                        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='width:100%; max-width:900px; margin:0 auto; background:#FFFFFF; border-radius:10px; overflow:hidden;'>
                            <tr><td style='background:#0B1E3D; padding:20px 48px;'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>
                                    <tr>
                                        <td valign='middle'>
                                            <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#FFFFFF; letter-spacing:0.3px;'>Omni<span style='color:#F5B825;'>Contact</span></p>
                                        </td>
                                        <td class='brand-right' valign='middle' align='right'>
                                            <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; color:#F5B825; letter-spacing:1px; text-transform:uppercase;'>Business Opportunity Brief</p>
                                        </td>
                                    </tr>
                                </table>
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:32px 48px 24px; border-bottom:1px solid #EEF0F3;'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>
                                    <tr>
                                        <td class='header-text-cell' valign='middle'>
                                            <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:1px; color:#9CA3AF; text-transform:uppercase;'>New business opportunity</p>
                                            <p style='margin:6px 0 0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:23px; font-weight:700; color:#0B1E3D; line-height:1.25;'>{$safe($name)} — {$safe($headlineCompany)}</p>
                                            <p style='margin:3px 0 0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:14px; color:#6B7280;'>{$safe($assessmentTitle)}</p>
                                        </td>
                                        <td class='header-badge-cell' width='110' valign='middle' align='center'>
                                            <table role='presentation' cellpadding='0' cellspacing='0' style='background:#0B1E3D; border-radius:8px;'>
                                                <tr><td style='padding:14px 18px; text-align:center;'>
                                                    <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:27px; font-weight:700; color:#F5B825; line-height:1;'>{$safe($ooiScore)}</p>
                                                    <p style='margin:3px 0 0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:11px; color:#FFFFFF; letter-spacing:0.5px;'>OOI SCORE</p>
                                                </td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:24px 48px 0;'>
                                <p style='margin:0 0 4px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Summary</p>
                            </td></tr>
                            <tr><td class='pad-cell' style='padding:8px 48px 24px;'>
                                {$summaryRows}
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:8px 48px 0;'>
                                <p style='margin:0 0 4px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Respondent</p>
                            </td></tr>
                            <tr><td class='pad-cell' style='padding:8px 48px 24px;'>
                                {$respondentRows}
                            </td></tr>

                            {$meetingBlock}

                            <tr><td class='pad-cell' style='padding:8px 48px 0;'>
                                <p style='margin:0 0 4px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Operational snapshot</p>
                            </td></tr>
                            <tr><td class='pad-cell' style='padding:8px 48px 24px;'>
                                {$snapshotRows}
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:8px 48px 0;'>
                                <p style='margin:0 0 4px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Priorities and recommendations</p>
                            </td></tr>
                            <tr><td class='pad-cell' style='padding:8px 48px 24px;'>
                                {$priorityRecommendationRows}
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:24px 48px; background:#FAFAF9; border-top:1px solid #EEF0F3;'>
                                <p style='margin:0 0 10px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#9CA3AF; text-transform:uppercase;'>Recommended next action</p>
                                <p style='margin:0 0 12px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:16px; color:#0B1E3D; font-weight:700;'>Schedule a 30-minute Strategy Session within 24 hours</p>
                                {$talkingPoints}
                            </td></tr>

                            <tr><td class='pad-cell' style='padding:20px 48px 28px;'>
                                <p style='margin:0 0 10px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:0.8px; color:#C7CAD1; text-transform:uppercase;'>CRM metadata</p>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#F5F6F8; border-radius:6px;'>
                                    <tr><td style='padding:12px 16px; font-family:\"SF Mono\", Consolas, monospace; font-size:12px; color:#6B7280; line-height:1.8;'>
                                        lead_id = {$safe($leadId)}<br>
                                        ooi_score = {$safe($ooiScore)}<br>
                                        band = {$safe($level)}<br>
                                        source = {$safe($source)}<br>
                                        assigned_to = Business Development<br>
                                        status = New Opportunity
                                    </td></tr>
                                </table>
                            </td></tr>

                            <tr><td style='background:#0B1E3D; padding:20px 48px;'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>
                                    <tr>
                                        <td valign='middle'>
                                            <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; color:#9CA3AF;'>OmniContact · Internal use only</p>
                                        </td>
                                        <td valign='middle' align='right'>
                                            <p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:12px; color:#9CA3AF;'>Generated from website assessment</p>
                                        </td>
                                    </tr>
                                </table>
                            </td></tr>
                        </table>
                        <!--[if mso]>
                        </td></tr></table>
                        <![endif]-->
                    </td></tr>
                </table>
            </body>
            </html>
        ";
    }

    private static function renderEmailFieldGrid(array $fields, callable $safe): string
    {
        $validFields = array_values(array_filter($fields, static function (array $field): bool {
            return trim((string)($field[1] ?? '')) !== '';
        }));

        if (count($validFields) === 0) {
            return '';
        }

        $rows = '';
        for ($index = 0; $index < count($validFields); $index += 2) {
            $first = $validFields[$index];
            $second = $validFields[$index + 1] ?? null;

            if ($second === null) {
                $rows .= '<tr>' . self::renderEmailFieldCell((string)$first[0], (string)$first[1], $safe, '100%', '0 0 14px 0', 2) . '</tr>';
                continue;
            }

            $rows .= '<tr>'
                . self::renderEmailFieldCell((string)$first[0], (string)$first[1], $safe, '50%', '0 8px 14px 0')
                . self::renderEmailFieldCell((string)$second[0], (string)$second[1], $safe, '50%', '0 0 14px 8px')
                . '</tr>';
        }

        return "<table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{$rows}</table>";
    }

    private static function renderStripedRows(array $rows, callable $safe): string
    {
        $validRows = array_values(array_filter($rows, static function (array $row): bool {
            return trim((string)($row[1] ?? '')) !== '';
        }));

        if (count($validRows) === 0) {
            return "<p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:14px; color:#374151;'>No information provided.</p>";
        }

        $html = '';
        foreach ($validRows as $index => $row) {
            $background = $index % 2 === 0 ? '#EEF1F8' : '#FFFFFF';
            $html .= "
                <tr style='background:{$background};'>
                    <td style='padding:11px 16px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:13px; color:#0B1E3D; font-weight:700; width:200px; vertical-align:top;'>{$safe((string)$row[0])}</td>
                    <td style='padding:11px 16px; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:14px; color:#374151; vertical-align:top; line-height:1.45;'>{$safe((string)$row[1])}</td>
                </tr>
            ";
        }

        return "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>{$html}</table>";
    }

    private static function renderOperationalSnapshotRows(array $responses, callable $safe): string
    {
        $rows = [];
        foreach ($responses as $response) {
            if (!is_array($response)) continue;
            $label = trim((string)($response['label'] ?? $response['dimension'] ?? 'Dimension'));
            $answer = trim((string)($response['answer'] ?? 'Not answered'));
            $score = array_key_exists('score', $response) ? ' · Score ' . (string)$response['score'] : '';
            if ($label !== '') {
                $rows[] = [$label, $answer . $score];
            }
        }

        return self::renderStripedRows($rows, $safe);
    }

    private static function renderPriorityRecommendationRows(array $priorities, array $recommendations, array $capabilities, callable $safe): string
    {
        $rows = [];
        foreach (array_values($priorities) as $index => $priority) {
            $priority = trim((string)$priority);
            if ($priority !== '') {
                $rows[] = ['Priority ' . ($index + 1), $priority];
            }
        }

        if (count($rows) === 0) {
            $rows[] = ['Priority', 'No priorities selected.'];
        }

        foreach (array_slice($recommendations, 0, 4) as $recommendation) {
            if (!is_array($recommendation)) continue;
            $title = trim((string)($recommendation['capability'] ?? $recommendation['title'] ?? 'Recommended solution'));
            $detail = trim((string)($recommendation['title'] ?? $recommendation['initiative'] ?? ''));
            if ($title !== '') {
                $rows[] = ['Recommended', $detail !== '' && $detail !== $title ? "{$title} — {$detail}" : $title];
            }
        }

        if (count($rows) === count($priorities) || (count($priorities) === 0 && count($rows) === 1)) {
            foreach ($capabilities as $capability) {
                $capability = trim((string)$capability);
                if ($capability !== '') {
                    $rows[] = ['Recommended', $capability];
                }
            }
        }

        return self::renderStripedRows($rows, $safe);
    }

    private static function renderEmailFieldCell(string $label, string $value, callable $safe, string $width, string $padding, int $colspan = 1): string
    {
        $colspanAttribute = $colspan > 1 ? " colspan='{$colspan}'" : '';
        return "<td width='{$width}'{$colspanAttribute} style='padding:{$padding}; vertical-align:top;'>"
            . "<p style='margin:0; font-size:11px; color:#9CA3AF;'>{$safe($label)}</p>"
            . "<p style='margin:2px 0 0; font-size:14px; color:#0B1E3D; font-weight:500; line-height:1.35;'>{$safe($value)}</p>"
            . '</td>';
    }

    private static function renderOperationalSnapshotGrid(array $responses, callable $safe): string
    {
        $items = [];
        foreach ($responses as $response) {
            if (!is_array($response)) continue;
            $label = trim((string)($response['label'] ?? $response['dimension'] ?? 'Dimension'));
            $answer = trim((string)($response['answer'] ?? 'Not answered'));
            $score = array_key_exists('score', $response) ? ' · Score ' . (string)$response['score'] : '';
            if ($label !== '') {
                $items[] = [$label, $answer . $score];
            }
        }

        if (count($items) === 0) {
            return "<p style='margin:0; font-size:13px; color:#6B7280;'>No operational snapshot responses were provided.</p>";
        }

        $rows = '';
        for ($index = 0; $index < count($items); $index += 2) {
            $first = $items[$index];
            $second = $items[$index + 1] ?? null;
            $rows .= '<tr>';
            $rows .= self::renderSnapshotCell($first[0], $first[1], $safe, $second === null ? '100%' : '50%', $second === null ? '0 0 6px 0' : '0 8px 10px 0', $second === null ? 2 : 1);
            if ($second !== null) {
                $rows .= self::renderSnapshotCell($second[0], $second[1], $safe, '50%', '0 0 10px 8px');
            }
            $rows .= '</tr>';
        }

        return "<table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{$rows}</table>";
    }

    private static function renderSnapshotCell(string $label, string $value, callable $safe, string $width, string $padding, int $colspan = 1): string
    {
        $colspanAttribute = $colspan > 1 ? " colspan='{$colspan}'" : '';
        return "<td width='{$width}'{$colspanAttribute} style='padding:{$padding}; vertical-align:top;'>"
            . "<p style='margin:0; font-size:13px; color:#0B1E3D; line-height:1.35;'><strong>{$safe($label)}</strong></p>"
            . "<p style='margin:2px 0 0; font-size:13px; color:#6B7280; line-height:1.4;'>{$safe($value)}</p>"
            . '</td>';
    }

    private static function renderNumberedParagraphs(array $items, callable $safe, string $fallback): string
    {
        if (count($items) === 0) {
            return "<p style='margin:0; font-size:13px; color:#0B1E3D; line-height:1.45;'>{$safe($fallback)}</p>";
        }

        $html = '';
        foreach (array_values($items) as $index => $item) {
            $margin = $index === count($items) - 1 ? '0' : '0 0 4px';
            $html .= "<p style='margin:{$margin}; font-size:13px; color:#0B1E3D; line-height:1.45;'>" . ($index + 1) . '. ' . $safe((string)$item) . '</p>';
        }
        return $html;
    }

    private static function renderRecommendationParagraphs(array $recommendations, array $capabilities, callable $safe): string
    {
        $items = [];
        foreach (array_slice($recommendations, 0, 4) as $recommendation) {
            if (!is_array($recommendation)) continue;
            $title = trim((string)($recommendation['title'] ?? $recommendation['capability'] ?? 'Recommended solution'));
            $capability = trim((string)($recommendation['capability'] ?? ''));
            if ($title !== '') {
                $items[] = [$title, $capability];
            }
        }

        if (count($items) === 0) {
            foreach ($capabilities as $capability) {
                $capability = trim((string)$capability);
                if ($capability !== '') {
                    $items[] = [$capability, ''];
                }
            }
        }

        if (count($items) === 0) {
            return "<p style='margin:0; font-size:13px; color:#0B1E3D; line-height:1.45;'>Review assessment responses with OmniContact.</p>";
        }

        $html = '';
        foreach ($items as $index => $item) {
            $margin = $index === count($items) - 1 ? '0' : '0 0 4px';
            $title = $safe($item[0]);
            $capability = trim($item[1]) !== '' ? ' — ' . $safe($item[1]) : '';
            $html .= "<p style='margin:{$margin}; font-size:13px; color:#0B1E3D; line-height:1.45;'><strong>{$title}</strong>{$capability}</p>";
        }
        return $html;
    }

    private static function assessmentTalkingPoints(array $dimensionScores, callable $safe): string
    {
        if (count($dimensionScores) === 0) {
            return "<p style='margin:0; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:14px; color:#4B5563; line-height:1.45;'>— Review the submitted business context and confirm the highest-priority operational opportunity.</p>";
        }

        usort($dimensionScores, static function (array $a, array $b): int {
            return (int)($a['score'] ?? 100) <=> (int)($b['score'] ?? 100);
        });

        $marketingTips = [
            'strategy' => 'Agree clear goals, an audience focus and a simple monthly marketing plan.',
            'visibility' => 'Improve discoverability with consistent channel presence and clearer targeting.',
            'leads' => 'Tighten lead capture, response times and CRM follow-up.',
            'content' => 'Create customer-focused content with clear calls to action.',
            'measurement' => 'Track leads and conversions monthly, then optimise from the numbers.',
        ];

        $templates = [
            'ai' => "Walk through practical AI use cases based on the current '{answer}' status.",
            'data' => "Show reporting and dashboard options because decision visibility is currently '{answer}'.",
            'workforce' => "Discuss workforce and staffing support given the current '{answer}' context.",
            'cx' => "Review service consistency and customer effort, currently described as '{answer}'.",
            'digital' => "Prioritize workflow digitization where the current state is '{answer}'.",
            'operations' => "Map handoffs and delays connected to the current '{answer}' operational pressure.",
        ];

        $items = '';
        $selectedDimensions = array_slice($dimensionScores, 0, 2);
        foreach ($selectedDimensions as $index => $dimension) {
            $id = (string)($dimension['id'] ?? '');
            $label = (string)($dimension['label'] ?? $id);
            $tip = trim((string)($dimension['tip'] ?? ''));
            $answer = (string)($dimension['answer'] ?? 'not clearly defined');
            if ($tip !== '') {
                $point = "{$label}: {$tip}";
            } elseif (isset($marketingTips[$id])) {
                $point = "{$label}: {$marketingTips[$id]}";
            } else {
                $template = $templates[$id] ?? "Review {$label} because it appears in the lowest-scoring dimensions.";
                $point = str_replace('{answer}', $answer, $template);
            }
            $margin = $index === count($selectedDimensions) - 1 ? '0' : '0 0 4px';
            $items .= "<p style='margin:{$margin}; font-family:\"Segoe UI\", Arial, Helvetica, sans-serif; font-size:14px; color:#4B5563; line-height:1.45;'>— " . $safe($point) . '</p>';
        }

        return $items;
    }

    private static function buildMarketingHealthResultsMail(
        string $serviceAccount,
        string $email,
        string $name,
        array $scored,
        callable $safe
    ): array {
        $firstName = trim(explode(' ', trim($name))[0] ?? '');
        $greeting = $firstName !== '' ? "Hi {$safe($firstName)}," : 'Hi,';
        $score = (string)($scored['overallScore'] ?? 'N/A');
        $category = $safe((string)($scored['category'] ?? ''));
        $message = $safe((string)($scored['categoryMessage'] ?? ''));

        $pillarHtml = '';
        foreach ($scored['pillarScores'] as $pillar) {
            if (!is_array($pillar)) {
                continue;
            }
            $pillarHtml .= '<li><strong>' . $safe((string)($pillar['label'] ?? 'Pillar')) . ':</strong> '
                . $safe((string)($pillar['score'] ?? '0')) . '/100</li>';
        }

        $weakestHtml = '';
        foreach ($scored['weakest'] as $pillar) {
            if (!is_array($pillar)) {
                continue;
            }
            $weakestHtml .= '<li><strong>' . $safe((string)($pillar['label'] ?? 'Area')) . ':</strong> '
                . $safe((string)($pillar['tip'] ?? '')) . '</li>';
        }

        $body = "
            <p>{$greeting}</p>
            <p>Thank you for completing OmniContact’s Digital Marketing Health Check.</p>
            <p><strong>Your Marketing Health Score: {$safe($score)}/100</strong> — {$category}</p>
            <p>{$message}</p>
            <p><strong>Pillar scores</strong></p>
            <ul>{$pillarHtml}</ul>
            <p><strong>Focus on these areas first</strong></p>
            <ul>{$weakestHtml}</ul>
            <p>Ready to turn these gaps into a practical growth plan? Reply to this email or book a free marketing consultation with our MaaS team.</p>
            <p>Kind regards,<br>OmniContact Marketing Team</p>
        ";

        return [
            'message' => [
                'subject' => "Your Digital Marketing Health Score: {$score}/100",
                'body' => [
                    'contentType' => 'HTML',
                    'content' => $body,
                ],
                'from' => [
                    'emailAddress' => ['address' => $serviceAccount],
                ],
                'toRecipients' => [
                    ['emailAddress' => ['address' => $email]],
                ],
            ],
            'saveToSentItems' => true,
        ];
    }

    private static function buildProspectConfirmationMail(string $serviceAccount, string $email, string $name, callable $safe): array
    {
        $firstName = trim(explode(' ', trim($name))[0] ?? '');
        $greeting = $firstName !== '' ? "Hi {$safe($firstName)}," : 'Hi,';
        $body = "
            <p>{$greeting}</p>
            <p>Your Operational Opportunity Assessment is being reviewed by OmniContact.</p>
            <ul>
                <li>We will review your operating context and stated priorities.</li>
                <li>We will use your responses to identify practical improvement opportunities.</li>
                <li>If you requested a live session, our team will confirm the meeting details.</li>
                <li>The next conversation will focus on useful recommendations, not a generic sales pitch.</li>
            </ul>
            <p>Thank you for starting the opportunity discovery process with OmniContact.</p>
        ";

        return [
            'message' => [
                'subject' => 'Your Operational Opportunity Assessment is being reviewed',
                'body' => [
                    'contentType' => 'HTML',
                    'content' => $body,
                ],
                'from' => [
                    'emailAddress' => ['address' => $serviceAccount],
                ],
                'toRecipients' => [
                    ['emailAddress' => ['address' => $email]],
                ],
            ],
            'saveToSentItems' => true,
        ];
    }

    private static function getGraphToken(string $tenantId, string $clientId, string $clientSecret): ?string
    {
        $ch = curl_init("https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/token");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'client_id' => $clientId,
            'scope' => 'https://graph.microsoft.com/.default',
            'client_secret' => $clientSecret,
            'grant_type' => 'client_credentials',
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode((string)$response, true);
        $token = is_array($data) ? ($data['access_token'] ?? null) : null;
        if (!$token) {
            // Microsoft's error code/description only (no secrets), e.g.
            // invalid_client / AADSTS7000215 = wrong or expired client secret.
            error_log('[mail] Graph token failed: ' . (is_array($data)
                ? trim(($data['error'] ?? '') . ' ' . substr((string)($data['error_description'] ?? ''), 0, 300))
                : 'no response'));
        }
        return $token;
    }

    private static function postJson(string $url, array $payload, array $headers): array
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['status' => $status, 'body' => $response];
    }
}
