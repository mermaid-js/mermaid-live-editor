module.exports = {
  "Site Loads": {
    "Check Home page load": {
      "1": "{\"code\":\"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n  \",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"updateEditor\":true,\"autoSync\":true,\"updateDiagram\":true}"
    },
    "Check Redirect from old URL": {
      "1": "{\"code\":\"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"updateEditor\":false,\"autoSync\":true,\"updateDiagram\":false}"
    }
  },
  "__version": "7.4.0",
  "Auto sync tests": {
    "should dim diagram when code is edited": {
      "1": "{\"code\":\"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n    C --> Test\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"updateEditor\":false,\"autoSync\":false,\"updateDiagram\":false}"
    },
    "should not dim diagram when code is in sync": {
      "1": "{\"code\":\"graph TD\\n    A[Christmas] -->|Get money| B(Go shopping)\\n    B --> C{Let me think}\\n    C -->|One| D[Laptop]\\n    C -->|Two| E[iPhone]\\n    C -->|Three| F[fa:fa-car Car]\\n    C --> Testing\",\"mermaid\":\"{\\n  \\\"theme\\\": \\\"default\\\"\\n}\",\"updateEditor\":false,\"autoSync\":true,\"updateDiagram\":false}"
    }
  }
}
