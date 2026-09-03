# Workspace Agent Guidelines & Protocols

## Confirmation & Execution Protocol
- **Direct UI Execution**: Do NOT ask the user to "proceed" or request confirmation for UI changes, CSS styling, asset bindings, visual tweaks, or feature enhancements. Execute them directly in the current turn.
- **Reserved Confirmation**: ONLY stop and request confirmation for destructive database migrations, bulk deletions, or major breaking backend architecture changes.
- **Continuous Quality**: Always test and verify build integrity (`npm run build`) and file existence on disk after making changes.
- **Enterprise Tone**: Maintain crisp B2B SaaS terminology and 1-sentence file breakdowns.
