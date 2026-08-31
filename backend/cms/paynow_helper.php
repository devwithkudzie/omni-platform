<?php
require_once __DIR__ . '/config.php';

/**
 * PayNow helper – creates Paynow instance from config.
 * Requires: composer require paynow/php-sdk
 */

function get_paynow_instance(): ?object {
    $id = trim(cms_config_string('paynow.id'));
    $key = trim(cms_config_string('paynow.key'));
    $email = trim(cms_config_string('paynow.merchant_email'));
    $baseUrl = rtrim(cms_config_string('base_url'), '/');

    if (!$id || !$key || !$email || !$baseUrl) {
        return null;
    }

    $resultUrl = $baseUrl . '/cms/api/airtime-paynow-result.php';
    $returnUrl = $baseUrl . '/airtime?paynow=return';

    if (!class_exists('Paynow\Payments\Paynow')) {
        $autoload = __DIR__ . '/vendor/autoload.php';
        if (file_exists($autoload)) {
            require_once $autoload;
        } else {
            return null;
        }
    }

    // Paynow(id, key, resultUrl, returnUrl)
    return new \Paynow\Payments\Paynow($id, $key, $resultUrl, $returnUrl);
}
