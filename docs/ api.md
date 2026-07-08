# 🔌 API Endpoint Flow

The Healthcare Knowledge Base system exposes RESTful APIs that allow the frontend application, HMIS chatbot widget, and administrators to communicate with the backend services.

The API layer is responsible for:

- User authentication using JWT tokens
- Secure access control through roles
- Knowledge base article management
- Search functionality
- AI chatbot communication
- User feedback collection
- Administrative analytics

## API Request Lifecycle

The request flow follows this process:

1. User or HMIS chatbot sends a request
2. Authentication endpoint validates user credentials
3. Backend returns JWT access token
4. Token is attached to protected API requests
5. Backend processes the request
6. Data is retrieved or stored in PostgreSQL database
7. Response is returned to the client

```mermaid
flowchart TB


    USER["👤 User / HMIS Chatbot Widget"]


    subgraph AUTH["🔐 Authentication Service"]

        A1["POST /auth/login<br/>User Login"]

        A2["JWT Token Response<br/>Access Token"]

    end



    subgraph ARTICLES["📚 Article Management APIs"]

        B1["GET /articles<br/>List Articles"]

        B2["GET /articles/:slug<br/>View Article"]

        B3["POST /articles<br/>Create Article"]

        B4["PUT /articles/:id<br/>Update Article"]

        B5["DELETE /articles/:id<br/>Delete Article"]

        B6["PUT /articles/publish/:id<br/>Publish Article"]

    end



    subgraph SEARCH["🤖 Search & AI Chat APIs"]

        C1["GET /search?q=query<br/>Knowledge Search"]

        C2["POST /chat<br/>AI Chatbot Query"]

        C3["POST /feedback<br/>Article Feedback"]

    end



    subgraph ADMIN["👑 Admin APIs"]

        D1["GET /admin/dashboard<br/>Analytics Dashboard"]

        D2["GET /admin/users<br/>Manage Users"]

    end



    subgraph CATEGORY["📂 Category APIs"]

        E1["GET /categories<br/>List Categories"]

    end



    USER -->|"Login Request"| A1


    A1 -->|"Validate Credentials"| A2



    A2 --> B1

    A2 --> B2

    A2 --> B3

    A2 --> B4

    A2 --> B5

    A2 --> B6



    A2 --> C1

    A2 --> C2

    A2 --> C3



    A2 --> D1

    A2 --> D2



    A2 --> E1




    classDef auth fill:#ffebee,stroke:#b71c1c,stroke-width:3px,color:#000

    classDef article fill:#e8f5e9,stroke:#1b5e20,stroke-width:3px,color:#000

    classDef search fill:#fff3e0,stroke:#e65100,stroke-width:3px,color:#000

    classDef admin fill:#f3e5f5,stroke:#4a148c,stroke-width:3px,color:#000

    classDef category fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000



    class A1,A2 auth

    class B1,B2,B3,B4,B5,B6 article

    class C1,C2,C3 search

    class D1,D2 admin

    class E1 category
```

---
