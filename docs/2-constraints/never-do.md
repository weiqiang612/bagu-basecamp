# Never Do

🚫 These are absolute prohibitions. No exceptions, regardless of how convenient
it might seem. If you believe a rule should be broken, stop and ask the user first.

## Security & secrets

- 🚫 Commit secrets, credentials, API keys, or tokens to the repository
- 🚫 Log sensitive user data (passwords, tokens, full card numbers, PII)
- 🚫 Output un-sanitised or un-escaped user data to HTML or API responses
- 🚫 Skip server-side input validation on any public API endpoint

## File boundaries

- 🚫 Edit `node_modules/`, `vendor/`, or any auto-generated directory
- 🚫 Modify `.github/workflows/` or CI pipeline files without explicit approval
- 🚫 Modify production environment configuration files
- 🚫 Modify files outside the scope defined in the active Spec

## Tests

- 🚫 Delete or comment out a failing test to make a build pass
- 🚫 Modify a test's assertions to match wrong behaviour — fix the implementation
- 🚫 Use `console.log` / `System.out` in tests — use assertions

## React — Component model

- 🚫 Mutate state directly — always use the setter from `useState` or a reducer
- 🚫 Call hooks conditionally or inside loops — hooks must be at the top level
- 🚫 Use `any` type — use `unknown` or a proper interface
- 🚫 Disable TypeScript strict mode or add `@ts-ignore` without explanation

## React — Next.js

- 🚫 Use Pages Router in a new project — always use App Router
- 🚫 Mark a component as `'use client'` without confirming it cannot be a Server Component
- 🚫 Fetch data sequentially when requests are independent — use `Promise.all` to parallelise
- 🚫 Import heavy client-side libraries in Server Components

## React — State

- 🚫 Derive state that can be computed — compute it in render or with `useMemo`
- 🚫 Create cascading `useEffect` chains — restructure to derive or colocate
