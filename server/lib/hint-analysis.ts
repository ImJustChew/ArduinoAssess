// Hint Behavior Analysis
// Analyzes hint usage patterns to understand learning style and help-seeking behavior

export interface HintEvent {
  id: string;
  questionId: string;
  hintType: 'conceptual' | 'syntactical' | 'structural' | 'example' | 'elimination';
  timeIntoQuestionMs: number;
  subsequentAction: 'answered_correctly' | 'answered_wrong' | 'asked_another_hint' | 'still_working' | null;
  timeAfterHintMs: number | null;
}

export interface HintProfile {
  helpSeekingStyle: 'quick_to_ask' | 'reluctant' | 'balanced';
  mostEffectiveHintType: string;
  preferredLearningMode: 'pattern_matching' | 'theory_first' | 'needs_scaffolding' | 'syntax_focused';
  hintEffectiveness: number;
  totalHintsUsed: number;
  avgTimeToAskHint: number;
  hintTypeDistribution: Record<string, number>;
}

/**
 * Analyzes hint usage patterns to understand student's learning style
 */
export function analyzeHintBehavior(events: HintEvent[]): HintProfile {
  if (events.length === 0) {
    return {
      helpSeekingStyle: 'balanced',
      mostEffectiveHintType: 'none',
      preferredLearningMode: 'theory_first',
      hintEffectiveness: 0,
      totalHintsUsed: 0,
      avgTimeToAskHint: 0,
      hintTypeDistribution: {},
    };
  }

  // Calculate average time before asking for hint
  const avgTimeToAskMs = events.reduce((sum, e) => sum + e.timeIntoQuestionMs, 0) / events.length;
  const avgTimeToAskSec = avgTimeToAskMs / 1000;

  // Determine help-seeking style
  const helpSeekingStyle: 'quick_to_ask' | 'reluctant' | 'balanced' =
    avgTimeToAskSec < 30 ? 'quick_to_ask' :
    avgTimeToAskSec > 120 ? 'reluctant' : 'balanced';

  // Calculate hint type effectiveness (which hints lead to correct answers)
  const hintTypeSuccess: Record<string, { correct: number; total: number }> = {};

  for (const event of events) {
    if (!hintTypeSuccess[event.hintType]) {
      hintTypeSuccess[event.hintType] = { correct: 0, total: 0 };
    }
    hintTypeSuccess[event.hintType].total++;
    if (event.subsequentAction === 'answered_correctly') {
      hintTypeSuccess[event.hintType].correct++;
    }
  }

  // Find most effective hint type
  let mostEffectiveType = 'none';
  let highestSuccessRate = 0;

  for (const [type, stats] of Object.entries(hintTypeSuccess)) {
    const successRate = stats.total > 0 ? stats.correct / stats.total : 0;
    if (successRate > highestSuccessRate) {
      highestSuccessRate = successRate;
      mostEffectiveType = type;
    }
  }

  // Calculate hint type distribution
  const hintTypeDistribution: Record<string, number> = {};
  for (const event of events) {
    hintTypeDistribution[event.hintType] = (hintTypeDistribution[event.hintType] || 0) + 1;
  }

  // Determine preferred learning mode based on most-used hint type
  const mostUsedType = Object.entries(hintTypeDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'conceptual';

  const preferredLearningMode: 'pattern_matching' | 'theory_first' | 'needs_scaffolding' | 'syntax_focused' =
    mostUsedType === 'example' ? 'pattern_matching' :
    mostUsedType === 'conceptual' ? 'theory_first' :
    mostUsedType === 'structural' ? 'needs_scaffolding' :
    'syntax_focused';

  // Calculate overall hint effectiveness
  const answeredAfterHint = events.filter(e => e.subsequentAction === 'answered_correctly').length;
  const hintEffectiveness = events.length > 0 ? answeredAfterHint / events.length : 0;

  return {
    helpSeekingStyle,
    mostEffectiveHintType: mostEffectiveType,
    preferredLearningMode,
    hintEffectiveness,
    totalHintsUsed: events.length,
    avgTimeToAskHint: avgTimeToAskSec,
    hintTypeDistribution,
  };
}

/**
 * Generate a narrative description of hint behavior for the final profile
 */
export function generateHintNarrative(profile: HintProfile): string {
  if (profile.totalHintsUsed === 0) {
    return "Student completed the assessment without requesting hints, demonstrating independence and confidence in problem-solving.";
  }

  const parts: string[] = [];

  // Help-seeking style
  if (profile.helpSeekingStyle === 'quick_to_ask') {
    parts.push(`Student actively seeks help early (avg ${Math.round(profile.avgTimeToAskHint)}s into questions), showing a proactive learning approach.`);
  } else if (profile.helpSeekingStyle === 'reluctant') {
    parts.push(`Student attempts problems independently for extended periods (avg ${Math.round(profile.avgTimeToAskHint)}s) before seeking hints.`);
  } else {
    parts.push(`Student demonstrates balanced help-seeking behavior, asking for hints after reasonable attempts.`);
  }

  // Learning mode
  const learningModeDescriptions = {
    'pattern_matching': 'learns best through examples and pattern recognition',
    'theory_first': 'prefers understanding concepts before implementation',
    'needs_scaffolding': 'benefits from structured, step-by-step guidance',
    'syntax_focused': 'primarily needs syntax reference rather than conceptual help',
  };
  parts.push(`Learning style: ${learningModeDescriptions[profile.preferredLearningMode]}.`);

  // Effectiveness
  const effectivenessPercent = Math.round(profile.hintEffectiveness * 100);
  if (profile.hintEffectiveness > 0.7) {
    parts.push(`Hints are highly effective (${effectivenessPercent}% lead to correct answers), suggesting good ability to apply guidance.`);
  } else if (profile.hintEffectiveness > 0.4) {
    parts.push(`Hints have moderate effectiveness (${effectivenessPercent}% success rate).`);
  } else {
    parts.push(`Student struggles to apply hints effectively (${effectivenessPercent}% success rate), may need more fundamental instruction.`);
  }

  // Most effective hint type
  if (profile.mostEffectiveHintType !== 'none') {
    parts.push(`Most responsive to ${profile.mostEffectiveHintType} hints.`);
  }

  return parts.join(' ');
}
