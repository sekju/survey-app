/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce
 * @param {number} delay - The number of milliseconds to delay
 * @returns {Function} The debounced function
 *
 * @example
 * const debouncedSave = debounce((content) => {
 *   saveToFile(content);
 * }, 300);
 *
 * textarea.addEventListener('input', (e) => {
 *   debouncedSave(e.target.value);
 * });
 */
export function debounce(func, delay) {
  let timeoutId;

  return function debounced(...args) {
    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Creates a debounced function with leading edge execution
 * The function is called immediately on the first call, then debounced
 *
 * @param {Function} func - The function to debounce
 * @param {number} delay - The number of milliseconds to delay
 * @returns {Function} The debounced function with leading edge
 */
export function debounceLeading(func, delay) {
  let timeoutId;
  let lastCallTime = 0;

  return function debounced(...args) {
    const now = Date.now();

    // If enough time has passed, call immediately
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    } else {
      // Otherwise, debounce
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(this, args);
      }, delay);
    }
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 *
 * @param {Function} func - The function to throttle
 * @param {number} delay - The number of milliseconds to throttle
 * @returns {Function} The throttled function
 */
export function throttle(func, delay) {
  let lastCallTime = 0;
  let timeoutId;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delay) {
      // Enough time has passed, call the function
      lastCallTime = now;
      func.apply(this, args);
    } else {
      // Schedule the next call
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}
