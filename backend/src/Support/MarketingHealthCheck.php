<?php

namespace OmniContact\Support;

/**
 * Server-side scoring for the Digital Marketing Health Check.
 * Mirrors frontend/src/features/maas-health-check/data/marketingHealthCheck.js
 * Short form: 5 questions (one per pillar), A=3 … D=0.
 */
final class MarketingHealthCheck
{
    public const MAX_TOTAL_POINTS = 15;
    public const MAX_PILLAR_POINTS = 3;

    public const PILLARS = [
        'strategy' => [
            'label' => 'Strategy & Direction',
            'tip' => 'Agree clear goals, an audience focus and a simple monthly marketing plan that the team can follow.',
        ],
        'visibility' => [
            'label' => 'Visibility & Reach',
            'tip' => 'Improve discoverability with consistent channel presence, clearer messaging and better audience targeting.',
        ],
        'leads' => [
            'label' => 'Lead Generation & Conversion',
            'tip' => 'Tighten lead capture, response times and follow-up so interest turns into tracked sales opportunities.',
        ],
        'content' => [
            'label' => 'Content & Engagement',
            'tip' => 'Create customer-focused content with clear calls to action, and measure what converts engagement into enquiries.',
        ],
        'measurement' => [
            'label' => 'Measurement & Optimisation',
            'tip' => 'Track leads and conversions monthly, then use those numbers to improve campaigns and budget decisions.',
        ],
    ];

    public const QUESTIONS = [
        'q1' => 'strategy',
        'q2' => 'visibility',
        'q3' => 'leads',
        'q4' => 'content',
        'q5' => 'measurement',
    ];

    public const OPTION_SCORES = [
        'A' => 3,
        'B' => 2,
        'C' => 1,
        'D' => 0,
    ];

    public static function isHealthCheck(array $payload): bool
    {
        $title = strtolower(trim((string)($payload['assessmentTitle'] ?? '')));
        $source = strtolower(trim((string)($payload['source'] ?? '')));
        $tag = strtolower(trim((string)($payload['leadSourceTag'] ?? '')));

        return $tag === 'maas'
            || str_contains($title, 'digital marketing health')
            || str_contains($source, 'digital marketing health');
    }

    /**
     * Map percentage score to UX health status.
     * Thresholds match the existing category bands:
     * Healthy >= 80, Needs Improvement 40–79, Poor < 40.
     */
    public static function healthStatus(int $score): array
    {
        if ($score >= 80) {
            return [
                'key' => 'healthy',
                'label' => 'Healthy',
                'explanation' => 'Your digital marketing foundation is in good shape. Keep refining what works and scale the channels that already convert.',
            ];
        }
        if ($score >= 40) {
            return [
                'key' => 'needs_improvement',
                'label' => 'Needs Improvement',
                'explanation' => 'Your digital marketing has room for improvement. Closing a few focused gaps should make lead flow and measurement more consistent.',
            ];
        }

        return [
            'key' => 'poor',
            'label' => 'Poor',
            'explanation' => 'Your current digital marketing approach needs a structured reset. Prioritise a clear plan, lead capture and basic performance tracking.',
        ];
    }

    public static function scoreCategory(int $score): array
    {
        if ($score >= 80) {
            return ['label' => 'Strong Foundation', 'message' => 'Good base; optimise and scale.'];
        }
        if ($score >= 60) {
            return ['label' => 'Developing', 'message' => 'Some gaps affecting consistency.'];
        }
        if ($score >= 40) {
            return ['label' => 'Needs Attention', 'message' => 'Important gaps may limit growth.'];
        }

        return ['label' => 'High Priority', 'message' => 'A structured marketing approach is needed.'];
    }

    public static function extractAnswerKeys(array $payload): array
    {
        $responses = is_array($payload['responses'] ?? null) ? $payload['responses'] : [];
        $answerKeys = [];

        foreach ($responses as $response) {
            if (!is_array($response)) {
                continue;
            }
            $id = strtolower(trim((string)($response['id'] ?? '')));
            $key = strtoupper(trim((string)($response['answerKey'] ?? '')));
            if ($id !== '' && isset(self::OPTION_SCORES[$key]) && isset(self::QUESTIONS[$id])) {
                $answerKeys[$id] = $key;
            }
        }

        return $answerKeys;
    }

