<?php

namespace OmniContact\Controllers;

use OmniContact\Auth\Auth;
use OmniContact\Auth\TokenService;
use OmniContact\Database\Connection;
use OmniContact\Http\Request;
use OmniContact\Http\Response;

final class AuthController
{
    public static function login(array $params, array $config): void
    {
        $input = Request::json();
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $remember = (bool) ($input['remember'] ?? true);

        if ($email === '' || $password === '') {
            Response::error('VALIDATION_ERROR', 'Email and password are required.', 422);
            return;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('SELECT id, email, name, role, password_hash, responsibilities, created_at FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            Response::error('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
            return;
        }

        unset($admin['password_hash']);
        $admin['id'] = (int) $admin['id'];

        Response::json([
            'token' => TokenService::issue($admin, $config['jwt_secret'], $remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12),
            'admin' => $admin,
        ]);
    }

    public static function me(array $params, array $config): void
    {
        Response::json(['admin' => Auth::admin($config)]);
    }
}
