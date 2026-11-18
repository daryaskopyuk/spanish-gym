// The only place ads are shown. No ads today: this is a no-op.
// Call only at natural breaks (end of a round), never mid-question.

export type AdPlacement = 'round_end';

export async function maybeShowAd(_placement: AdPlacement): Promise<void> {
  // Intentionally empty.
}
