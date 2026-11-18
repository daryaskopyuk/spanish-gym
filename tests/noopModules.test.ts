import { maybeShowAd } from '@/monetization/ads';
import { canUseExercise, canUseTense, isPro } from '@/monetization/entitlements';
import { reportError, trackEvent } from '@/telemetry/telemetry';

describe('no-op monetization and telemetry modules', () => {
  it('unlocks everything', () => {
    expect(isPro()).toBe(true);
    expect(canUseTense('present_indicative')).toBe(true);
    expect(canUseExercise('conjugation_input')).toBe(true);
  });

  it('does not throw', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(maybeShowAd('round_end')).resolves.toBeUndefined();
    expect(() => reportError(new Error('x'))).not.toThrow();
    expect(() => trackEvent('round_finished', { score: 18 })).not.toThrow();
  });
});
