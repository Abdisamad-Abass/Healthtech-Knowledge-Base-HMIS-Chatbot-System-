# 💬 Chat Controller Flowchart

## Overview

This flowchart illustrates the complete request lifecycle of the **Chat Controller** in the Healthcare Knowledge Base system. It shows how user questions are processed, beginning with request validation, session management, greeting detection, Retrieval-Augmented Generation (RAG) search, Groq Large Language Model (LLM) response generation, analytics logging, and finally returning the response to the user.

The flow also includes the fallback mechanism for unanswered questions, performance timing metrics, and session updates, providing a complete view of the chatbot's backend processing pipeline.

---

## Flowchart

```mermaid
flowchart TD
    Start([User sends question]) --> ChatEndpoint[POST /api/v1/chat]

    ChatEndpoint --> Validate{Question provided?}
    Validate -->|No| Error400[400 Bad Request]
    Validate -->|Yes| TotalStart[Start timer]

    TotalStart --> CheckSession{Session ID provided?}

    CheckSession -->|Yes| FindSession[Find existing session]
    CheckSession -->|No| CreateSession[Create new session]

    FindSession --> SessionExists{Session exists?}
    SessionExists -->|No| CreateSession
    SessionExists -->|Yes| CheckGreeting

    CreateSession --> CheckGreeting{Is greeting?<br/>hi, hello, hey, etc.}

    CheckGreeting -->|Yes| GreetingFlow[Greeting Flow]
    CheckGreeting -->|No| EmbeddingFlow[Embedding Flow]

    %% GREETING FLOW
    GreetingFlow --> GreetingResponse[Return greeting message]
    GreetingResponse --> SaveGreeting[Save chat message]
    SaveGreeting --> LogGreeting[Log analytics<br/>model: Greeting]
    LogGreeting --> ReturnGreeting[Return JSON response]

    %% EMBEDDING FLOW
    EmbeddingFlow --> EmbeddingStart[Start embedding timer]
    EmbeddingStart --> CreateEmbedding[Create embedding<br/>using all-MiniLM-L6-v2]
    CreateEmbedding --> EmbeddingEnd[Stop embedding timer]
    EmbeddingEnd --> VectorConvert[Convert to pgvector format]

    VectorConvert --> RAGSearch[RAG Search]

    subgraph RAG[Retrieval-Augmented Generation]
        RAGSearch --> VectorQuery[Vector similarity search]
        VectorQuery --> QuerySQL[SQL Query:<br/>SELECT articleId, content, title<br/>FROM ArticleEmbedding<br/>JOIN Article<br/>WHERE status='PUBLISHED'<br/>ORDER BY distance<br/>LIMIT 5]
        QuerySQL --> FilterResults[Filter by MAX_DISTANCE = 0.75]
    end

    FilterResults --> HasResults{Results found?}

    HasResults -->|No| NoAnswerFlow[No Answer Flow]
    HasResults -->|Yes| BuildContext[Build context from results]

    %% NO ANSWER FLOW
    NoAnswerFlow --> NoAnswerResponse[Return fallback message:<br/>"I could not find this information..."]
    NoAnswerResponse --> SaveNoAnswer[Save unanswered question]
    SaveNoAnswer --> LogNoAnswer[Log analytics<br/>answerFound: false<br/>fallbackUsed: true]
    LogNoAnswer --> ReturnNoAnswer[Return JSON response]

    %% CONTEXT BUILDING
    BuildContext --> FormatContext[Format context with:<br/>SOURCE n<br/>TITLE<br/>TYPE<br/>CONTENT]
    FormatContext --> LLMStart[Start LLM timer]

    LLMStart --> CallGroq[Call Groq API<br/>llama-3.1-8b-instant]

    subgraph Groq[Groq LLM Processing]
        CallGroq --> SystemPrompt[System Prompt Rules:<br/>1. Answer ONLY using supplied knowledge<br/>2. Never guess or hallucinate<br/>3. Include citations<br/>4. Return JSON format]
        SystemPrompt --> UserPrompt[User Prompt:<br/>Knowledge Base + Question]
        UserPrompt --> ParseResponse[Parse JSON response]
        ParseResponse --> ExtractFields[Extract:<br/>answer<br/>citations<br/>confidence]
    end

    ExtractFields --> LLMEnd[Stop LLM timer]

    LLMEnd --> DetermineAnswer{Answer found?<br/>confidence HIGH/MEDIUM}

    DetermineAnswer -->|No| SaveUnanswered[Save unanswered question<br/>with reason]
    DetermineAnswer -->|Yes| ProcessAnswer[Process answer]

    SaveUnanswered --> LogAnalytics

    ProcessAnswer --> LogAnalytics[Log Chat Analytics]

    subgraph Analytics[Analytics Logging]
        LogAnalytics --> LogFields[Fields:<br/>sessionId<br/>userId<br/>question<br/>answerFound<br/>fallbackUsed<br/>articlesRetrieved<br/>citationsReturned<br/>confidence<br/>embeddingTime<br/>retrievalTime<br/>llmTime<br/>responseTime<br/>model]
    end

    LogFields --> SaveMessage[Save chat message]
    SaveMessage --> UpdateSession[Update session:<br/>lastMessageAt<br/>totalMessages++]
    UpdateSession --> ReturnResponse[Return JSON response:<br/>answer<br/>confidence<br/>responseTime<br/>citations<br/>sessionId]

    %% STYLING
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef database fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef error fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    classDef success fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px

    class ChatEndpoint,Validate,CheckSession,FindSession,CreateSession,CheckGreeting process
    class GreetingFlow,EmbeddingFlow,RAGSearch,BuildContext,FormatContext decision
    class EmbeddingStart,CreateEmbedding,EmbeddingEnd,VectorConvert,VectorQuery,FilterResults database
    class CallGroq,LLMStart,LLMEnd,ExtractFields external
    class LogAnalytics,LogFields,SaveMessage,UpdateSession process
    class Error400,ReturnNoAnswer error
    class ReturnGreeting,ReturnResponse success
```

---
