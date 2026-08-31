<?php
/**
 * Require script to be run from CLI only.
 * Include at top of test/diagnostic scripts to prevent web access.
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain');
    exit('This script can only be run from the command line.');
}
