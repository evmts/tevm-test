# Changesets

Add a changeset for every user-visible package change:

```sh
pnpm changeset
```

The release workflow opens a version PR. Merging that PR publishes the changed
packages to npm with provenance.
