/**
 * Taken from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * setInterval doesn't work well with state variables as it takes
 * a copy of the state variable when the function is first called.
 * This copy can become stale if the state is updated.
 *
 * This custom hook seems to work well as a setInterval substitute when
 * state variables are part of the logic.
 */

import { useEffect, useRef } from "react";

export default function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
