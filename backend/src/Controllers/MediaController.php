<?php

namespace OmniContact\Controllers;

use OmniContact\Auth\Auth;
use OmniContact\Http\Response;
use OmniContact\Support\Url;

final class MediaController
{
    public static function upload(array $params, array $config): void
    {
        Auth::admin($config);

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            Response::error('UPLOAD_ERROR', 'No image was uploaded.', 422);
            return;
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, $allowedTypes, true)) {
            Response::error('INVALID_FILE', 'Only JPG, PNG, WEBP, and GIF images are allowed.', 422);
            return;
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) ?: 'jpg';
        $filename = bin2hex(random_bytes(12)) . '.' . $extension;
        $uploadDir = dirname(__DIR__, 2) . '/public/uploads';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $target = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $target)) {
            Response::error('UPLOAD_ERROR', 'Unable to save the uploaded image.', 500);
            return;
        }

        Response::json([
            'url' => Url::publicUrl('/uploads/' . $filename, $config),
        ], 201);
    }
}
