<?php

namespace OmniContact\Controllers;

use OmniContact\Auth\Auth;
use OmniContact\Database\Connection;
use OmniContact\Http\Request;
use OmniContact\Http\Response;

final class UserController
{
    public static function index(array $params, array $config): void
    {
        self::authorizeManager($config);

        $pdo = Connection::make($config);
        $stmt = $pdo->query('SELECT id, email, name, role, responsibilities, created_by, created_at FROM admins ORDER BY created_at DESC');

        Response::json(['users' => array_map([self::class, 'normalize'], $stmt->fetchAll())]);
    }

    public static function create(array $params, array $config): void
    {
        $admin = self::authorizeManager($config);
        $input = Request::json();
        $email = trim($input['email'] ?? '');
        $name = trim($input['name'] ?? '');
        $password = $input['password'] ?? '';
        $role = self::allowedRole($input['role'] ?? 'author', $admin['role']);

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('VALIDATION_ERROR', 'A valid email is required.', 422);
            return;
        }

        if (strlen($password) < 8) {
            Response::error('VALIDATION_ERROR', 'Password must be at least 8 characters.', 422);
            return;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('INSERT INTO admins (email, name, role, password_hash, responsibilities, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');

        try {
            $stmt->execute([
                $email,
                $name !== '' ? $name : null,
                $role,
                password_hash($password, PASSWORD_DEFAULT),
                self::responsibilities($input['responsibilities'] ?? null),
                $admin['id'],
            ]);
        } catch (\PDOException $e) {
            Response::error('DUPLICATE_EMAIL', 'A user with that email already exists.', 409);
            return;
        }

        Response::json(['id' => (int) $pdo->lastInsertId()], 201);
    }

    public static function update(array $params, array $config): void
    {
        $admin = self::authorizeManager($config);
        $id = (int) $params['id'];
        $input = Request::json();

        if ($id === (int) $admin['id'] && isset($input['role']) && $input['role'] !== $admin['role']) {
            Response::error('VALIDATION_ERROR', 'You cannot change your own role.', 422);
            return;
        }

        $fields = [];
        $values = [];

        if (array_key_exists('email', $input)) {
            $email = trim($input['email'] ?? '');
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error('VALIDATION_ERROR', 'A valid email is required.', 422);
                return;
            }
            $fields[] = 'email = ?';
            $values[] = $email;
        }

        if (array_key_exists('name', $input)) {
            $fields[] = 'name = ?';
            $values[] = trim($input['name'] ?? '') ?: null;
        }

        if (array_key_exists('role', $input)) {
            $fields[] = 'role = ?';
            $values[] = self::allowedRole($input['role'], $admin['role']);
        }

        if (array_key_exists('responsibilities', $input)) {
            $fields[] = 'responsibilities = ?';
            $values[] = self::responsibilities($input['responsibilities']);
        }

        if (!empty($input['password'])) {
            if (strlen($input['password']) < 8) {
                Response::error('VALIDATION_ERROR', 'Password must be at least 8 characters.', 422);
                return;
            }
            $fields[] = 'password_hash = ?';
            $values[] = password_hash($input['password'], PASSWORD_DEFAULT);
        }

        if (!$fields) {
            Response::error('VALIDATION_ERROR', 'No fields were provided.', 422);
            return;
        }

        $values[] = $id;
        $pdo = Connection::make($config);

        try {
            $stmt = $pdo->prepare('UPDATE admins SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        } catch (\PDOException $e) {
            Response::error('DUPLICATE_EMAIL', 'A user with that email already exists.', 409);
            return;
        }

        Response::json(['success' => true]);
    }

    public static function delete(array $params, array $config): void
    {
        $admin = self::authorizeManager($config);
        $id = (int) $params['id'];

        if ($id === (int) $admin['id']) {
            Response::error('VALIDATION_ERROR', 'You cannot delete your own account.', 422);
            return;
        }

        if ($admin['role'] !== 'super_admin') {
            Response::error('FORBIDDEN', 'Only super admins can delete users.', 403);
            return;
        }

        $pdo = Connection::make($config);
        $stmt = $pdo->prepare('DELETE FROM admins WHERE id = ?');
        $stmt->execute([$id]);

        Response::json(['success' => true]);
    }

    private static function authorizeManager(array $config): array
    {
        $admin = Auth::admin($config);

        if (!in_array($admin['role'], ['super_admin', 'manager'], true)) {
            Response::error('FORBIDDEN', 'Only managers and super admins can manage users.', 403);
            exit;
        }

        return $admin;
    }

    private static function allowedRole(string $role, string $currentRole): string
    {
        $allowed = $currentRole === 'super_admin'
            ? ['super_admin', 'manager', 'author']
            : ['author'];

        return in_array($role, $allowed, true) ? $role : 'author';
    }

    private static function responsibilities(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_array($value)) {
            return null;
        }

        return json_encode(array_values($value), JSON_UNESCAPED_SLASHES);
    }

    private static function normalize(array $user): array
    {
        $user['id'] = (int) $user['id'];
        $user['created_by'] = $user['created_by'] !== null ? (int) $user['created_by'] : null;
        $decoded = json_decode($user['responsibilities'] ?? '[]', true);
        $user['responsibilities'] = is_array($decoded) ? $decoded : [];

        return $user;
    }
}
