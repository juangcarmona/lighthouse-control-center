<!-- pdac-scope: cited -->
# Show verified issue actor and explain workflow permission

Tracking: [Lighthouse Control Center #50](https://github.com/juangcarmona/lighthouse-control-center/issues/50).

After an issue-source response passes the existing repository, issue, actor-ID, data-scope, and current-operation checks, show its non-empty verified GitHub login in the shared workspace identity. Keep the session identity when those checks fail. Explain workflow dispatch denial with the existing Actions write/current dispatch authority requirement, while preserving the distinct issue-write explanation for ordinary comments.

This is a bounded presentation correction within the existing issue context and action capability. It adds no authority, request, policy, session persistence, or product behavior; disabled actions remain disabled and existing explicit confirmation remains required.

<!-- pdac:cite id="UC-OPERATE-ISSUE" digest="sha256:125cec42bb77d281e22920ae2b491eb2f43afe7dfd5f0a700fd289842af11d62" -->
<!-- pdac:cite id="FR-ISSUE-CONTEXT" digest="sha256:131544b2398250b3ff601fca471bca8c9f9504876a670809cad21829baff4a73" -->
<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
