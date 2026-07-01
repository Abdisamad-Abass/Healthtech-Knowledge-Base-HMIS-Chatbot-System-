# 🏥 Healthcare Knowledge Base & HMIS Chatbot System

![Project Banner](docs/images/banner.png)

A production-ready **Healthcare Knowledge Base (KB) Platform** integrated with an **AI-powered HMIS Chatbot Assistant**.

The platform provides a centralized repository for:

- 📚 Healthcare documentation
- 📄 SOPs
- ❓ FAQs
- 🩺 Clinical workflows
- ⚙️ HMIS troubleshooting guides
- 🚀 Product release notes

Built for healthcare workers, system administrators, support teams, and new staff onboarding.

---

# 🚀 Capstone Project

## Healthcare Knowledge Base Platform for HMIS & Healthcare Products

This project focuses on designing and developing a secure knowledge management system with an embedded chatbot that enables users to quickly access verified healthcare information.

---

# ✨ Core Features

## 🔐 Authentication & RBAC

- JWT Authentication
- bcrypt password encryption
- Role-Based Access Control

Roles:

| Role      | Access                                    |
| --------- | ----------------------------------------- |
| 👤 Viewer | Read published articles                   |
| ✍️ Editor | Create and update articles                |
| 👑 Admin  | Publish articles, manage users, analytics |

---

## 📚 Knowledge Base Management

Implemented:

✅ Article CRUD operations  
✅ Draft & publishing workflow  
✅ Categories  
✅ Tags  
✅ Search engine  
✅ Feedback system  
✅ Analytics dashboard

Supported content:

- How-To Guides
- SOP Documents
- FAQs
- Troubleshooting Guides
- Feature References
- Release Notes

---

# 🤖 HMIS AI Chatbot Widget

The system includes an embeddable floating chatbot widget.

Flow:

```
User Question

      ↓

Chat Widget

      ↓

Backend API

      ↓

Knowledge Search

      ↓

AI Response

      ↓

Source Article
```

Features:

- 💬 Floating chat interface
- 🔎 Knowledge retrieval
- 🤖 AI powered answers
- 🔗 Article references
- 🌐 Cross-origin support

---

# 🛠 Technology Stack

# 🛠️ Tech Stack

