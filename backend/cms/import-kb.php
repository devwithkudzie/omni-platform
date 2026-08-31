<?php
// cms/import-kb.php
//
// One-time importer for cms/kb/omni_kb.txt into MySQL table kb_chunks.
// Run locally or on server (CLI): php cms/import-kb.php

require_once __DIR__ . '/db.php';

$kbPath = __DIR__ . '/kb/omni_kb.txt';
if (!file_exists($kbPath)) {
    fwrite(STDERR, "KB file not found: $kbPath\n");
    exit(1);
}

$raw = file_get_contents($kbPath);
$lines = preg_split("/\\r?\\n/", $raw);

$chunks = [];
$currentId = null;
$buf = [];

$flush = function () use (&$chunks, &$currentId, &$buf) {
    $text = trim(implode("\n", $buf));
    if ($currentId && $text !== '') {
        $title = $currentId;
        $chunks[] = [
            'section_id' => $currentId,
            'title' => $title,
            'body' => $text,
            'tags' => null,
        ];
    }
    $buf = [];
};

foreach ($lines as $line) {
    $trim = trim($line);
    if (preg_match('/^\\[([^\\]]+)\\]\\s*$/', $trim, $m)) {
        $flush();
        $currentId = trim($m[1]);
        continue;
    }
    $buf[] = $line;
}
$flush();

if (count($chunks) === 0) {
    fwrite(STDERR, "No tagged chunks found. Ensure KB uses [SectionId] headers.\n");
    exit(1);
}

$pdo = get_pdo();

// Ensure table exists (in case migration wasn't run).
$pdo->exec("
CREATE TABLE IF NOT EXISTS kb_chunks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  section_id VARCHAR(120) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  tags VARCHAR(300) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FULLTEXT KEY ft_kb (title, body, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Replace all existing KB chunks (simple + predictable)
$pdo->beginTransaction();
$pdo->exec("TRUNCATE TABLE kb_chunks");

$stmt = $pdo->prepare("INSERT INTO kb_chunks (section_id, title, body, tags) VALUES (?, ?, ?, ?)");
$count = 0;
foreach ($chunks as $c) {
    $stmt->execute([$c['section_id'], $c['title'], $c['body'], $c['tags']]);
    $count++;
}
$pdo->commit();

echo "Imported $count chunks into kb_chunks.\n";

