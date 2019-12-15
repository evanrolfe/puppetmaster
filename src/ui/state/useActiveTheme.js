import { useTrackedState } from './state';

const useActiveTheme = () => {
  const state = useTrackedState();
  return state.activeTheme;
};

export default useActiveTheme;
