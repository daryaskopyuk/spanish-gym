import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the user turned on "Reduce Motion" (iOS) / "Remove animations" (Android).
 * `undefined` until known.
 */
export function useReduceMotion(): boolean | undefined {
  const [reduce, setReduce] = useState<boolean | undefined>();
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduce(value))
      .catch(() => active && setReduce(false));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}
