/**
 * Taken from: https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 * (with some changes)
 *
 * A component that returns a ref for a DOM element.
 * If a click is registered outside of that DOM element,
 * iterates through an array of arrays setting new state values.
 *
 * Example usage of this function in
 * frontend/Components/DriveComponents/DropDownMenu.jsx
 */

import { useEffect, useRef } from "react";

export default function useComponentVisible(setStateAndNewStatePairs) {
  // setStateAndNewStatePairs: Array of arrays where each nested array is a pair
  // consisting of a setState function and the new state value for that function

  const visibleRef = useRef(null);

  const handleClickOutside = (event) => {
    if (visibleRef.current && !visibleRef.current.contains(event.target)) {
      setStateAndNewStatePairs.forEach((pair) => {
        const [setState, newStateValue] = pair;
        setState(newStateValue);
      });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, { capture: true });
    document.addEventListener("contextmenu", handleClickOutside, {
      capture: true,
    });
    return () => {
      document.removeEventListener("click", handleClickOutside, {
        capture: true,
      });
      document.removeEventListener("oncontextmenu", handleClickOutside, {
        capture: true,
      });
    };
  }, []);

  return { visibleRef };
}
