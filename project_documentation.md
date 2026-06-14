# Project Documentation: PS-29 Content Publishing System

## Architecture Overview
The PS-29 Content Publishing System employs a modern microservices architecture tailored to handle relational data integrity alongside scalable, unstructured NoSQL documentation and AI-based vector embeddings. 

The system relies on four primary components:
1. **API Gateway (FastAPI on Port 8000)**
   - Serves as the single entry point for all frontend requests.
   - Routes requests dynamically to appropriate backend microservices (`/content/publish`, `/content/save_version`, etc.).
   - Handles CORS and global token pass-through to ensure smooth cross-origin integration.
2. **Relational Service (Spring Boot on Port 8001 & PostgreSQL)**
   - Manages structured, ACID-compliant entities: `Users`, `Drafts`, and `Content`.
   - Uses strict JPA schema enforcement to manage author-content relationships.
   - Ensures publishing workflow reliability through transactional rollbacks.
3. **NoSQL/AI Service (Node.js on Port 8002 & MongoDB)**
   - Manages un-structured, append-heavy, or dense schema-less data: `ContentVersion`, `EditLog`, and `ContentEmbedding`.
   - Utilizes `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`) natively to calculate local vector embeddings of content.
   - Computes Cosine Similarity manually to achieve accurate semantic search matching without external database plugins.
4. **Frontend (React & Vite on Port 5173)**
   - Modern single-page application handling user interaction, including `ContentManager.jsx` for drafting, publishing, semantic searching, and displaying version history natively within the user interface.

## Database Normalization Steps
Our system splits data across an SQL database (for core relational integrity) and a NoSQL database (for logs, versions, and embeddings). The SQL schema went through a rigorous normalization process:

- **Initial (Unnormalized) State**: We identified raw attributes like `user_id`, `user_fullname`, `user_email`, `content_id`, `content_title`, `version_number`, `edit_timestamp`, and `vector_embedding`.
- **First Normal Form (1NF)**: All column values are atomic. There are no repeating arrays inside SQL tables (embeddings were moved to MongoDB).
- **Second Normal Form (2NF)**: We extracted partial dependencies. `Users`, `Drafts`, and `Content` were given their own tables with single-column primary keys (`id`), meaning every attribute is fully dependent on the PK.
- **Third Normal Form (3NF)**: We removed transitive dependencies. For example, `author_id` acts as a Foreign Key in the `Content` table, allowing us to reference the `Users` table without redundantly storing `fullname` or `email` on every piece of content.

## Vector Search Implementation
To avoid reliance on MongoDB Atlas subscriptions, we integrated local vector generation directly inside the Node.js application:
1. When a new version is saved, the content body is passed through the `feature-extraction` pipeline.
2. The resulting multi-dimensional floating point array is stored as `embedding: [Number]` in MongoDB.
3. During semantic search, the user query is similarly embedded. A loop performs a Cosine Similarity mathematical calculation between the query vector and all database vectors, sorting by the highest score threshold (e.g. `> 0.3`).

## Containerization
The entire stack is configured via `docker-compose.yml`. Running `docker-compose up -d --build` dynamically builds the multi-stage images for React, Node.js, Spring Boot, and FastAPI, while pulling down standard `postgres:15` and `mongo:6` images. 

## Conclusion
This system is highly modular, scales cleanly horizontally, guarantees consistency where necessary (SQL), and excels at unstructured AI workflows where flexibility is paramount (NoSQL).
