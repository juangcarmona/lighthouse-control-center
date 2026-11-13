# Health visual reference and candidate

Captured 2026-11-11 from [Platform Project Health](https://health.platform.plainconcepts.dev/). The reference explicitly labels its values as example data. The screenshots are for layout and interaction review, not evidence of Lighthouse Control Center measurements or a source acceptance decision.

| View | Reference | Current candidate |
| --- | --- | --- |
| Fleet desktop | [Reference](platform-reference-fleet-desktop.png) | [Light](health-fleet-1440-light.png), [dark](health-fleet-1440-dark.png) |
| Mobile top and project list | [Top](platform-reference-mobile-top.png), [projects](platform-reference-mobile-projects.png) | [Fleet light](health-fleet-390-light.png), [dark](health-fleet-390-dark.png) |
| Project detail | [Reference](platform-reference-project-desktop.png) | [Desktop light](health-project-1440-light.png), [dark](health-project-1440-dark.png); [mobile light](health-project-390-light.png), [dark](health-project-390-dark.png) |
| Source drill-down | — | [390px](health-390-light.png), [dark](health-1440-dark.png) |

The reference provides a compact project table, a needs-attention panel, filter controls, visual run/metric summaries, project sections, engineering levels and environment labels. The candidate adopts the hierarchy and controls while keeping Lighthouse's existing shell and colors. Its only numeric source signal is the bounded GitHub Actions run collection. Engineering level, gates, PRE/PRO/production status, delivery measures, agentic/code quality and resource costs remain unavailable or unknown until source contracts produce them. A run failure is a source observation that merits investigation; it is not a calculated engineering score.

The missing producers are tracked by [engineering gates and levels #179](https://github.com/juangcarmona/lighthouse-control-center/issues/179), [deployment environments #180](https://github.com/juangcarmona/lighthouse-control-center/issues/180), [quality facets #156](https://github.com/juangcarmona/lighthouse-control-center/issues/156), [delivery measures #157](https://github.com/juangcarmona/lighthouse-control-center/issues/157), [adoption and handoffs #158](https://github.com/juangcarmona/lighthouse-control-center/issues/158), and [Actions usage #159](https://github.com/juangcarmona/lighthouse-control-center/issues/159). [#54](https://github.com/juangcarmona/lighthouse-control-center/issues/54) owns shared measurement definitions.

At 390px the reference document reports 945px scroll width and clips table columns. The candidate's browser checks require no page overflow at 390px and keep each evidence field visible by stacking rows. Fixture captures are labelled demonstration data. The owner accepted the current presentation and bounded connected-user observation on 2026-11-13; the captures and source limits are recorded in the [acceptance evidence](README.md). This acceptance applies to PR #168 at head `5e1ae3f31800628e678ccf58bc365415b3f3b9c2`, merged as `00fc87f08bcd948a7a80732746fd29b7ac2043b9`. Production deployment and the unavailable source families remain separate.
