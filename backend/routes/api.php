<?php

use OmniContact\Controllers\AuthController;
use OmniContact\Controllers\ContactController;
use OmniContact\Controllers\MediaController;
use OmniContact\Controllers\PostController;
use OmniContact\Controllers\SocialController;
use OmniContact\Controllers\UserController;
use OmniContact\Http\Response;

return [
    [
        'method' => 'GET',
        'pattern' => '#^/api/health$#',
        'handler' => static function (array $params, array $config): void {
            Response::json([
                'status' => 'ok',
                'service' => 'omnicontact-backend',
            ]);
        },
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/health$#',
        'handler' => static function (array $params, array $config): void {
            Response::json([
                'status' => 'ok',
                'service' => 'omnicontact-cms-api',
            ]);
        },
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/auth/login$#',
        'handler' => [AuthController::class, 'login'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/auth/me$#',
        'handler' => [AuthController::class, 'me'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/public/posts$#',
        'handler' => [PostController::class, 'publicIndex'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/public/posts/(?P<slug>[a-z0-9-]+)$#',
        'handler' => [PostController::class, 'publicShow'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/admin/posts$#',
        'handler' => [PostController::class, 'adminIndex'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/admin/posts$#',
        'handler' => [PostController::class, 'adminCreate'],
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^/api/v1/admin/posts/(?P<id>\d+)$#',
        'handler' => [PostController::class, 'adminUpdate'],
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^/api/v1/admin/posts/(?P<id>\d+)$#',
        'handler' => [PostController::class, 'adminDelete'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/admin/posts/(?P<id>\d+)/approval$#',
        'handler' => [PostController::class, 'adminApproval'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/admin/media$#',
        'handler' => [MediaController::class, 'upload'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/admin/users$#',
        'handler' => [UserController::class, 'index'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/admin/users$#',
        'handler' => [UserController::class, 'create'],
    ],
    [
        'method' => 'PUT',
        'pattern' => '#^/api/v1/admin/users/(?P<id>\d+)$#',
        'handler' => [UserController::class, 'update'],
    ],
    [
        'method' => 'DELETE',
        'pattern' => '#^/api/v1/admin/users/(?P<id>\d+)$#',
        'handler' => [UserController::class, 'delete'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/v1/admin/social/dashboard$#',
        'handler' => [SocialController::class, 'dashboard'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/v1/admin/social/check-names$#',
        'handler' => [SocialController::class, 'checkNames'],
    ],
    [
        'method' => 'GET',
        'pattern' => '#^/api/home-content$#',
        'handler' => static function (array $params, array $config): void {
            Response::json([
                'hero_title' => 'AI-Powered Customer Operations',
                'hero_subtitle' => 'Omnicontact helps organizations modernize their customer operations by combining intelligent automation, omnichannel support, and data-driven insights to deliver faster, more consistent service at a lower cost.',
            ]);
        },
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/contact$#',
        'handler' => [ContactController::class, 'submit'],
    ],
    [
        'method' => 'POST',
        'pattern' => '#^/api/assessment$#',
        'handler' => [ContactController::class, 'submit'],
    ],
];
