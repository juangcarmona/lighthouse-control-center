# Delivery specifications

OpenSpec 1.15.0 owns the `spec-driven` delivery format. ProductShape owns product meaning in `docs/product/model/`; implementation plans consume that baseline and do not approve or change it. The configuration and ProductShape schemas here are generated through `openspec init --tools none` and `prodshape integration add openspec`.

At initial adoption, `openspec list --specs --json` returned no baseline specifications. The [inventory receipt](../docs/delivery/evidence/issue-88/planning-prerequisites.json) records that observation. The tracked empty `specs/` directory makes the initial inventory visible in source snapshots. Pending proposals on other branches are not accepted baseline specifications.

Before planning, inspect `openspec/config.yaml`, list the current `specs/` contents and use `npm exec --no -- openspec list --specs --json` for provider discovery. Add only the delivery change authorized by its issue. Product changes and their human approval remain separate.

`npm run verify` validates OpenSpec documents and their ProductShape scope declarations and citations. Refresh generated integration files through `prodshape integration update`; preserve project-owned configuration outside its managed blocks.
