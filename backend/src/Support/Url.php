<?php

namespace OmniContact\Support;

final class Url
{
    public static function publicUrl(string $path, array $config): string
    {
        $path = '/' . ltrim($path, '/');
        return rtrim($config['url'], '/') . $path;
    }
}