## 🎨 Frontend

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![React Icons](https://img.shields.io/badge/React_Icons-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

---

## ⚙️ Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge)
![Helmet](https://img.shields.io/badge/Helmet.js-000000?style=for-the-badge)
![CORS](https://img.shields.io/badge/CORS-FF6B6B?style=for-the-badge)
![Morgan](https://img.shields.io/badge/Morgan-8A2BE2?style=for-the-badge)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=black)

---

## 🤖 AI / RAG Stack

![Groq](https://img.shields.io/badge/Groq_AI-000000?style=for-the-badge)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FCC72B?style=for-the-badge&logo=huggingface&logoColor=black)
![Transformers.js](https://img.shields.io/badge/Transformers.js-FFCA28?style=for-the-badge)

---

## 🗄 Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma Migrations](https://img.shields.io/badge/Prisma_Migrations-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

---

## 🚀 Deployment

![Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

# 🏗 System Architecture

![System Architecture](docs/images/system-architecture.png)

## High-Level Architecture Overview

The HealthTech Knowledge Base AI Assistant follows a layered architecture design combining:

- Next.js frontend application
- Express.js REST API backend
- Secure authentication layer
- Knowledge management services
- AI-powered RAG chatbot pipeline
- PostgreSQL + pgvector storage
- Cloud deployment infrastructure

## Architecture Flow

```mermaid
flowchart TB

    subgraph CLIENT["👥 Client Layer"]
        A["Healthcare Worker<br/>Web Browser"]
        B["HMIS External Application"]
        C["Admin Dashboard<br/>Next.js"]
    end


    subgraph FRONTEND["🎨 Frontend Layer"]
        D["Knowledge Base UI<br/>Next.js 16 + TypeScript"]
        E["Chatbot Widget<br/>Embeddable iframe/script"]
    end


    subgraph API["⚙️ API Layer"]
        F["Express.js 5 API<br/>REST API v1"]
        G["Authentication<br/>JWT + bcrypt"]
        H["Rate Limiter<br/>Security Protection"]
    end


    subgraph SERVICES["🧠 Core Services"]
        I["Article Service<br/>CRUD + Publishing"]
        J["Search Service<br/>Full Text Search"]
        K["Chat Service<br/>RAG Question Answering"]
        L["User Service<br/>RBAC Management"]
        M["Analytics Service<br/>Metrics & Logs"]
    end


    subgraph AI["🤖 AI Layer"]
        N["Groq AI Service<br/>LLM Response Generation"]
        O["Embedding Service<br/>HuggingFace + pgvector"]
    end


    subgraph DATA["🗄 Database Layer"]
        P["PostgreSQL Database<br/>Prisma ORM"]
        Q["pgvector<br/>Vector Similarity Search"]
        R["Redis Cache<br/>Session Cache"]
        S["Search Index"]
    end


    subgraph DEPLOY["🚀 Deployment"]
        T["Backend Server<br/>Node.js + Express"]
        U["Frontend Hosting<br/>Next.js"]
    end


    %% Main Flow

    A --> D
    B --> E
    C --> D


    D --> F
    E --> F


    F --> G
    F --> H


    G --> I
    G --> J
    G --> K
    G --> L
    G --> M


    K --> N
    K --> O
    J --> O


    I --> P
    I --> S

    J --> P
    J --> S

    K --> P
    K --> Q
    K --> R

    L --> P
    M --> P


    T --> P
    T --> S

    U --> T



    %% GitHub Compatible Styling

    classDef client fill:#90CAF9,stroke:#0D47A1,color:#000,stroke-width:3px;

    classDef frontend fill:#CE93D8,stroke:#4A148C,color:#000,stroke-width:3px;

    classDef api fill:#FFCC80,stroke:#E65100,color:#000,stroke-width:3px;

    classDef service fill:#A5D6A7,stroke:#1B5E20,color:#000,stroke-width:3px;

    classDef ai fill:#F48FB1,stroke:#880E4F,color:#000,stroke-width:3px;

    classDef data fill:#FFF59D,stroke:#F57F17,color:#000,stroke-width:3px;

    classDef deploy fill:#80DEEA,stroke:#006064,color:#000,stroke-width:3px;



    class A,B,C client;

    class D,E frontend;

    class F,G,H api;

    class I,J,K,L,M service;

    class N,O ai;

    class P,Q,R,S data;

    class T,U deploy;

```

---

# 🔄 System Flow

## End-to-End Request Flow

The HealthTech Knowledge Base AI Assistant follows this workflow:

1. User interacts with the Next.js application or HMIS chatbot widget
2. Frontend sends requests through REST API endpoints
3. Express.js validates authentication and authorization
4. RAG service retrieves relevant knowledge using embeddings
5. PostgreSQL + pgvector performs similarity search
6. AI service generates the final response
7. Response is returned back to the user

```mermaid
flowchart LR

    subgraph EXTERNAL["🌐 External Layer"]
        USER["👤 End User"]
        HMIS["🏥 HMIS System"]
    end


    subgraph FRONTEND["🎨 Frontend Layer"]
        UI["📱 Next.js Application"]
        WID["💬 Chatbot Widget"]
    end


    subgraph BACKEND["⚡ Backend Layer"]
        API["Express.js API<br/>REST Endpoints"]
        AUTH["🔐 JWT Authentication"]
        RAG["🤖 RAG Service<br/>Groq + Embeddings"]
    end


    subgraph DATABASE["🗄 Data Layer"]
        DB["PostgreSQL Database<br/>Prisma ORM"]
        VEC["pgvector<br/>Vector Store"]
    end



    USER -->|"Browse / Manage"| UI

    HMIS -->|"Embed Widget"| WID


    UI -->|"API Requests"| API

    WID -->|"POST /api/v1/chat"| API


    API -->|"Validate Token"| AUTH

    AUTH -->|"Authorize Request"| RAG


    RAG -->|"Query Knowledge"| DB

    RAG -->|"Similarity Search"| VEC


    RAG -->|"Generate AI Response"| API


    API -->|"Return Response"| UI

    API -->|"Return Response"| WID



    classDef external fill:#90CAF9,stroke:#0D47A1,color:#000,stroke-width:3px;

    classDef frontend fill:#CE93D8,stroke:#4A148C,color:#000,stroke-width:3px;

    classDef backend fill:#FFCC80,stroke:#E65100,color:#000,stroke-width:3px;

    classDef database fill:#FFF59D,stroke:#F57F17,color:#000,stroke-width:3px;



    class USER,HMIS external;

    class UI,WID frontend;

    class API,AUTH,RAG backend;

    class DB,VEC database;
```

---

# 🔄 Component Communication Flow

## Chatbot Request Lifecycle

The following sequence demonstrates how the chatbot request moves across the application layers:

1. User submits a question through the chatbot widget
2. Request is sent to the Express API Gateway
3. Authentication middleware validates the JWT token
4. Chat service retrieves knowledge context
5. pgvector performs semantic similarity search
6. Groq AI generates the final response
7. Chat history and analytics are stored
8. Response is returned with sources

```mermaid
sequenceDiagram

    participant User as 👤 User
    participant Widget as 💬 Chat Widget
    participant Frontend as 🎨 Next.js App
    participant Gateway as ⚡ API Gateway
    participant Auth as 🔐 Auth Service
    participant Chat as 🤖 Chat Service
    participant Groq as 🧠 Groq AI
    participant DB as 🗄 PostgreSQL
    participant Vector as 📊 pgvector


    User->>Widget: Ask Question

    Widget->>Gateway: POST /api/v1/chat


    Gateway->>Auth: Validate JWT

    Auth-->>Gateway: Token Valid


    Gateway->>Chat: Forward Request


    Chat->>DB: Retrieve Article Context

    DB-->>Chat: Knowledge Data


    Chat->>Vector: Similarity Search

    Vector-->>Chat: Relevant Embeddings


    Chat->>Groq: Generate AI Response

    Groq-->>Chat: Generated Answer


    Chat->>DB: Store Chat Log

    DB-->>Chat: Confirmation


    Chat-->>Gateway: Response + Sources

    Gateway-->>Widget: Return Answer

    Widget-->>User: Display Response

```

---

# 🔗 Technology Stack Integration

The system integrates frontend, backend, AI services, database infrastructure, and deployment services into a unified healthcare knowledge management platform.

```mermaid
flowchart LR

    subgraph FRONTEND["🎨 Frontend"]
        NX["Next.js 16"]
        TS["TypeScript"]
        TC["TailwindCSS 4"]
        RI["React Icons"]
    end


    subgraph BACKEND["⚙️ Backend"]
        ND["Node.js"]
        EX["Express.js 5"]
        PR["Prisma ORM"]
        JWT["JWT Authentication"]
        BC["bcrypt Security"]
    end


    subgraph AI["🤖 AI / RAG"]
        GR["Groq API"]
        HF["HuggingFace Embeddings"]
        PGV["pgvector"]
    end


    subgraph DATABASE["🗄 Database"]
        PS["PostgreSQL"]
        RD["Redis Cache"]
        ES["Search Index"]
    end


    subgraph INFRA["🚀 Infrastructure"]
        RN["Render"]
        GH["GitHub"]
        GI["Git"]
    end



    NX --> EX
    TS --> NX
    TC --> NX
    RI --> NX


    EX --> PR
    EX --> JWT
    EX --> BC


    PR --> PS

    EX --> GR

    GR --> PGV

    HF --> PGV

    PGV --> PS


    EX --> RD

    PS --> ES


    RN --> EX
    RN --> NX

    GH --> GI



    classDef frontend fill:#e8f5e9,stroke:#1b5e20,color:#000;
    classDef backend fill:#fff3e0,stroke:#e65100,color:#000;
    classDef ai fill:#fce4ec,stroke:#c62828,color:#000;
    classDef database fill:#fff9c4,stroke:#f57f17,color:#000;
    classDef infra fill:#e1f5fe,stroke:#01579b,color:#000;


    class NX,TS,TC,RI frontend;
    class ND,EX,PR,JWT,BC backend;
    class GR,HF,PGV ai;
    class PS,RD,ES database;
    class RN,GH,GI infra;
```

---

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

# 🚀 Deployment Architecture

The Healthcare Knowledge Base & HMIS Chatbot system uses a cloud-based deployment architecture.

The application is deployed using:

- **GitHub** for source code management and CI/CD workflow
- **Render** for hosting frontend, backend API, and PostgreSQL database
- **Next.js** frontend application
- **Node.js + Express.js** backend API
- **PostgreSQL** managed database

Deployment workflow:

1. Developers push code changes to GitHub repository
2. Render automatically builds and deploys updated services
3. Frontend communicates with backend through REST API
4. Backend connects securely to PostgreSQL database
5. HMIS applications embed the chatbot widget from the frontend

```mermaid
graph TB

    subgraph GitHub["🐙 GitHub Repository"]
        REPO["Healthcare KB Repository<br/>main / development branches"]
    end


    subgraph Render["🚀 Render Cloud Platform"]

        FRONTEND["Frontend Service<br/>Next.js Production Build"]

        BACKEND["Backend API Service<br/>Node.js + Express.js"]

        DATABASE["PostgreSQL Database<br/>Managed Database"]

    end


    subgraph External["🌐 External Users"]

        USER["👥 Healthcare Workers<br/>System Users"]

        HMIS["🏥 HMIS Application<br/>Embedded Chatbot"]

    end



    REPO -->|"Automatic CI/CD Deployment"| FRONTEND

    REPO -->|"Automatic CI/CD Deployment"| BACKEND


    USER -->|"HTTPS Request"| FRONTEND


    HMIS -->|"Load Chat Widget"| FRONTEND


    FRONTEND -->|"REST API Request"| BACKEND


    BACKEND -->|"Prisma ORM Connection"| DATABASE



    classDef github fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000

    classDef render fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000

    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000



    class REPO github

    class FRONTEND,BACKEND,DATABASE render

    class USER,HMIS external
```

---

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

# 🔐 User Roles & Permissions

The Healthcare Knowledge Base system implements **Role-Based Access Control (RBAC)** to ensure users only access features allowed by their assigned role.

The system contains three main roles:

- Viewer
- Editor
- Admin

Permissions are enforced through JWT authentication and backend authorization middleware.

```mermaid
graph TD

    subgraph Viewer["👤 Viewer Role"]
        V1["View Published Articles"]
        V2["Search Knowledge Base"]
        V3["Use AI Chatbot"]
        V4["Submit Article Feedback"]
    end


    subgraph Editor["✍️ Editor Role"]
        E1["All Viewer Permissions"]
        E2["Create Draft Articles"]
        E3["Update Own Articles"]
        E4["Manage Article Content"]
        E5["Submit Articles For Review"]
    end


    subgraph Admin["👑 Admin Role"]
        A1["All Editor Permissions"]
        A2["Publish Articles"]
        A3["Archive/Delete Articles"]
        A4["Manage Users"]
        A5["View Analytics Dashboard"]
        A6["Access Audit Logs"]
    end


    Viewer --> Editor
    Editor --> Admin


    classDef viewer fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000;
    classDef editor fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000;
    classDef admin fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#000;


    class V1,V2,V3,V4 viewer;
    class E1,E2,E3,E4,E5 editor;
    class A1,A2,A3,A4,A5,A6 admin;
```

---

# 📁 Project Structure

```
healthcare-kb-chatbot/


│
├── backend
│
│── config
│   └── database.js
│
│── controllers
│   ├── articleController.js
│   ├── authController.js
│   ├── chatController.js
│   └── searchController.js
│
│── middleware
│   ├── authMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── roleMiddleware.js
│
│── prisma
│   ├── migrations
│   ├── schema.prisma
│   ├── seed.js
│   └── categorySeed.js
│
│── routes
│   ├── articleRoutes.js
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   └── searchRoutes.js
│
│── services
│   ├── embeddingService.js
│   └── groqService.js
│
│── server.js
│── package.json
│── prisma.config.ts
│── .env



├── frontend


│── src/app

│   ├── analytics/page.tsx
│   ├── dashboard/page.tsx
│   ├── editor/page.tsx
│   ├── hmis/page.tsx
│   ├── login/page.tsx
│   ├── search/page.tsx
│   └── widget/page.tsx


│── components

│   ├── ArticleCard.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── ChatWidget.tsx


│── hooks

│   └── useAuth.tsx


│── lib

│   └── api.ts


└── package.json

```

---

# 🗄 Database ERD

![ERD Diagram](docs/images/erd.png)

Entities:

- Users
- Articles
- Categories
- Tags
- Feedback
- Chat Logs
- Search Logs

---

# 🔌 API Documentation

![API Documentation](docs/images/api-documentation.png)

## Authentication

```
POST /auth/login
```

## Articles

```
GET /articles

POST /articles

PUT /articles/:id

DELETE /articles/:id
```

## Search

```
GET /search?q=query
```

## Chatbot

```
POST /chat
```

---

# ⚙️ Backend Installation

```bash
cd backend

npm install
```

Create:

```
.env
```

Example:

```env
DATABASE_URL=

JWT_SECRET=

GROQ_API_KEY=

PORT=5000
```

Run database:

```bash
npx prisma migrate dev
```

Seed:

```bash
npm run seed
```

Start:

```bash
npm run dev
```

Backend:

```
http://localhost:5000
```

---

# 🎨 Frontend Installation

```bash
cd frontend

npm install
```

Create:

```
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

# 🚀 Deployment (Render)

## Backend Deployment

Create Render Web Service:

Runtime:

```
Node
```

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Environment Variables:

```
DATABASE_URL

JWT_SECRET

GROQ_API_KEY

PORT
```

---

## Frontend Deployment

Create Render Static Site:

Build:

```bash
npm run build
```

Environment:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

# 📸 Documentation Images

Store project images:

```
docs/

└── images

    ├── banner.png

    ├── system-architecture.png

    ├── erd.png

    ├── api-documentation.png

    └── screenshots/

```

---

# 🔒 Security

Implemented:

✅ JWT Authentication  
✅ bcrypt hashing  
✅ Helmet security headers  
✅ CORS protection  
✅ Rate limiting  
✅ Role authorization  
✅ Input validation

---

# 🧪 Testing

| Area        | Tool            |
| ----------- | --------------- |
| API         | Postman         |
| UI          | Browser Testing |
| Security    | Manual Testing  |
| Performance | Lighthouse      |

---

# 👨‍💻 Git Workflow

Branches:

```
main

development

feature/auth

feature/chatbot

feature/search
```

Commit style:

```
feat: add chatbot endpoint

fix: update auth middleware

docs: update README
```

---

# 📈 Future Improvements

- 🇰🇪 English / Swahili support
- 🎙 Voice assistant
- 📱 PWA offline mode
- 🧠 Advanced RAG pipeline
- 📜 Article version history
- 📧 Notification system

---

# 🎓 Capstone Deliverables

Completed:

✅ Requirements Document  
✅ Product Requirements Document  
✅ System Architecture  
✅ ERD Design  
✅ API Documentation  
✅ Backend REST API  
✅ Next.js Frontend  
✅ RBAC Security  
✅ AI Chatbot Widget  
✅ Render Deployment

---

# 📄 License

Healthcare IT Capstone Project.

Developed by:

**Abdisamad Abass Tawane**

```

```
