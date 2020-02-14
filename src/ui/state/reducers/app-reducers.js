const shiftPressed = state => ({ ...state, shiftPressed: true });
const shiftReleased = state => ({ ...state, shiftPressed: false });
const setWindowSizedThrottled = (state, action) => ({
  ...state,
  windowSizeThrottel: action.windowSize
});
const SetTheme = (state, action) => ({ ...state, activeTheme: action.theme });

const appReducers = {
  SHIFT_PRESSED: shiftPressed,
  SHIFT_RELEASED: shiftReleased,
  SET_WINDOW_SIZE_THROTTLED: setWindowSizedThrottled,
  SET_THEME: SetTheme
};

export { appReducers };
