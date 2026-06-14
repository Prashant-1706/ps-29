# Implementation Plan: PS-29 Content Publishing System

This plan strictly follows the required 13-step sequence for the project, focusing on architectural correctness, data design, and full-stack integration. 

## Step 1: Problem Understanding
- **Problem Statement**: Build a platform (PS-29) for users to create, edit, save drafts, publish content, track versions, and discover content using semantic search.
- **Functional Requirements**:
  1. User authentication (Signup/Signin).
  2. Create, save, and edit content drafts.
  3. Publish drafts as finalized content.
  4. Track all edit logs and version history.
  5. Semantic search ("Articles on cloud computing") against published content and drafts.
- **Variables & Entities**: `User`, `Content`, `Draft`, `ContentVersion`, `EditLog`, `EmbeddingVector`.

## Step 2: Initial Data Modeling (Unnormalized)
If we were to store all this in a single system/table, the initial schema would look like this:
- **`RawData`**: `user_id`, `user_fullname`, `user_email`, `content_id`, `content_title`, `content_body`, `content_status` (draft/published), `version_number`, `version_body`, `edit_timestamp`, `edit_action`, `vector_embedding`
- **Issues**: Heavy data redundancy (user info repeated for every content; content info repeated for every version/edit). Mixed relational and vector data.

## Step 3: Database Classification
We will split the data across two databases based on their characteristics:
- **SQL (PostgreSQL)**: `users`, `content`, `drafts`. 
  - **Justification**: These entities are structured and highly relational. We need strict schema enforcement, ACID compliance for publishing workflows, and foreign key constraints between authors and their content.
- **NoSQL (MongoDB)**: `content_versions`, `edit_logs`, `content_embeddings`.
  - **Justification**: Version histories and logs are append-heavy, potentially large, and their schemas might evolve (unstructured/semi-structured data). Embeddings are dense arrays of floats, which MongoDB handles well and can process for vector search.

## Step 4: Normalization (SQL)
To optimize our SQL schema:
- **1NF (Atomic Attributes)**: Every column holds atomic values.
- **2NF (No Partial Dependency)**: Each table will have a single-column primary key (`id`), meaning no partial dependencies exist.
- **3NF (No Transitive Dependency)**: All attributes will depend strictly on the primary key.
  - **Normalized SQL Schema**:
    - `users` (`id` PK, `fullname`, `phone`, `email`, `password`)
    - `drafts` (`id` PK, `title`, `body`, `author_id` FK, `created_at`, `updated_at`)
    - `content` (`id` PK, `title`, `body`, `author_id` FK, `published_at`, `original_draft_id` FK)

## Step 5: Database Implementation
- **Spring Boot (PostgreSQL)**: Create JPA Entities for `Users`, `Drafts`, and `Content`. Establish `@OneToMany` and `@ManyToOne` relationships. Add foreign keys and constraints.
- **Node.js (MongoDB)**: Create Mongoose schemas for `ContentVersion`, `EditLog`, and `ContentEmbedding`.

## Step 6: Backend Development
- **Spring Boot (Port 8001)**: Develop REST APIs to save drafts, publish content, and manage users.
- **Node.js (Port 8002)**: Develop REST APIs to save versions whenever an edit occurs, retrieve edit logs, and handle semantic search.

## Step 7: Vector Search Implementation
- Use `@xenova/transformers` in Node.js to convert content strings into vector embeddings.
- Store these embeddings in `content_embeddings` in MongoDB.
- Implement Cosine Similarity search to find contextually relevant drafts or published content based on user natural language queries.

## Step 8: API Gateway Development
- **FastAPI (Port 8000)**: Build a single entry point for the frontend.
- Route `/api/sql/*` to Spring Boot.
- Route `/api/mongo/*` to Node.js.
- Handle cross-origin requests and basic token validation.

## Step 9: Frontend Integration
- Build React interfaces for the Content Editor (Drafting), Published Content View, Version History Sidebar, and Semantic Search Bar. Connect via the API Gateway.

## Step 10: Containerization and Deployment
- Write `Dockerfile`s for Spring Boot, Node.js, FastAPI, and Frontend.
- Create a `docker-compose.yml` to spin up the entire stack, including PostgreSQL and MongoDB containers.

## Step 11: Testing & Step 12: Documentation
- API testing via Postman.
- A final `project_documentation.md` will be generated covering the architecture, normalization steps, and justifications as required by your rubric.

## Step 13: Architectural Justification
*Briefly:*
- **SQL vs MongoDB**: SQL ensures data integrity for core publishing workflows; MongoDB provides flexibility for logs and vector storage.
- **Normalization**: Eliminates redundant data anomalies when a user changes their name or updates a draft.
- **Microservices**: Spring Boot excels at strict JPA relational modeling; Node.js excels at asynchronous AI/ML embedding processing and NoSQL document handling.
- **Gateway**: Unifies the frontend experience so it doesn't need to know about the different backend ports and languages.

---

## User Review Required
> [!IMPORTANT]
> I have mapped out the design and implementation sequence to precisely match your rubric. 
> **Are you ready to approve this plan so I can begin Step 5 (Database Implementation)?**
> Also, regarding Vector Search (Step 7), would you prefer we implement the math (cosine similarity calculation) manually in Node.js, or use MongoDB's `$vectorSearch` feature (which requires an Atlas cluster)?
