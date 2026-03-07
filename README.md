 ## /api/questions/:id 
 ```
title: "System Design Incident: The Duplicate Charge",
    slug: "duplicate-charge-payment-system",
    context: "Payment API /api/v1/payments",
    core_issue:
      "Lack of idempotency leading to multiple charges for a single user intent.",
    scenario:
      "Users retry payment requests during slow networks or timeouts, which results in the payment API processing the same request multiple times and charging the customer more than once.",
    category: "system-design",
    difficulty: "hard",
    tags: ["payments", "idempotency", "distributed-systems"],

    phases: {
      phase1: {
        question:
          "What is your immediate move to stabilize the system and prevent further duplicates?",
        options: [
          {
            id: "A",
            title: "Rate-limit the Endpoint",
            logic:
              "Reject requests from the same user if they exceed 1 request per 10 seconds."
          },
          {
            id: "B",
            title: "Client-side Debouncing",
            logic:
              "Disable the payment button after the first click to prevent double taps."
          },
          {
            id: "C",
            title: "Server-side Idempotency",
            logic:
              "Require an Idempotency-Key header. If the same key is seen again, return the cached response instead of processing the payment again."
          },
          {
            id: "D",
            title: "Database Unique Constraints",
            logic:
              "Use a unique index on order_id or transaction_id to block duplicate writes."
          }
        ]
      },

      phase2: {
        A: [
          {
            id: "A1",
            title: "Global Redis Counter",
            description:
              "Track request frequency across all server nodes using a centralized Redis cache."
          },
          {
            id: "A2",
            title: "Local In-Memory Buckets",
            description:
              "Apply rate limiting per server instance. Faster but inaccurate for distributed traffic."
          }
        ],
        B: [
          {
            id: "B1",
            title: "Hard Disable Button",
            description:
              "Disable the button until a response is received or a timeout occurs."
          },
          {
            id: "B2",
            title: "Processing Confirmation Modal",
            description:
              "Display a modal that prevents further user interaction while the request processes."
          }
        ],
        C: [
          {
            id: "C1",
            title: "Distributed Locking",
            description:
              "Use Redis Redlock to lock the idempotency key while the first request is processed."
          },
          {
            id: "C2",
            title: "Persistence-based Validation",
            description:
              "Store the idempotency key in a database table before calling the payment provider."
          }
        ],
        D: [
          {
            id: "D1",
            title: "Strict Error Handling",
            description:
              "Attempt insert and catch the UniqueViolation error to return an 'Already Processed' response."
          },
          {
            id: "D2",
            title: "Upsert (ON CONFLICT)",
            description:
              "Use ON CONFLICT DO NOTHING to ignore duplicate writes silently."
          }
        ]
      },

     phase3: {
  title: "Architectural Evolution",
  architecture_layers: [
    {
      layer: "Traffic Handling & Orchestration",
      options: [
        {
          id: "TH1",
          title: "Load Balancer",
          description: "Distributes incoming requests across multiple servers.",
          suboptions: [
            {
              id: "TH1A",
              title: "Round Robin",
              description: "Simple traffic distribution across backend servers."
            },
            {
              id: "TH1B",
              title: "Least Connections",
              description: "Send traffic to the server with the fewest active connections."
            }
          ]
        },
        {
          id: "TH2",
          title: "API Gateway",
          description: "Central entry point for all clients.",
          suboptions: [
            {
              id: "TH2A",
              title: "Authentication Middleware",
              description: "Validate JWT or OAuth tokens."
            },
            {
              id: "TH2B",
              title: "Rate Limiting",
              description: "Protect APIs from abuse or DDoS attacks."
            }
          ]
        },
        {
          id: "TH3",
          title: "Service Mesh",
          description: "Manages service-to-service communication.",
          suboptions: [
            {
              id: "TH3A",
              title: "Circuit Breaker",
              description: "Prevent cascading failures if a service goes down."
            },
            {
              id: "TH3B",
              title: "Retry Policies",
              description: "Retry failed service calls automatically."
            }
          ]
        }
      ]
    },

    {
      layer: "Processing & Business Logic",
      options: [
        {
          id: "PB1",
          title: "Web Servers",
          description: "Handle HTTP requests.",
          suboptions: [
            {
              id: "PB1A",
              title: "Nginx",
              description: "High performance reverse proxy server."
            },
            {
              id: "PB1B",
              title: "Apache",
              description: "Traditional web server."
            }
          ]
        },
        {
          id: "PB2",
          title: "Application Server",
          description: "Runs the core business logic.",
          suboptions: [
            {
              id: "PB2A",
              title: "Node.js Services",
              description: "Event-driven backend runtime."
            },
            {
              id: "PB2B",
              title: "Go Microservices",
              description: "High performance services."
            }
          ]
        },
        {
          id: "PB3",
          title: "Asynchronous Workers",
          description: "Handle background jobs.",
          suboptions: [
            {
              id: "PB3A",
              title: "Kafka",
              description: "High throughput event streaming."
            },
            {
              id: "PB3B",
              title: "RabbitMQ",
              description: "Reliable job queue."
            }
          ]
        }
      ]
    },

    {
      layer: "Data Integrity & Persistence",
      options: [
        {
          id: "DP1",
          title: "Relational Database",
          description: "ACID-compliant storage.",
          suboptions: [
            {
              id: "DP1A",
              title: "PostgreSQL",
              description: "Strong consistency relational database."
            },
            {
              id: "DP1B",
              title: "MySQL",
              description: "Widely used relational database."
            }
          ]
        },
        {
          id: "DP2",
          title: "NoSQL Database",
          description: "Horizontally scalable storage.",
          suboptions: [
            {
              id: "DP2A",
              title: "MongoDB",
              description: "Document-based database."
            },
            {
              id: "DP2B",
              title: "Cassandra",
              description: "Highly distributed database."
            }
          ]
        },
        {
          id: "DP3",
          title: "Caching Layer",
          description: "Store frequently accessed data.",
          suboptions: [
            {
              id: "DP3A",
              title: "Redis",
              description: "In-memory cache for fast reads."
            },
            {
              id: "DP3B",
              title: "Memcached",
              description: "Distributed memory caching system."
            }
          ]
        }
      ]
    },

    {
      layer: "Security & Observability",
      options: [
        {
          id: "SO1",
          title: "Identity Provider",
          description: "Manages authentication and authorization.",
          suboptions: [
            {
              id: "SO1A",
              title: "OAuth2",
              description: "Standard authorization framework."
            },
            {
              id: "SO1B",
              title: "JWT",
              description: "Stateless authentication tokens."
            }
          ]
        },
        {
          id: "SO2",
          title: "Logging & Monitoring",
          description: "Track system health and errors.",
          suboptions: [
            {
              id: "SO2A",
              title: "Prometheus",
              description: "Metrics monitoring system."
            },
            {
              id: "SO2B",
              title: "ELK Stack",
              description: "Centralized logging system."
            }
          ]
        },
        {
          id: "SO3",
          title: "Content Delivery Network",
          description: "Cache static assets geographically.",
          suboptions: [
            {
              id: "SO3A",
              title: "Cloudflare",
              description: "Global CDN network."
            },
            {
              id: "SO3B",
              title: "AWS CloudFront",
              description: "AWS edge distribution network."
            }
          ]
        }
      ]
    }
  ]
},

      phase4: {
        instruction:
          "Explain the trade-offs of your selected architecture decisions and why they best solve the duplicate charge issue."
      },

      phase5: {
        intent:
          "The interviewer wants to evaluate whether the candidate understands how distributed systems prevent duplicate financial transactions.",
        context:
          "Payment APIs must guarantee that one user intent results in exactly one charge even if requests are retried.",
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
 ```