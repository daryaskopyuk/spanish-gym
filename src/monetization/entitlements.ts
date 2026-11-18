// The only place paid-feature checks live. No monetization today: everything is unlocked.
// If a Pro unlock is added later (e.g. RevenueCat), only this file changes.
import type { TenseId } from '@/data/types';

export function isPro(): boolean {
  return true;
}

export function canUseTense(_tense: TenseId): boolean {
  return isPro();
}

export function canUseExercise(_exerciseType: string): boolean {
  return isPro();
}
