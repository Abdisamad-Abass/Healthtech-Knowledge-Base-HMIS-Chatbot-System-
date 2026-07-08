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
