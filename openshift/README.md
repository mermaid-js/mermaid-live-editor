# mermaid — Helm Chart for OpenShift

Deploys the [Mermaid Live Editor](https://github.com/mermaid-js/mermaid-live-editor) on an OpenShift cluster.

## Prerequisites

- OpenShift 4.x (OCP or OKD)
- Helm 3.x
- `oc` CLI logged in with `edit` permissions on the target namespace

## Installation

```bash
# Create a project (namespace) - skip if using an existing namespace
oc new-project <namespace>

# Install with defaults (Route enabled, TLS edge)
# In the directory where Chart.yaml is located
helm install mermaid . -n <namespace>
```

## Upgrade

```bash
helm upgrade mermaid .-n <namespace>
```

## Uninstall

```bash
helm uninstall mermaid -n <namespace>
```

## Troubleshooting

```bash
# Check SCC assignment
oc get pod -n <namespace> -o jsonpath='{.items[*].metadata.annotations.openshift\.io/scc}'

# Describe the route
oc describe route mermaid -n <namespace>

# View events
oc get events -n <namespace> --sort-by='.lastTimestamp'
```
