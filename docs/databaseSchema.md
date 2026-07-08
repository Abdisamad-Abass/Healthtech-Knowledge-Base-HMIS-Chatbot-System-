# 🗄 Database Schema

The Healthcare Knowledge Base system uses a relational PostgreSQL database managed through Prisma ORM.

The schema supports:

- User authentication and RBAC
- Article management
- Version control
- Categories and tags
- Search analytics
- Chatbot conversations
- AI embeddings with pgvector
- Audit tracking

```mermaid
erDiagram


    USERS ||--o{ ARTICLES : creates
    USERS ||--o{ FEEDBACK : submits
    USERS ||--o{ SEARCH_LOGS : performs
    USERS ||--o{ AUDIT_LOGS : generates
    USERS ||--o{ MEDIA : uploads


    CATEGORIES ||--o{ ARTICLES : contains
    CATEGORIES ||--o{ CATEGORIES : parent


    ARTICLES ||--o{ ARTICLE_VERSIONS : has
    ARTICLES ||--o{ ARTICLE_TAGS : uses
    TAGS ||--o{ ARTICLE_TAGS : assigned


    ARTICLES ||--o{ FEEDBACK : receives
    ARTICLES ||--o{ MEDIA : contains
    ARTICLES ||--|| ARTICLE_EMBEDDINGS : vectorized


    USERS ||--o{ CHAT_SESSIONS : owns

    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : contains

    CHAT_SESSIONS ||--o{ UNANSWERED_QUESTIONS : tracks



    USERS {

        uuid id PK

        varchar name

        varchar email

        varchar password_hash

        enum role

        varchar department

        timestamp created_at

    }


    CATEGORIES {

        uuid id PK

        varchar name

        varchar slug

        uuid parent_id FK

        text description

    }


    ARTICLES {

        uuid id PK

        varchar title

        varchar slug

        text content

        enum type

        enum status

        uuid category_id FK

        uuid author_id FK

        int views

        timestamp published_at

    }


    ARTICLE_VERSIONS {

        uuid id PK

        uuid article_id FK

        varchar title

        text content

        int version

    }


    TAGS {

        uuid id PK

        varchar name

        varchar slug

    }


    ARTICLE_TAGS {

        uuid article_id FK

        uuid tag_id FK

    }


    FEEDBACK {

        uuid id PK

        uuid article_id FK

        uuid user_id FK

        int rating

        text comment

    }


    MEDIA {

        uuid id PK

        uuid article_id FK

        varchar filename

        varchar url

        varchar type

    }


    SEARCH_LOGS {

        uuid id PK

        varchar query

        int results_count

        uuid user_id FK

    }


    AUDIT_LOGS {

        uuid id PK

        varchar action

        varchar entity

        varchar entity_id

        json details

    }


    CHAT_SESSIONS {

        uuid id PK

        uuid user_id FK

        varchar title

    }


    CHAT_MESSAGES {

        uuid id PK

        uuid session_id FK

        text question

        text answer

        json sources

    }


    ARTICLE_EMBEDDINGS {

        uuid id PK

        uuid article_id FK

        text content

        vector embedding

    }


    UNANSWERED_QUESTIONS {

        uuid id PK

        text question

        uuid session_id FK

        boolean resolved

    }
```

---
