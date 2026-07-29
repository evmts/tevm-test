# Tevm Test docs

The documentation site for [`@tevm/test-matchers`](../packages/test-matchers),
[`@tevm/test-node`](../packages/test-node), and [`@tevm/test-utils`](../packages/test-utils),
published at [test.tevm.sh](https://test.tevm.sh).

Built with [Vocs](https://vocs.dev) 2.x. Pages live in `src/pages`; navigation and theming live in
`vocs.config.ts`.

```sh
pnpm --filter @tevm/test-docs dev     # local dev server
pnpm docs:build                       # static build into docs/dist/public
pnpm --filter @tevm/test-docs preview # preview the build
```

Deployed to Vercel. The Vercel project's Root Directory is `docs`; `vercel.json` pins the install and
build commands and the `dist/public` output directory.
