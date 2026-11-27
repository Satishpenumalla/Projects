
##  RAG Chatbot

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.4-1C3C3C)
![Chroma](https://img.shields.io/badge/ChromaDB-vector%20store-orange)
![Difficulty](https://img.shields.io/badge/difficulty-beginner_to_mid-green)

Upload PDFs/TXT/CSV, ask questions, get answers that **cite the exact
chunk** they came from — or an honest "I don't know" instead of a guess.

```mermaid
flowchart LR
    A["📄 PDF / TXT / CSV"] --> B["Loader"]
    B --> C["Token-aware<br/>Chunker"]
    C --> D[("Chroma<br/>Vectorstore")]

    Q["❓ Question"] --> R{"Retrieve above<br/>relevance threshold?"}
    D --> R
    R -->|no| N["🤷 I don't know"]
    R -->|yes| L["LLM + cited context"]
    L --> AOK["✅ Cited answer (source + chunk id)"]

    style N fill:#fde8e8,stroke:#e11d48
    style AOK fill:#e6f9ee,stroke:#10b981
```

**Why it earns a resume line:** RAG is *the* in-demand applied-AI skill
right now, and every interviewer has seen the shallow version. This one
has real answers ready for "why token-based chunking, not characters?" and
"how do you know retrieval quality is any good?" — backed by an eval
script that actually measures hit-rate and answer accuracy, not a vibe.

## Payment Gateway

![Node](https://img.shields.io/badge/Node.js-TypeScript-339933?logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-unique%20constraint-4169E1?logo=postgresql&logoColor=white)
![Difficulty](https://img.shields.io/badge/difficulty-mid_to_advanced-orange)

Fire the same charge request 10 times **simultaneously**. Exactly one
charge happens. Everyone gets the identical response back.

```mermaid
sequenceDiagram
    participant C1 as Request A
    participant C2 as Request B (concurrent)
    participant DB as Postgres (unique key)
    participant Pay as Payment Processor

    C1->>DB: INSERT idempotency_key
    C2->>DB: INSERT idempotency_key
    DB-->>C1: ✅ wins the race
    DB--xC2: ❌ unique violation
    C1->>Pay: charge()
    C2->>DB: poll & wait...
    Pay-->>C1: charged ✔
    C1->>DB: mark completed
    DB-->>C2: completed → replay
    Note over C1,C2: Both return 201,<br/>same charge id
```

**Why it earns a resume line:** the only pure-backend, non-AI project
here — proof you're more than "did some AI stuff." Idempotency keys and
race-safe writes are a real interview topic at any company touching
payments or webhooks, and this one is *load-tested*: 20 concurrent calls
in, exactly 1 charge out, verified against a real Postgres instance.


## URL Shortener

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-cache%20%2B%20rate%20limit-DC382D?logo=redis&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)
![Difficulty](https://img.shields.io/badge/difficulty-mid-yellow)

Short links with click analytics, QR codes, expiration, and rate limiting
— the classic "design a URL shortener" interview question, actually built
and load-tested.

```mermaid
flowchart LR
    R["🔗 GET /:slug"] --> C{"Redis<br/>cache hit?"}
    C -->|"yes ⚡ ~2ms"| RD["302 redirect"]
    C -->|no| PG[("Postgres")]
    PG --> POP["populate cache<br/><sub>TTL = expiresAt</sub>"]
    POP --> RD
    RD -. async, non-blocking .-> LOG["📊 log click + geo"]

    style RD fill:#e6f9ee,stroke:#10b981
    style C fill:#f5f0ff,stroke:#8b5cf6
```

**Why it earns a resume line:** maps almost exactly onto a real system-
design interview question, so you've *built and measured* the thing
people usually only whiteboard. Proof, not claims: **1.9ms** average
cache-hit redirect latency measured live, and 30 concurrent link-creation
requests against a limit of 10 letting through *exactly* 10 — the number
that proves the rate limiter's atomicity, not just "usually correct."

## Job Application Tracker

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-background%20jobs-DC382D?logo=redis&logoColor=white)
![OAuth](https://img.shields.io/badge/GitHub%20OAuth-from%20scratch-181717?logo=github&logoColor=white)
![Difficulty](https://img.shields.io/badge/difficulty-mid_to_advanced-orange)

Applications move through a real, validated status pipeline with
background email reminders — behind real auth: email/password **and**
"Sign in with GitHub," both built from the actual protocol.

```mermaid
sequenceDiagram
    participant U as User
    participant App
    participant GH as GitHub
    participant DB as Postgres

    U->>App: "Sign in with GitHub"
    App-->>U: redirect + state cookie (CSRF)
    U->>GH: authorize
    GH->>App: callback?code&state
    App->>App: verify state matches
    App->>GH: exchange code → access_token
    App->>GH: fetch verified profile
    App->>DB: find-or-create user
    App-->>U: session JWT (httpOnly cookie)
```

```mermaid
stateDiagram-v2
    [*] --> Applied
    Applied --> Screening
    Applied --> Rejected
    Screening --> Interview
    Screening --> Rejected
    Interview --> Offer
    Interview --> Rejected
    Offer --> Rejected: withdrawn/declined
    Rejected --> [*]
    Offer --> [*]
```

**Why it earns a resume line:** the least flashy idea, the most real
software. The only project here with an OAuth2 flow built step-by-step
against GitHub's actual API (not a library configured to do it
invisibly), a real background job queue for scheduled reminders, and two
independently-tested access-control layers — ownership checks *and* a
role-gated admin view, including a test proving one user genuinely cannot
edit another user's data. The status pipeline is a real state machine with
a full audit trail, which is also what makes its funnel analytics correct.

---

## 🚀 Running any project

```bash
cd projects/0N-project-name

# Python projects
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements-dev.txt
# Node projects
npm install

cp .env.example .env   # fill in whatever credentials that project needs
pytest   # or: npm test
```

Projects using Postgres/Redis (**2**, **6**, **7**) ship a
`docker-compose.yml` — `docker compose up -d` and you have a working
database with nothing installed locally.

## 📄 License

MIT — see [LICENSE](LICENSE).
