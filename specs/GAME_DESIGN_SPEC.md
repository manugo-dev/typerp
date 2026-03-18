# GAME_DESIGN_SPEC.md

## TypeRP Framework — High-Level Game Design and Systems Specification

Status: complementary document  
Project: `typerp`

---

## 1. Purpose

This document captures the medium/long-term gameplay vision, systemic design principles, and future
gameplay directions for TypeRP Framework.

It must not be confused with `ARCH_SPEC.md`.

`ARCH_SPEC.md` governs:

- technical architecture
- build/runtime
- base modules
- tsconfig
- manifests
- tooling
- developer experience
- boundaries

`GAME_DESIGN_SPEC.md` governs:

- high-level gameplay systems vision
- economy
- crime and justice
- social systems
- progression
- territories
- long-term gameplay loops

Rule:

- The AI agent must not try to implement everything in this document during the early phases unless
  a phase explicitly asks for it.
- The technical architecture must remain compatible with these future directions.

---

## 2. General game design philosophy

TypeRP Framework should aim for systemic, deep, modular, configurable roleplay.

Principles:

- systems-driven roleplay, not just menus and commands
- persistent consequences
- meaningful economy
- persistent identity
- crime, law, and evidence with systemic weight
- decisions with cost, maintenance, and wear
- tools for serious RP servers, not just superficial templates

The framework architecture must allow:

- enabling/disabling systems
- adjusting depth per server
- configuring local rules
- expanding with third-party modules

---

## 3. Implementation priority

Even though this document describes a broad vision, the first project phases must focus on the
technical foundation.

Correct order:

1. solid technical platform
2. kernel, modules, contracts, runtime
3. representative basic modules
4. compatibility and extensibility
5. advanced gameplay systems incrementally

This document does not require all of these systems to be implemented in v1.

---

## 4. Moderation, toxicity, and social governance systems

### 4.1. Goal

The framework should be able to evolve toward richer social governance and moderation tools beyond
simple ban/kick actions.

### 4.2. Future direction

Possible lines of evolution:

- structured toxic behavior records
- report history
- staff tools
- reputation or social risk per character/account if the server wants it
- integration with sanction and internal justice systems

### 4.3. Restriction

This must not be implemented as a complex system in early phases unless explicitly requested.

### 4.4. Architectural requirement

The architecture must leave room for:

- auditing
- moderation events
- structured logs
- future administrative tools

---

## 5. Penal system, justice, and jail

### 5.1. Goal

TypeRP Framework should support a meaningful penal system where justice is not just an
administrative command.

### 5.2. Future direction

The framework should be able to evolve toward:

- formal arrests
- charges
- evidence linked to cases
- sentence durations
- criminal history
- fines and sanctions
- possible court processes depending on the server

### 5.3. Configurability

Servers must be able to simplify or deepen this system.

### 5.4. Architectural requirement

The architecture must allow:

- persistent state per case
- attaching evidence and records
- hooks for police, EMS, judges, lawyers, or staff

---

## 6. Forensic evidence and investigation

### 6.1. Goal

The framework should support more systemic criminal investigation.

### 6.2. Future direction

Examples of possible evolution:

- physical or digital evidence
- linking events and characters
- history of relevant objects
- logs or traces queryable through gameplay
- tools for police/forensics

### 6.3. Restriction

This is not an early implementation requirement, but it is a direction the architecture must remain
compatible with.

### 6.4. Derived technical requirement

It is desirable to preserve the possibility of:

- journaling
- event history
- references to persistent entities
- relationships between cases, people, and objects

---

## 7. Multicharacter and identity persistence

### 7.1. Goal

TypeRP Framework should support multiple characters per user/account if the server wants it.

### 7.2. Future direction

The system should be able to support:

- one account with multiple characters
- separate identities
- per-character history
- per-character permissions or restrictions
- inventory, economy, and profession per character

### 7.3. Architectural requirement

Identity must not be modeled so rigidly that multicharacter becomes impossible later.

---

## 8. NPC fallback and systemic resilience

### 8.1. Goal

The framework should be able to evolve toward systems where certain functions continue operating
even when not enough players are present in key roles.

### 8.2. Examples

- NPC fallback for certain services
- minimal automation of essential functions
- graceful degradation of complex social systems

### 8.3. Restriction

This is not implemented from the start unless a specific phase requires it.

### 8.4. Architectural requirement

The modular design must not always assume constant human presence in every role.

---

## 9. Territorial control, influence, and world persistence

### 9.1. Goal

TypeRP Framework should support medium/long-term territorial systems.

### 9.2. Future direction

- zone control
- faction influence
- maintenance of control
- decay or progressive loss
- conflict over resources or services

### 9.3. Architectural requirement

World and zone architecture must not be closed in a way that later prevents:

- persistent ownership
- influence scoring
- per-zone rules
- conflict and degradation hooks

---

## 10. Expropriation, abandonment, and property/asset maintenance

### 10.1. Goal

The framework should be able to evolve toward systems where properties, businesses, or assets are
not infinitely static.

### 10.2. Future direction

- upkeep/maintenance
- abandonment
- expropriation or repossession for non-payment
- market recovery
- related economic or legal sanctions

### 10.3. Architectural requirement

Ownership models must be rich enough to support future states and transitions.

---

## 11. Economy, weight, scarcity, and systemic friction

### 11.1. Goal

The framework economy should be able to evolve toward a system with real weight, maintenance, and
friction, not just numbers without consequences.

### 11.2. Future direction

- money with traceability
- recurring costs
- scarcity
- risk
- economic sinks
- inventory with weight/volume or an equivalent restriction
- degradation or maintenance of goods

### 11.3. Architectural requirement

Economy and inventory must be modeled in a way that allows deeper evolution later.

---

## 12. Game design modularity

All systems in this document must be designed to be configurable and, where reasonable, modular.

Servers should be able to:

- enable/disable systems
- simplify depth
- change local rules
- replace modules with custom variants

---

## 13. Requirements for technical architecture

Even though this document does not require immediate implementation of these systems, the technical
architecture must avoid decisions that make them impossible or extremely expensive to add later.

It must especially preserve room for:

- journaling / histories
- persistent ownership
- strong per-character identity
- referencable entities
- evidence and case systems
- legal and social states
- extensible i18n and UX
- compatibility with future administrative panels

---

## 14. Priority rule for AI agent

If the AI agent is working on early technical phases, it must use this document only as future
compatibility guidance, not as an instruction to implement all of these systems immediately.

The early priority remains:

- base architecture
- correct runtime
- small core
- example modules
- contracts
- config
- build/dev/watch
- future growth compatibility
