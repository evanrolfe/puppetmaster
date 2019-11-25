import { useReducer, useRef, useMemo, useEffect } from 'react';
import { stdChannel, runSaga } from 'redux-saga';

function useSagaReducer(
  saga,
  reducer,
  initializerArg,
  initializer,
  runSagaOptions
) {
  const [state, reactDispatch] = useReducer(
    reducer,
    initializerArg,
    initializer
  );
  const stateRef = useRef(state);

  // Added by Evan, see: https://github.com/dai-shi/react-tracked/issues/29
  useEffect(() => {
    stateRef.current = state;
  });

  const sagaIO = useMemo(() => {
    const channel = stdChannel();
    const dispatch = action => {
      setImmediate(channel.put, action);
      reactDispatch(action);
    };
    const getState = () => stateRef.current;
    return {
      channel,
      dispatch,
      getState
    };
  }, []);
  useEffect(() => {
    const options = runSagaOptions || {};
    const sagaOptions = {
      ...sagaIO,
      sagaMonitor: options.sagaMonitor,
      onError: options.onError,
      context: options.context,
      effectMiddlewares: options.effectMiddlewares
    };
    const task = runSaga(sagaOptions, saga);
    return () => {
      task.cancel();
    };
  }, []);
  return [state, sagaIO.dispatch];
}

export default useSagaReducer;
export { useSagaReducer };
