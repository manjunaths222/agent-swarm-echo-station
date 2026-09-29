# ECHO Station high-level architecture

This diagram shows how the game supports both a free, repeatable simulation and live local-agent decisions through Ollama. Both modes use the same mission engine, so every action is checked against the same evidence, dependencies, and world rules.

- The player starts and watches a mission in the web interface.
- Simulation mode follows authored policies and uses no model tokens.
- Ollama mode lets four local LLM agents choose actions from a safe, dynamically generated menu.
- The mission engine validates every choice and returns the updated world state to the interface.

```mermaid
---
title: ECHO Station — High-level architecture
---
flowchart TB
    Player[Player] --> UI[3D Web Game<br/>Mission control and team activity]

    UI --> Choice{Decision mode}

    Choice -->|Simulation| Rules[Rule-based agent policy<br/>Repeatable · zero tokens]
    Choice -->|Ollama| Agents[Four local LLM agents<br/>Decide from current evidence]

    Agents --> Menu[Allowed-action menu<br/>Inspect · Share · Operate · Exit]

    Rules --> Engine[Mission Engine]
    Menu --> Engine

    Engine --> Guard[Validate action and dependencies]
    Guard --> State[Update evidence, team memory,<br/>devices, failures, and progress]
    State --> UI

    classDef player fill:#ffffff,stroke:#52606d,color:#17202a;
    classDef interface fill:#e8f5ff,stroke:#247ba0,color:#102a43;
    classDef decision fill:#fff4d6,stroke:#c98b00,color:#513b00;
    classDef engine fill:#e8f8ed,stroke:#2f855a,color:#173f2b;
    class Player player;
    class UI interface;
    class Choice,Rules,Agents,Menu decision;
    class Engine,Guard,State engine;
```

The LLM controls the **decision**, while the mission engine controls what is **possible** and what each action **changes**. This keeps local-agent behavior flexible without allowing invented actions to bypass the game.

## Source prompt

[View the prompt used to generate this diagram](prompts/prompt_high-level-architecture.md).
