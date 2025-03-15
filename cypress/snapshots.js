module.exports = {
  "Site Loads": {
    "Check Home page load": {
      "1": "{\"code\":\"flowchart TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n  \",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"autoSync\":true,\"rough\":false,\"updateDiagram\":true,\"panZoom\":false}"
    },
    "Check Redirect from old URL": {
      "1": "{\"code\":\"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"autoSync\":true,\"updateDiagram\":true}"
    },
    "should load diagram from gist": {
      "1": "{\"code\":\"graph TD\\n    A[Party] -->|Get money| B(Go shopping!!)\\n    \",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"forest\\\",\\n  \\\"test\\\": \\\"hello world\\\"\\n}\",\"autoSync\":true,\"updateDiagram\":true,\"loader\":{\"type\":\"gist\",\"config\":{\"url\":\"https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a\"}}}"
    },
    "should load diagram from gist revision": {
      "1": "{\"code\":\"graph TD\\n    A[Party] -->|Get money| B(Go shopping)\\n    \",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"forest\\\",\\n  \\\"test\\\": \\\"hello\\\"\\n}\",\"autoSync\":true,\"updateDiagram\":true,\"loader\":{\"type\":\"gist\",\"config\":{\"url\":\"https://gist.github.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/ec9b4ab0e41e4ff6287326cd3cb47affd7851e19\"}}}"
    },
    "should load diagram from raw files": {
      "1": "{\"code\":\"graph TD\\n    A[Party] -->|Get money| B(Go shopping!!)\\n    \",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"forest\\\",\\n  \\\"test\\\": \\\"hello world\\\"\\n}\",\"autoSync\":true,\"updateDiagram\":true,\"loader\":{\"type\":\"files\",\"config\":{\"codeURL\":\"https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/code.mmd\",\"configURL\":\"https://gist.githubusercontent.com/sidharthv96/6268a23e673a533dcb198f241fd7012a/raw/4eb03887e6a41397e80bdcdbf94017c498f8f1e2/config.json\"}}}"
    }
  },
  "__version": "12.17.4",
  "Auto sync tests": {
    "should dim diagram when code is edited": {
      "1": "{\"code\":\"flowchart TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n    C --> Test\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"autoSync\":false,\"rough\":false,\"updateDiagram\":false,\"panZoom\":false}"
    },
    "should not dim diagram when code is in sync": {
      "1": "{\"code\":\"flowchart TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n    C --> Testing\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"autoSync\":true,\"rough\":false,\"updateDiagram\":false,\"panZoom\":false}"
    }
  },
  "Test themes": {
    "should set light theme as default": {
      "1": "{\"theme\":\"light\",\"isDark\":false}"
    },
    "should change themes when clicked": {
      "1": "{\"theme\":\"cupcake\",\"isDark\":false}"
    },
    "should set dark theme as default": {
      "1": "{\"theme\":\"dark\",\"isDark\":true}"
    },
    "Test light themes": {
      "should set light theme as default": {
        "1": "{\"theme\":\"light\",\"isDark\":false}"
      },
      "should change themes when clicked": {
        "1": "{\"theme\":\"cupcake\",\"isDark\":false}"
      }
    },
    "Test dark mode": {
      "should set dark theme as default": {
        "1": "{\"theme\":\"dark\",\"isDark\":true}"
      }
    }
  }
}
