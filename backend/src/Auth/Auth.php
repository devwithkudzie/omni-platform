<?php

namespace OmniContact\Auth;

use OmniContact\Database\Connection;
use OmniContact\Http\Request;
use OmniContact\Http\Response;
use PDO;

final class Auth
{
    public static function admin(array $config): array
    {
        $token = Request::bearerToken();

        if (!$token) {
            Response::error('UNAUTHENTICATED', 'A valid admin token is required.', 401);
            exit;
        }

        $payload = TokenService::verify($token, $config['jwt_secret']);

        if (!$payload) {
            Response::error('UNAUTHENTICATED', 'A valid admin token is required.', 401);
            exit;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('SELECT id, email, name, role, responsibilities, created_at FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([(int) $payload['sub']]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin) {
            Response::error('UNAUTHENTICATED', 'A valid admin token is required.', 401);
            exit;
        }

        $admin['id'] = (int) $admin['id'];
        return $admin;
    }
}
