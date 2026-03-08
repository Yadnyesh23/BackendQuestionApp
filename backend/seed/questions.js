const questions = [
  {
    title: "The Duplicate Charge",
    slug: "duplicate-charge-payment-system",
    context: "Payment API /api/v1/payments",
    core_issue: "Lack of idempotency leading to multiple charges for a single user intent.",
    scenario:
      "Users retry payment requests during slow networks or timeouts, which results in the payment API processing the same request multiple times and charging the customer more than once.",
    category: "system-design",
    difficulty: "hard",
    tags: ["payments", "idempotency", "distributed-systems"],

    phases: {
      phase1: {
        question: "What is your immediate move to stabilize the system and prevent further duplicates?",
        options: [
          {
            id: "A",
            title: "Rate-limit the Endpoint",
            logic: "Reject requests from the same user if they exceed 1 request per 10 seconds.",
            description: "Limits repeated calls but does not solve data integrity."
          },
          {
            id: "B",
            title: "Client-side Debouncing",
            logic: "Disable the payment button after the first click to prevent double taps.",
            description: "Helps UX but cannot prevent duplicate charges from retries or multiple servers."
          },
          {
            id: "C",
            title: "Server-side Idempotency",
            logic: "Require an Idempotency-Key header. If the same key is seen again, return the cached response instead of processing the payment again.",
            description: "The most reliable way to prevent duplicate charges at the system level."
          },
          {
            id: "D",
            title: "Database Unique Constraints",
            logic: "Use a unique index on order_id or transaction_id to block duplicate writes.",
            description: "Enforces data integrity at the database layer."
          }
        ]
      },

      phase2: {
        A: [
          {
            id: "A1",
            title: "Global Redis Counter",
            description: "Track request frequency across all server nodes using a centralized Redis cache."
          },
          {
            id: "A2",
            title: "Local In-Memory Buckets",
            description: "Apply rate limiting per server instance. Faster but inaccurate for distributed traffic."
          }
        ],
        B: [
          {
            id: "B1",
            title: "Hard Disable Button",
            description: "Disable the button until a response is received or a timeout occurs."
          },
          {
            id: "B2",
            title: "Processing Confirmation Modal",
            description: "Display a modal that prevents further user interaction while the request processes."
          }
        ],
        C: [
          {
            id: "C1",
            title: "Distributed Locking",
            description: "Use Redis Redlock to lock the idempotency key while the first request is processed."
          },
          {
            id: "C2",
            title: "Persistence-based Validation",
            description: "Store the idempotency key in a database table before calling the payment provider."
          }
        ],
        D: [
          {
            id: "D1",
            title: "Strict Error Handling",
            description: "Attempt insert and catch the UniqueViolation error to return an 'Already Processed' response."
          },
          {
            id: "D2",
            title: "Upsert (ON CONFLICT)",
            description: "Use ON CONFLICT DO NOTHING to ignore duplicate writes silently."
          }
        ]
      },

      phase3: {
        title: "Architectural Evolution",
        description:
          "To make the duplicate-charge fix production-grade, you must introduce architectural components that guarantee idempotency and transactional safety.",
        archSections: [
          {
            key: "middleware",
            label: "Idempotency Layer",
            desc: "Ensure duplicate payment requests are safely detected before execution.",
            items: [
              {
                id: "Idempotency Middleware",
                desc: "Intercept requests and check Idempotency-Key before processing the payment"
              },
              {
                id: "Idempotency Cache Store",
                desc: "Store processed Idempotency-Key values in Redis or Postgres for quick lookup"
              },
              {
                id: "Cached Response Return",
                desc: "Return the previously stored payment response if the same key is seen again"
              }
            ]
          },
          {
            key: "state",
            label: "Payment Processing State Machine",
            desc: "Track the lifecycle of each payment to avoid inconsistent states.",
            items: [
              { id: "Started State", desc: "Record the user intent to make a payment before calling the gateway" },
              { id: "Executing State", desc: "Mark the payment as executing while calling Stripe/PayPal" },
              { id: "Finalized State", desc: "Persist the final success/failure response from the payment provider" }
            ]
          },
          {
            key: "consistency",
            label: "Data Consistency & Atomicity",
            desc: "Prevent race conditions when two identical requests arrive simultaneously.",
            items: [
              { id: "Atomic DB Transaction", desc: "Wrap the idempotency key check and payment record creation in a single transaction" },
              { id: "Row-Level Locking", desc: "Use database locks to prevent concurrent updates to the same payment record" },
              { id: "Unique Idempotency Key Constraint", desc: "Add a database unique constraint on Idempotency-Key to enforce integrity" }
            ]
          },
          {
            key: "resilience",
            label: "Failure Recovery",
            desc: "Ensure the system recovers safely if a crash occurs during payment processing.",
            items: [
              { id: "Retry-safe Gateway Calls", desc: "Ensure payment gateway calls can be retried without double charging" },
              { id: "Idempotency Key TTL", desc: "Expire stored keys after a defined period (e.g., 24 hours)" },
              { id: "Payment Reconciliation Worker", desc: "Background job to reconcile gateway transactions with database records" }
            ]
          }
        ]
      },

      phase4: {
        instruction:
          "Explain the trade-offs of your selected architecture decisions and why they best solve the duplicate charge issue."
      },

      phase5: {
        intent: "The interviewer wants to evaluate whether the candidate understands how distributed systems prevent duplicate financial transactions.",
        context: "Payment APIs must guarantee that one user intent results in exactly one charge even if requests are retried.",
        weak_signals: [
          "Only suggesting frontend fixes.",
          "Using rate limiting as the primary solution for data integrity."
        ],
        recommended_solution: [
          "Implement server-side idempotency keys.",
          "Store request and response with idempotency keys.",
          "Use atomic database transactions.",
          "Maintain payment state machines."
        ],
        followup_questions: [
          "How would you handle a server crash after the payment gateway confirms the charge?",
          "Where would you store idempotency keys for high scalability?",
          "How long should idempotency keys persist?"
        ]
      }
    }
  },
  {
  "title": "The Follower Count Chaos",
  "slug": "follower-count-chaos",
  "context": "Social Graph Service /api/v1/follow",
  "core_issue": "Concurrency and race conditions leading to duplicate follow relationships and incorrect follower counters.",
  "scenario": "Sometimes when a user taps the follow button rapidly or the request retries, the database ends up storing duplicate follow relationships. The follower count also becomes inaccurate.",
  "category": "system-design",
  "difficulty": "medium",
  "tags": ["social-graph", "concurrency", "race-condition", "distributed-systems"],

  "phases": {
    "phase1": {
      "question": "What is your immediate move to stabilize the database and prevent phantom follower counts?",
      "options": [
        {
          "id": "A",
          "title": "Atomic Increment/Decrement",
          "logic": "Use database-level atomic updates instead of fetching, incrementing in application code, and saving.",
          "description": "Prevents race conditions caused by read-modify-write patterns."
        },
        {
          "id": "B",
          "title": "Database Level Constraints",
          "logic": "Apply a unique composite index on (follower_id, followed_id) to ensure duplicates cannot exist.",
          "description": "Lets the database enforce relationship uniqueness."
        },
        {
          "id": "C",
          "title": "Distributed Locking",
          "logic": "Use Redis locks to ensure only one thread processes a follow relationship at a time.",
          "description": "Prevents concurrent writes across distributed application servers."
        },
        {
          "id": "D",
          "title": "Event-Driven Counting",
          "logic": "Separate relationship writes from follower counters and update counts asynchronously.",
          "description": "Improves write scalability and avoids direct counter conflicts."
        }
      ]
    },

    "phase2": {
      "A": [
        {
          "id": "A1",
          "title": "SQL Increment",
          "description": "Use UPDATE counters SET followers = followers + 1 WHERE user_id = X."
        },
        {
          "id": "A2",
          "title": "Redis INCR",
          "description": "Use Redis as the primary source for follower counters using atomic INCR operations."
        }
      ],
      "B": [
        {
          "id": "B1",
          "title": "Error Handling",
          "description": "Catch UniqueViolation errors and return a success response to keep the API idempotent."
        },
        {
          "id": "B2",
          "title": "Upsert Logic",
          "description": "Use INSERT ... ON CONFLICT DO NOTHING to silently prevent duplicate relationships."
        }
      ],
      "C": [
        {
          "id": "C1",
          "title": "Redlock Algorithm",
          "description": "Implement multi-node Redis locking for fault-tolerant distributed locks."
        },
        {
          "id": "C2",
          "title": "SETNX Lock",
          "description": "Use a simple Redis SETNX lock with TTL to prevent deadlocks if the app crashes."
        }
      ],
      "D": [
        {
          "id": "D1",
          "title": "Transactional Outbox",
          "description": "Write both the follow relationship and an event record in the same transaction, then relay to the counter service."
        },
        {
          "id": "D2",
          "title": "Change Data Capture",
          "description": "Use tools like Debezium to stream database changes to a counter service automatically."
        }
      ]
    },

    "phase3": {
      "title": "Architectural Evolution",
      "description": "Scaling a social graph system requires specialized designs to handle extremely high write rates.",
      "archSections": [
        {
          "key": "relationship-table",
          "label": "Relationship Table",
          "desc": "A highly indexed edge table representing follower relationships.",
          "items": [
            { "id": "Composite Primary Key", "desc": "Use (follower_id, followed_id) as a composite key to guarantee uniqueness." },
            { "id": "Indexed Lookups", "desc": "Index by follower_id and followed_id for efficient queries." }
          ]
        },
        {
          "key": "sharded-counters",
          "label": "Sharded Counters",
          "desc": "Avoid hot rows for celebrity accounts by distributing counters across multiple shards.",
          "items": [
            { "id": "Counter Shards", "desc": "Split follower counts across multiple rows to reduce contention." },
            { "id": "Aggregation", "desc": "Total followers are computed by summing across shards." }
          ]
        },
        {
          "key": "follow-state-machine",
          "label": "Follow State Machine",
          "desc": "Ensure consistent lifecycle management of follow relationships.",
          "items": [
            { "id": "Attempt", "desc": "Verify the user is allowed to follow (not blocked, valid user)." },
            { "id": "Persist", "desc": "Atomically insert the follow relationship." },
            { "id": "Propagate", "desc": "Update follower counts asynchronously in cache layers." }
          ]
        }
      ]
    },

    "phase4": {
      "instruction": "Explain the trade-offs of your selected strategy and analyze why it best prevents duplicate followers and phantom counts."
    },

    "phase5": {
      "intent": "Evaluate understanding of race conditions, social graph scaling, and distributed consistency.",
      "context": "Large social platforms must handle millions of follow events per second while maintaining accurate follower counts.",
      "weak_signals": [
        "Using read-modify-write patterns for counters",
        "Ignoring uniqueness constraints on relationships",
        "Using global locks that do not scale across distributed systems",
        "Using cron jobs to fix counts at the end of the day"
      ],
      "recommended_solution": [
        "Composite unique constraint for follow relationships",
        "Atomic writes to relationship table",
        "Sharded counters for high-follower accounts",
        "Event-driven updates to follower counts"
      ],
      "followup_questions": [
        "What happens if a user follows and unfollows within milliseconds?",
        "How would you prevent hot keys for celebrity accounts?",
        "How would you shard the follower graph across database nodes?"
      ]
    }
  }
},
{
  "title": "The Slow Feed Disaster",
  "slug": "slow-feed-disaster",
  "context": "Social Feed Aggregator /api/v1/feed",
  "core_issue": "The N+1 Query Problem—performing one query to fetch a list of items and then N additional queries to fetch details for each item.",
  "scenario": "Your feed endpoint GET /api/v1/feed works fine in development. But in production, the response takes 8 seconds. Database logs show: 1 query to fetch posts, 300 queries to fetch user profiles, 300 queries to fetch comments.",
  "category": "system-design",
  "difficulty": "medium",
  "tags": ["social-feed", "n+1-queries", "performance", "distributed-systems"],

  "phases": {
    "phase1": {
      "question": "What is your immediate move to reduce the 8-second latency in production?",
      "options": [
        {
          "id": "A",
          "title": "Database Indexing",
          "logic": "Add indexes to user_id and post_id foreign keys to speed up the individual lookup queries.",
          "description": "Speeds up DB lookups but does not eliminate N+1 query problem entirely."
        },
        {
          "id": "B",
          "title": "Query Optimization (Eager Loading)",
          "logic": "Fetch all profiles and comments in one or two bulk queries using JOIN or IN clauses.",
          "description": "Eliminates the N+1 query pattern and reduces latency significantly."
        },
        {
          "id": "C",
          "title": "Aggressive Caching (Redis)",
          "logic": "Cache the entire serialized JSON response for the feed for 60 seconds to bypass the database entirely.",
          "description": "Quick solution but may serve slightly stale data; good for high-read workloads."
        },
        {
          "id": "D",
          "title": "Pagination Implementation",
          "logic": "Limit the feed to only 10 items per request, reducing N from 300 to 10.",
          "description": "Reduces load per request, improves perceived latency but does not fix underlying N+1 problem."
        }
      ]
    },

    "phase2": {
      "A": [
        {
          "id": "A1",
          "title": "B-Tree Indexes",
          "description": "Apply standard indexes to the foreign keys in the Profiles and Comments tables."
        },
        {
          "id": "A2",
          "title": "Covering Indexes",
          "description": "Create an index that includes the actual data columns (e.g., username, avatar_url) to avoid heap fetches."
        }
      ],
      "B": [
        {
          "id": "B1",
          "title": "SQL Joins",
          "description": "Use a single complex LEFT JOIN to flatten the data into one massive result set."
        },
        {
          "id": "B2",
          "title": "Application-Level Batching",
          "description": "Fetch the 300 IDs, then run one query: SELECT * FROM profiles WHERE id IN (1,2,3...) and map them in code."
        }
      ],
      "C": [
        {
          "id": "C1",
          "title": "Cache-Aside Pattern",
          "description": "Check Redis first; if empty, run the slow DB queries once and save the result to Redis."
        },
        {
          "id": "C2",
          "title": "Write-Through Cache",
          "description": "Update the feed cache every time someone posts or updates their profile."
        }
      ],
      "D": [
        {
          "id": "D1",
          "title": "Offset Pagination",
          "description": "Use LIMIT 10 OFFSET 0 (simple but slow for deep pages)."
        },
        {
          "id": "D2",
          "title": "Cursor Pagination",
          "description": "Use WHERE id < last_seen_id LIMIT 10 for consistent performance on large datasets."
        }
      ]
    },

    "phase3": {
      "title": "Architectural Evolution",
      "description": "To build a scalable feed system, the following architectural changes are required:",
      "archSections": [
        {
          "key": "denormalization",
          "label": "Denormalization",
          "desc": "Instead of fetching user profiles every time, store a snapshot of the username and avatar_url directly inside the Posts row.",
          "items": [
            { "id": "Embedded Profile Data", "desc": "Include username, avatar_url in Post document/row to avoid repeated joins." }
          ]
        },
        {
          "key": "fan-out-architecture",
          "label": "Fan-out Architecture",
          "desc": "Push each new post into precomputed feed caches of followers (write-path optimization).",
          "items": [
            { "id": "Precomputed Feeds", "desc": "Followers see the new post immediately without repeated DB queries." }
          ]
        },
        {
          "key": "data-hydration-layer",
          "label": "Data Hydration Layer",
          "desc": "Dedicated service or GraphQL layer that batches requests to different microservices to prevent cascading latencies.",
          "items": [
            { "id": "Batching Service", "desc": "Aggregate profiles, likes, and comments requests to reduce N+1 queries." }
          ]
        }
      ]
    },

    "phase4": {
      "instruction": "Explain the trade-offs of your selected path and why it best solves the N+1 query problem while maintaining low latency."
    },

    "phase5": {
      "intent": "Evaluate understanding of N+1 query patterns, caching, denormalization, and scalable feed architectures.",
      "context": "High-read social feed systems must minimize DB round-trips to maintain low latency for millions of users.",
      "weak_signals": [
        "Suggesting more hardware without query optimization",
        "Caching without TTL or invalidation",
        "Using Joins naively across distributed microservices"
      ],
      "recommended_solution": [
        "Eager loading or batching queries",
        "Denormalization for frequently-read data",
        "Fan-out write architecture",
        "Cache-Aside or Write-Through caching"
      ],
      "followup_questions": [
        "How would you design the feed for celebrity accounts with millions of followers?",
        "When is cursor pagination preferred over offset pagination?",
        "How would you batch requests across microservices to avoid cascading N+1 queries?"
      ]
    }
  }
},
{
  "title": "The Stale Product Price Issue",
  "slug": "stale-product-price-issue",
  "context": "E-commerce Product Service /api/v1/products/{id}",
  "core_issue": "Cache Invalidation—the cache is not synchronized with the database, causing stale product prices.",
  "scenario": "Your system caches product details in Redis to speed up GET /api/v1/products/{id}. After updating the price in the admin panel, customers continue seeing the old price for several minutes.",
  "category": "system-design",
  "difficulty": "hard",
  "tags": ["cache-invalidation", "ecommerce", "redis", "distributed-systems"],

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
        },
        {
          "id": "C",
          "title": "Write-Through Caching",
          "logic": "Update both the Database and the Redis cache simultaneously within a single transaction or operation.",
          "description": "Atomic approach ensures cache and DB are consistent, but may add complexity."
        },
        {
          "id": "D",
          "title": "Versioned Cache Keys (Cache Busting)",
          "logic": "Include a version or timestamp in the cache key (e.g., product:{id}:v2) and update the pointer in a global configuration.",
          "description": "Avoids stale cache by creating new keys on updates, good for high-scale systems."
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
          "description": "The Admin API emits an 'Update Event' to a message queue (SNS/SQS); a worker then clears the cache."
        }
      ],
      "C": [
        {
          "id": "C1",
          "title": "Atomic Update",
          "description": "Use a distributed transaction to ensure Redis and the DB are both updated or rolled back together."
        },
        {
          "id": "C2",
          "title": "Lazy Write-Through",
          "description": "Update the DB first, then attempt to update Redis. If Redis fails, delete the key to force a refresh on the next read."
        }
      ],
      "D": [
        {
          "id": "D1",
          "title": "Database Trigger",
          "description": "Use a DB trigger to increment a version column, generating a new cache key."
        },
        {
          "id": "D2",
          "title": "Metadata Header",
          "description": "Use an ETag or 'Last-Modified' header to let the client/CDN know when to bypass the cache."
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
        },
        {
          "key": "two-tier-caching",
          "label": "Two-Tier Caching",
          "desc": "Use a local 'L1' memory cache (fast, short TTL) and a distributed 'L2' Redis cache for massive traffic spikes.",
          "items": [
            { "id": "L1 Cache", "desc": "Very fast memory cache for immediate reads." },
            { "id": "L2 Redis Cache", "desc": "Distributed cache layer for large-scale data consistency." }
          ]
        }
      ]
    },

    "phase4": {
      "instruction": "Explain the trade-offs of your selected path and why it ensures correct prices while maintaining high performance."
    },

    "phase5": {
      "intent": "Evaluate understanding of cache invalidation, write path consistency, and high-scale e-commerce architecture.",
      "context": "E-commerce systems must avoid stale product prices during sales to prevent revenue and legal issues.",
      "weak_signals": [
        "Relying solely on short TTLs",
        "Using cache updates instead of deletes",
        "Not considering multiple service boundaries (Admin vs API)",
        "Ignoring race conditions on cache updates"
      ],
      "recommended_solution": [
        "Active cache invalidation on DB update",
        "Two-tier caching for scalability",
        "Change Data Capture for automated updates",
        "Versioned cache keys for cache busting"
      ],
      "followup_questions": [
        "How would you prevent a cache stampede during a flash sale?",
        "When is write-through better than cache-aside?",
        "How would you ensure consistency across multiple Redis nodes?"
      ]
    }
  }
},
{
  "title": "The Login Storm Outage",
  "slug": "login-storm-outage",
  "context": "Authentication Service /api/v1/login",
  "core_issue": "Scalability and Traffic Spikes—Thundering Herd of users overwhelming CPU (password hashing) and DB (connection exhaustion).",
  "scenario": "During a major marketing campaign, millions of users try to log in simultaneously using POST /api/v1/login. The authentication service crashes and the entire platform becomes unavailable.",
  "category": "system-design",
  "difficulty": "hard",
  "tags": ["auth", "scalability", "rate-limiting", "load-shedding", "thundering-herd"],

  "phases": {
    "phase1": {
      "question": "What is your immediate move to save the platform while the login service is under heavy fire?",
      "options": [
        {
          "id": "A",
          "title": "Horizontal Auto-scaling",
          "logic": "Rapidly spin up hundreds of new Auth service pods to distribute the CPU load of password hashing (Bcrypt/Argon2)."
        },
        {
          "id": "B",
          "title": "Request Queuing & Buffering",
          "logic": "Place a message queue in front of the auth logic to process logins at a steady, sustainable rate rather than crashing."
        },
        {
          "id": "C",
          "title": "Priority Rate Limiting (Load Shedding)",
          "logic": "Reject new login attempts at the API Gateway level to preserve resources for users who are already logged in and using the app."
        },
        {
          "id": "D",
          "title": "Implement Exponential Backoff",
          "logic": "Force the client apps to wait progressively longer before retrying a failed login attempt to break the 'retry storm'."
        }
      ]
    },

    "phase2": {
      "A": [
        {
          "id": "A1",
          "title": "Reactive Scaling",
          "description": "Scale based on CPU usage (e.g., scale out when CPU > 70%)."
        },
        {
          "id": "A2",
          "title": "Predictive Scaling",
          "description": "Use historical marketing data to pre-warm and provision 5x capacity before the campaign starts."
        }
      ],
      "B": [
        {
          "id": "B1",
          "title": "Standard FIFO Queue",
          "description": "Process logins in the exact order they arrived."
        },
        {
          "id": "B2",
          "title": "Virtual Waiting Room",
          "description": "Show users a 'You are in line' UI to manage expectations and prevent repeated manual refreshes."
        }
      ],
      "C": [
        {
          "id": "C1",
          "title": "Token Bucket Algorithm",
          "description": "Allow short bursts of traffic but maintain a strict average rate limit per IP/User."
        },
        {
          "id": "C2",
          "title": "Global Adaptive Throttling",
          "description": "Automatically lower the rate limit across the board as the database latency increases."
        }
      ],
      "D": [
        {
          "id": "D1",
          "title": "Client-Side Jitter",
          "description": "Add a random delay to the backoff (e.g., wait + random(0,1000ms)) to prevent all clients from retrying simultaneously."
        },
        {
          "id": "D2",
          "title": "'Retry-After' Headers",
          "description": "Server returns 503 Service Unavailable with a Retry-After: 30 header that the client must obey."
        }
      ]
    },

    "phase3": {
      "title": "Architectural Evolution",
      "description": "To handle 'Google-scale' authentication spikes, the following changes are required:",
      "archSections": [
        {
          "key": "read-replicas",
          "label": "Read Replicas for Credentials",
          "desc": "Offload credential lookups (finding user by email) to read-only DB replicas to keep the Primary DB free for writes."
        },
        {
          "key": "distributed-session",
          "label": "Distributed Session Management",
          "desc": "Use stateless JWTs or a highly-available Redis cluster to verify existing sessions instead of hitting the DB every time."
        },
        {
          "key": "auth-sidecars",
          "label": "Authentication Sidecars",
          "desc": "Offload expensive cryptographic operations (password hashing) to dedicated, isolated hardware or sidecar containers to prevent starving the main application thread."
        }
      ]
    },

    "phase4": {
      "instruction": "Explain the trade-offs of your selected path. For example: 'I chose C-1 because during a total outage, protecting the database from crash is more important than letting every user in. Rate limiting provides immediate backpressure to the system.'"
    },

    "phase5": {
      "intent": "Evaluate understanding of SRE principles, load shedding, scaling, and traffic spike mitigation in authentication systems.",
      "context": "High-scale login spikes can crash both compute and database. System design must prevent cascading failures.",
      "strong_signals": [
        "Password hashing is CPU-bound and expensive",
        "Connection pooling and DB saturation is a primary bottleneck",
        "Jitter in retry/backoff prevents synchronized retry storms"
      ],
      "weak_signals": [
        "Disabling password hashing (security risk)",
        "Assuming auto-scaling is instantaneous",
        "Relying solely on vertical scaling or extra hardware"
      ],
      "recommended_solution": [
        "Combination of rate limiting and request queuing",
        "Sidecar or isolated pods for password hashing",
        "Read replicas and distributed session management",
        "Predictive scaling for planned spikes"
      ],
      "followup_questions": [
        "How would you implement a 'virtual waiting room' UI efficiently?",
        "When is predictive scaling preferable over reactive scaling?",
        "How would you ensure fair queuing for VIP vs regular users?"
      ]
    }
  }
}
];

export default  questions;