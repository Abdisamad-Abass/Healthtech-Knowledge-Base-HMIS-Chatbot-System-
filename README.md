# 🏥 Healthcare Knowledge Base & HMIS Chatbot System

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

[Download API Documentation PDF](docs/HealthTech%20Knowledge%20Base%20AI%20Assistant%20API%20Documentation.pdf)

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
