# Debugging

**To Debug the Backend:**

1. In VSCode => Debugger, launch "Backend (Debug)
2. Run your test with the --no-backend (or -nb) option i.e.

```bash
yarn test test/backend/integration/RequestsControllerTest.js -nb
```

**To Debug a Test:**

1. In VSCode => Debugger, launch "Mocha Test (Current File)" while on the test
   you want to debug.
