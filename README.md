# Backend Questions API

This API provides access to backend and system design questions, organized by difficulty, category, and phases. It is useful for learning, interviews, and testing your understanding of distributed systems and architecture.

---

## **API Endpoints**

### 1. Get All Questions

**Endpoint:** `GET /api/questions`  
**Description:** Fetch a paginated list of all questions.

**Example Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "questions": [
      {
        "_id": "69ad52a3d01bf04853ac05bd",
        "title": "The Login Storm Outage",
        "slug": "login-storm-outage",
        "core_issue": "Scalability and traffic spikes—thundering herd of users overwhelming CPU (password hashing) and DB (connection exhaustion).",
        "category": "system-design",
        "difficulty": "hard",
        "tags": ["auth","scalability","rate-limiting","load-shedding","thundering-herd"]
      },
      {
        "_id": "69ad52a3d01bf04853ac057e",
        "title": "The Follower Count Chaos",
        "slug": "follower-count-chaos",
        "core_issue": "Concurrency and race conditions leading to duplicate follow relationships and incorrect follower counters.",
        "category": "system-design",
        "difficulty": "medium",
        "tags": ["social-graph","concurrency","race-condition","distributed-systems"]
      }
      // ...more questions
    ]
  },
  "message": "Questions fetched successfully"
}
```

### 2. Get a Question By ID

**Endpoint:** `GET /api/questions/:id`  
**Description:** Fetch detailed information for a single question, including all phases and options

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "_id": "69ad52a3d01bf04853ac05a8",
    "title": "The Stale Product Price Issue",
    "slug": "stale-product-price-issue",
    "context": "E-commerce Product Service /api/v1/products/{id}",
    "core_issue": "Cache Invalidation—the cache is not synchronized with the database, causing stale product prices.",
    "scenario": "Your system caches product details in Redis to speed up GET /api/v1/products/{id}. After updating the price in the admin panel, customers continue seeing the old price for several minutes.",
    "category": "system-design",
    "difficulty": "hard",
    "tags": ["cache-invalidation","ecommerce","redis","distributed-systems"],
    "phases": {
      "phase1": {
        "question": "What is your immediate move to ensure customers see the correct price during a flash sale or update?",
        "options": [
          {
            "id": "A",
            "title": "Reduce TTL (Time-to-Live)",
            "logic": "Shorten the cache expiration from 10 minutes to 30 seconds to minimize the stale window.",
            "description": "Reduces stale data window but may increase DB load."
          },
          {
            "id": "B",
            "title": "Active Cache Invalidation (The 'Purge')",
            "logic": "Modify the Admin service to explicitly delete the Redis key product:{id} whenever a price change is saved.",
            "description": "Ensures cache is up-to-date immediately after a DB write."
          }
        ]
      },
      "phase2": {
        "A": [
          {
            "id": "A1",
            "title": "Static TTL",
            "description": "Set a hard 30-second TTL for all products."
          },
          {
            "id": "A2",
            "title": "Adaptive TTL",
            "description": "Use shorter TTLs for high-velocity items (sale items) and longer TTLs for static items."
          }
        ],
        "B": [
          {
            "id": "B1",
            "title": "Synchronous Delete",
            "description": "The Admin API waits for Redis to confirm deletion before telling the admin 'Success.'"
          },
          {
            "id": "B2",
            "title": "Asynchronous Invalidation",
            "description": "The Admin API emits an 'Update Event' to a message queue; a worker then clears the cache."
          }
        ]
      },
      "phase3": {
        "title": "Architectural Evolution",
        "description": "To manage millions of products with zero price-lag, the following changes are required:",
        "archSections": [
          {
            "key": "cdc",
            "label": "Change Data Capture (CDC)",
            "desc": "Listen to database transaction logs. As soon as a row changes, trigger cache eviction.",
            "items": [
              { "id": "Debezium Listener", "desc": "Automatically detects DB changes and signals cache invalidation." }
            ]
          },
          {
            "key": "cache-aside",
            "label": "Cache-Aside Pattern with Invalidation",
            "desc": "Read: Check Cache → Miss → Read DB → Populate Cache. Update: Update DB → Evict Cache Key.",
            "items": [
              { "id": "Read Path", "desc": "Always check cache first and fallback to DB on miss." },
              { "id": "Write Path", "desc": "Evict cache immediately after updating the DB to prevent stale reads." }
            ]
          }
        ]
      },
      "phase4": { "instruction": "Explain trade-offs and reasoning behind your solution." },
      "phase5": {
        "intent": "Evaluate understanding of cache invalidation and high-scale architecture.",
        "weak_signals": [
          "Relying solely on short TTLs",
          "Ignoring race conditions on cache updates"
        ],
        "recommended_solution": [
          "Active cache invalidation",
          "Two-tier caching",
          "Change Data Capture",
          "Versioned cache keys"
        ],
        "followup_questions": [
          "How would you prevent a cache stampede during a flash sale?",
          "When is write-through better than cache-aside?"
        ]
      }
    },
    "message": "Question fetched successfully"
  }
}
```