    /**
     * Authoritative scoring path. Requires a complete answer set.
     *
     * @throws \InvalidArgumentException
     */
    public static function scorePayload(array $payload): array
    {
        $answerKeys = self::extractAnswerKeys($payload);
        $missing = array_values(array_diff(array_keys(self::QUESTIONS), array_keys($answerKeys)));
        if ($missing !== []) {
            throw new \InvalidArgumentException(
                'All health check questions must be answered before scoring. Missing: ' . implode(', ', $missing)
            );
        }

        return self::calculate($answerKeys);
    }

    public static function resolveSnapshot(array $payload): array
    {
        $answerKeys = self::extractAnswerKeys($payload);

        if (count($answerKeys) === count(self::QUESTIONS)) {
            return self::calculate($answerKeys);
        }

        $snapshot = is_array($payload['snapshot'] ?? null) ? $payload['snapshot'] : [];
        $overall = (int)round((float)($snapshot['ooi'] ?? 0));
        $category = self::scoreCategory($overall);
        $status = self::healthStatus($overall);
        $weakest = is_array($payload['weakestAreas'] ?? null) ? $payload['weakestAreas'] : [];

        return [
            'overallScore' => $overall,
            'maxScore' => 100,
            'totalPoints' => null,
            'maxPoints' => self::MAX_TOTAL_POINTS,
            'category' => trim((string)($snapshot['level'] ?? $category['label'])),
            'categoryMessage' => trim((string)($snapshot['summary'] ?? $category['message'])),
            'healthStatus' => $status['label'],
            'healthStatusKey' => $status['key'],
            'explanation' => $status['explanation'],
            'pillarScores' => is_array($snapshot['dimensionScores'] ?? null) ? $snapshot['dimensionScores'] : [],
            'strengths' => [],
            'weakest' => $weakest,
            'recommendations' => array_values(array_filter(array_map(
                static fn ($item): string => is_array($item) ? trim((string)($item['tip'] ?? '')) : '',
                $weakest
            ))),
        ];
    }

    public static function calculate(array $answers): array
    {
        $pillarPoints = array_fill_keys(array_keys(self::PILLARS), 0);
        $totalPoints = 0;

        foreach (self::QUESTIONS as $questionId => $pillarId) {
            $key = strtoupper((string)($answers[$questionId] ?? ''));
            if (!isset(self::OPTION_SCORES[$key])) {
                throw new \InvalidArgumentException('All questions must be answered before scoring.');
            }
            $points = self::OPTION_SCORES[$key];
            $pillarPoints[$pillarId] += $points;
            $totalPoints += $points;
        }

        $overallScore = (int)round(($totalPoints / self::MAX_TOTAL_POINTS) * 100);
        $category = self::scoreCategory($overallScore);
        $status = self::healthStatus($overallScore);

        $pillarScores = [];
        foreach (self::PILLARS as $id => $pillar) {
            $points = $pillarPoints[$id];
            $pillarScores[] = [
                'id' => $id,
                'label' => $pillar['label'],
                'tip' => $pillar['tip'],
                'points' => $points,
                'score' => (int)round(($points / self::MAX_PILLAR_POINTS) * 100),
            ];
        }

        $orderedByScore = $pillarScores;
        usort($orderedByScore, static function (array $a, array $b): int {
            $byScore = $a['score'] <=> $b['score'];
            return $byScore !== 0 ? $byScore : strcmp($a['label'], $b['label']);
        });
        $weakest = array_slice($orderedByScore, 0, 2);
        $strengths = array_values(array_filter(
            array_reverse($orderedByScore),
            static fn (array $pillar): bool => (int)$pillar['score'] >= 67
        ));
        if ($strengths === []) {
            $strengths = array_slice(array_reverse($orderedByScore), 0, 1);
        }

        usort($pillarScores, static function (array $a, array $b): int {
            $order = array_keys(self::PILLARS);
            return array_search($a['id'], $order, true) <=> array_search($b['id'], $order, true);
        });

        $recommendations = array_values(array_unique(array_map(
            static fn (array $pillar): string => (string)$pillar['tip'],
            $weakest
        )));

        return [
            'overallScore' => $overallScore,
            'maxScore' => 100,
            'totalPoints' => $totalPoints,
            'maxPoints' => self::MAX_TOTAL_POINTS,
            'category' => $category['label'],
            'categoryMessage' => $category['message'],
            'healthStatus' => $status['label'],
            'healthStatusKey' => $status['key'],
            'explanation' => $status['explanation'],
            'pillarScores' => $pillarScores,
            'strengths' => $strengths,
            'weakest' => $weakest,
            'recommendations' => $recommendations,
        ];
    }
}
