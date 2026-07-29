---
"@tevm/test-matchers": patch
"@tevm/test-utils": patch
---

Correct and expand JSDoc: `toBeInitializedAccount` documents that it asserts the account exists in state (not that it has code), `toHaveState` documents `deployedBytecode` rather than a nonexistent `code` field and its strict-equality comparison, and `getAlchemyUrl` and `transports` gain full docs with examples.
