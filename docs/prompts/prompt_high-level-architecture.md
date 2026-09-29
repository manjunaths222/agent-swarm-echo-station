# Prompt — High-level architecture

This is the source prompt used to generate [../high-level-architecture.md](../high-level-architecture.md). Re-running this prompt against a capable LLM should reproduce an equivalent diagram. This prompt was synthesized from the conversation.

---

Create a simple, easy-to-understand high-level Mermaid diagram for ECHO Station. Show the player interacting with the web game, then choosing between two agent decision paths: a deterministic zero-token simulation and local Ollama agents that decide actions at runtime. Show both paths feeding the same guarded mission engine. The engine must own mission rules, evidence, legal-action validation, shared team memory, and world-state updates. Close the loop by showing the updated mission state returning to the 3D interface. Emphasize that the LLM chooses among allowed actions while the engine remains authoritative. Keep the diagram concise and suitable for a GitHub README or architecture overview.
