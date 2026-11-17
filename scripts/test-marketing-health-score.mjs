/**
 * Independent verification of Digital Marketing Health Check scoring.
 * Mirrors backend/src/Support/MarketingHealthCheck.php and the frontend calculator.
 */
import {
  MAX_TOTAL_POINTS,
  calculateMarketingHealth,
  healthStatus,
  normalizeHealthResult,
} from '../frontend/src/features/maas-health-check/data/marketingHealthCheck.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const perfect = calculateMarketingHealth({ q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A' })
assert(perfect.overallScore === 100, `expected 100, got ${perfect.overallScore}`)
assert(perfect.totalPoints === MAX_TOTAL_POINTS, 'max points mismatch')
assert(perfect.healthStatusKey === 'healthy', 'perfect should be healthy')

const mid = calculateMarketingHealth({ q1: 'B', q2: 'B', q3: 'B', q4: 'B', q5: 'B' })
assert(mid.overallScore === 67, `expected 67, got ${mid.overallScore}`)
assert(mid.healthStatusKey === 'needs_improvement', 'mid should need improvement')

const weak = calculateMarketingHealth({ q1: 'D', q2: 'D', q3: 'C', q4: 'D', q5: 'D' })
assert(weak.overallScore === 7, `expected 7, got ${weak.overallScore}`)
assert(weak.healthStatusKey === 'poor', 'weak should be poor')
assert(weak.weakest.length === 2, 'should surface two weak areas')
assert(weak.recommendations.length >= 1, 'should include recommendations')

const mixed = calculateMarketingHealth({ q1: 'A', q2: 'A', q3: 'D', q4: 'C', q5: 'B' })
// points: 3+3+0+1+2 = 9 → 60%
assert(mixed.overallScore === 60, `expected 60, got ${mixed.overallScore}`)
assert(mixed.weakest[0].id === 'leads', `expected leads weakest first, got ${mixed.weakest[0].id}`)

const normalized = normalizeHealthResult({
  overallScore: 60,
  category: 'Developing',
  categoryMessage: 'Some gaps affecting consistency.',
  healthStatus: 'Needs Improvement',
  healthStatusKey: 'needs_improvement',
  explanation: healthStatus(60).explanation,
  pillarScores: mixed.pillarScores,
  strengths: mixed.strengths,
  weakest: mixed.weakest,
  recommendations: mixed.recommendations,
})
assert(normalized.overallScore === 60, 'normalize should keep score')
assert(normalized.healthStatusKey === 'needs_improvement', 'normalize status')

console.log('Marketing health scoring checks passed.')
console.log(JSON.stringify({
  perfect: perfect.overallScore,
  mid: mid.overallScore,
  weak: weak.overallScore,
  mixed: {
    score: mixed.overallScore,
    status: mixed.healthStatus,
    weakest: mixed.weakest.map((item) => item.id),
  },
}, null, 2))
