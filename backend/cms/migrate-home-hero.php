<?php
// cms/migrate-home-hero.php
// One-time helper script to copy the existing SPA hero image
// (src/assets/omni-hero.jpg) into cms/uploads and set it as
// hero_background_image in cms/content/home.json.
//
// Usage (from project root):
//   php cms/migrate-home-hero.php
//
// Or via browser (dev): http://localhost:8000/cms/migrate-home-hero.php

require_once __DIR__ . '/db.php';

// Optional: if called via web, emit JSON headers
if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
}

try {
    // Only allow logged-in admins when called via web
    if (php_sapi_name() !== 'cli') {
        if (!is_admin_logged_in()) {
            http_response_code(401);
            echo json_encode(['error' => 'Not authenticated']);
            exit;
        }
    }

    // Determine project root (cms/ is one level below root)
    $rootDir = dirname(__DIR__);

    // Source hero image from SPA assets
    $sourcePath = $rootDir . '/src/assets/omni-hero.jpg';
    if (!file_exists($sourcePath)) {
        http_response_code(404);
        $msg = 'Source hero image not found at ' . $sourcePath;
        echo json_encode(['error' => $msg]);
        exit;
    }

    // Destination uploads directory
    $uploadDir = __DIR__ . '/uploads';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create uploads directory']);
        exit;
    }

    // Generate a unique filename
    $ext = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
    $basename = bin2hex(random_bytes(8));
    $filename = sprintf('%s.%s', $basename, $ext);
    $targetPath = $uploadDir . '/' . $filename;

    if (!copy($sourcePath, $targetPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to copy hero image to uploads']);
        exit;
    }

    // Build public URL for the uploaded hero image
    if (php_sapi_name() === 'cli') {
        // When running via CLI, we can't know the exact host. Use relative URL.
        $publicUrl = '/cms/uploads/' . $filename;
    } else {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $publicUrl = $scheme . '://' . $host . '/cms/uploads/' . $filename;
    }

    // Load existing home content JSON (if any), then update hero_background_image
    $contentDir = __DIR__ . '/content';
    if (!is_dir($contentDir) && !mkdir($contentDir, 0775, true) && !is_dir($contentDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create content directory']);
        exit;
    }

    $contentFile = $contentDir . '/home.json';
    $data = [];
    if (file_exists($contentFile)) {
        $raw = file_get_contents($contentFile);
        if ($raw !== false) {
          $decoded = json_decode($raw, true);
          if (is_array($decoded)) {
              $data = $decoded;
          }
        }
    }

    // Only set hero_background_image if not already set, so we don't override a custom choice
    if (empty($data['hero_background_image'])) {
        $data['hero_background_image'] = $publicUrl;
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to encode home content JSON']);
        exit;
    }

    if (file_put_contents($contentFile, $json) === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write home content JSON']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Hero image migrated and hero_background_image set (if it was empty).',
        'hero_background_image' => $data['hero_background_image'],
        'uploaded_file' => 'cms/uploads/' . $filename,
    ]);
} catch (Throwable $e) {
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
    }
    echo json_encode(['error' => 'Migration failed', 'details' => $e->getMessage()]);
}

