# Ask First

⚠️ Stop and confirm with the user before taking any of these actions.
Do not proceed on your own judgement — risk of silent, hard-to-reverse mistakes
is too high.

## Dependencies

- ⚠️ Add any new dependency (package, library, or plugin)
- ⚠️ Upgrade an existing dependency version

## Architecture & structure

- ⚠️ Introduce a new architectural layer or abstraction not currently in the project
- ⚠️ Rename a public API method, class, or module (breaking change)
- ⚠️ Move a file or module to a different directory or package
- ⚠️ Add a new submodule or service to a multi-module project

## Tests

- ⚠️ Modify an existing test's assertions or structure
  (fixing a broken test is OK — changing what it verifies requires confirmation)
- ⚠️ Add a new test profile or test infrastructure configuration

## CI / deployment

- ⚠️ Modify `.github/workflows/` or any CI pipeline file
- ⚠️ Change `Dockerfile` or `docker-compose.yml`
- ⚠️ Modify any production or staging environment configuration

## React / Next.js

- ⚠️ Change a component's props interface (may break consumers)
- ⚠️ Modify `next.config.js` / `next.config.ts` or build configuration
- ⚠️ Change routing structure or middleware logic
- ⚠️ Switch a component between Server and Client (changes rendering model)
- ⚠️ Add or change a global context provider
