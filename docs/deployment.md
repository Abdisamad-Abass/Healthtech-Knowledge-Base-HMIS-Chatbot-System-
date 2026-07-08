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
