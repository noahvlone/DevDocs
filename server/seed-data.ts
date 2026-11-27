import { Project, Article } from '../src/types/doc';

export const initialProjects: Project[] = [
  {
    id: 'proj_paynusantara',
    name: 'PayNusantara Gateway',
    slug: 'paynusantara',
    description: 'High-throughput payment orchestration API for QRIS, Virtual Accounts, Credit Cards, and E-Wallets across Southeast Asia.',
    version: 'v2.4.1',
    branch: 'main',
    commitSha: '9f2a71c',
    icon: 'CreditCard',
    badge: 'Public',
    tags: ['FinTech', 'REST API', 'Webhooks', 'PCI-DSS'],
    updatedAt: '2026-11-20T14:30:00Z',
    stars: 342,
    forks: 89,
    sections: [
      {
        id: 'sec_pn_getting_started',
        title: 'Getting Started',
        slug: 'getting-started',
        order: 1,
        articles: [
          {
            id: 'art_pn_overview',
            title: 'Overview & Architecture',
            slug: 'overview',
            type: 'guide',
            order: 1
          },
          {
            id: 'art_pn_authentication',
            title: 'Authentication & Signatures',
            slug: 'authentication',
            type: 'guide',
            order: 2
          },
          {
            id: 'art_pn_errors',
            title: 'Error Handling & Idempotency',
            slug: 'errors',
            type: 'guide',
            order: 3
          }
        ]
      },
      {
        id: 'sec_pn_payments',
        title: 'Payments API',
        slug: 'payments-api',
        order: 2,
        articles: [
          {
            id: 'art_pn_create_charge',
            title: 'Create Payment Charge',
            slug: 'create-charge',
            type: 'api',
            method: 'POST',
            path: '/v1/charges',
            order: 1
          },
          {
            id: 'art_pn_get_charge',
            title: 'Get Charge Status',
            slug: 'get-charge',
            type: 'api',
            method: 'GET',
            path: '/v1/charges/:id',
            order: 2
          },
          {
            id: 'art_pn_refund',
            title: 'Create Refund',
            slug: 'create-refund',
            type: 'api',
            method: 'POST',
            path: '/v1/charges/:id/refund',
            order: 3
          }
        ]
      },
      {
        id: 'sec_pn_webhooks',
        title: 'Webhooks & Events',
        slug: 'webhooks',
        order: 3,
        articles: [
          {
            id: 'art_pn_webhooks_guide',
            title: 'Webhook Verification',
            slug: 'webhook-verification',
            type: 'guide',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'proj_neuroflow',
    name: 'NeuroFlow AI Engine',
    slug: 'neuroflow',
    description: 'Enterprise AI inference engine SDK supporting multi-modal streaming, dense embeddings, and RAG vector searches.',
    version: 'v1.8.0',
    branch: 'release/v1.8',
    commitSha: '4b1e890',
    icon: 'Cpu',
    badge: 'Public',
    tags: ['Machine Learning', 'LLM', 'Streaming', 'Vector Search'],
    updatedAt: '2026-11-25T09:15:00Z',
    stars: 1250,
    forks: 310,
    sections: [
      {
        id: 'sec_nf_intro',
        title: 'Introduction',
        slug: 'introduction',
        order: 1,
        articles: [
          {
            id: 'art_nf_quickstart',
            title: 'SDK Quickstart (Python & TS)',
            slug: 'quickstart',
            type: 'guide',
            order: 1
          },
          {
            id: 'art_nf_models',
            title: 'Supported Models & Quotas',
            slug: 'models',
            type: 'guide',
            order: 2
          }
        ]
      },
      {
        id: 'sec_nf_inference',
        title: 'Inference API',
        slug: 'inference-api',
        order: 2,
        articles: [
          {
            id: 'art_nf_chat',
            title: 'Chat Completions',
            slug: 'chat-completions',
            type: 'api',
            method: 'POST',
            path: '/v1/chat/completions',
            order: 1
          },
          {
            id: 'art_nf_embeddings',
            title: 'Create Embeddings',
            slug: 'create-embeddings',
            type: 'api',
            method: 'POST',
            path: '/v1/embeddings',
            order: 2
          },
          {
            id: 'art_nf_vector_search',
            title: 'Vector Search Index',
            slug: 'vector-search',
            type: 'api',
            method: 'POST',
            path: '/v1/vectors/search',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'proj_storegrid',
    name: 'StoreGrid Warehouse Core',
    slug: 'storegrid',
    description: 'Distributed inventory synchronization & event streaming engine for multi-channel omnichannel logistics.',
    version: 'v3.0.2',
    branch: 'master',
    commitSha: 'a7c3310',
    icon: 'Layers',
    badge: 'Internal',
    tags: ['Microservices', 'Logistics', 'Inventory', 'Event-Driven'],
    updatedAt: '2026-11-26T18:45:00Z',
    stars: 180,
    forks: 42,
    sections: [
      {
        id: 'sec_sg_arch',
        title: 'Architecture',
        slug: 'architecture',
        order: 1,
        articles: [
          {
            id: 'art_sg_overview',
            title: 'System Topology & CDC',
            slug: 'system-topology',
            type: 'guide',
            order: 1
          }
        ]
      },
      {
        id: 'sec_sg_inventory',
        title: 'Inventory Service',
        slug: 'inventory-service',
        order: 2,
        articles: [
          {
            id: 'art_sg_check',
            title: 'Check SKU Stock Level',
            slug: 'check-sku',
            type: 'api',
            method: 'GET',
            path: '/v2/inventory/:sku',
            order: 1
          },
          {
            id: 'art_sg_reserve',
            title: 'Reserve Stock Hold',
            slug: 'reserve-stock',
            type: 'api',
            method: 'POST',
            path: '/v2/inventory/reserve',
            order: 2
          }
        ]
      }
    ]
  }
];

export const initialArticles: Article[] = [
  // --- PayNusantara Articles ---
  {
    id: 'art_pn_overview',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_getting_started',
    title: 'Overview & Architecture',
    slug: 'overview',
    description: 'Learn about the core design of PayNusantara Gateway API, environments, and integration lifecycle.',
    type: 'guide',
    order: 1,
    updatedAt: '2026-11-20T14:30:00Z',
    content: `# PayNusantara Gateway API Overview

PayNusantara Gateway provides a unified REST API for processing online transactions across Indonesia and Southeast Asia. It unifies national payment rails including **BI-FAST Virtual Accounts**, **QRIS (Quick Response Code Indonesian Standard)**, **Direct Debit**, and major **Credit Card** networks.

> [!NOTE]
> All requests must be performed over HTTPS TLS 1.3. Plain HTTP connections are automatically rejected with \`403 Forbidden\`.

## Core Environments

PayNusantara maintains two distinct isolated environments. Use your sandbox keys for staging and testing:

| Environment | Base URL | Purpose |
| :--- | :--- | :--- |
| **Sandbox** | \`https://sandbox.api.paynusantara.id\` | Testing, mock settlements, automated CI tests |
| **Production** | \`https://api.paynusantara.id\` | Live real-money settlement rail |

## Architectural Flow

The lifecycle of an automated transaction follows the standard asynchronous callback model:

1. **Charge Creation**: Merchant server calls \`POST /v1/charges\` with order amount and payment channel.
2. **Payment Display**: PayNusantara returns a Virtual Account number or dynamic QRIS payload for the customer.
3. **Customer Execution**: Customer scans QRIS or completes transfer via mobile banking.
4. **Instant Webhook**: PayNusantara issues a cryptographically signed HMAC-SHA256 webhook to your registered callback URL.
5. **Fulfillment**: Merchant backend verifies webhook signature and fulfills the customer order.

\`\`\`json
{
  "event": "payment.succeeded",
  "id": "evt_998124a9c",
  "created_at": 1732700000,
  "data": {
    "charge_id": "chg_8819f2a0b1c2",
    "order_id": "ORD-2026-9921",
    "amount": 250000,
    "currency": "IDR",
    "status": "PAID"
  }
}
\`\`\`
`
  },
  {
    id: 'art_pn_authentication',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_getting_started',
    title: 'Authentication & Signatures',
    slug: 'authentication',
    description: 'Understand API Key formats, Bearer headers, and HMAC SHA256 request signatures.',
    type: 'guide',
    order: 2,
    updatedAt: '2026-11-21T10:15:00Z',
    content: `# Authentication & Signatures

Every API request to PayNusantara must authenticate via the \`Authorization\` header and carry an idempotency key to prevent double charging.

## API Keys

Your account provides two secret keys:
- **Sandbox Secret**: Prefixed with \`sk_test_\`
- **Production Secret**: Prefixed with \`sk_live_\`

\`\`\`http
Authorization: Bearer sk_test_51MzQ3wE8J4K19Pz...
Content-Type: application/json
X-Idempotency-Key: a3f1c990-21a4-4a55-8910-1849a2efb301
\`\`\`

> [!WARNING]
> Never disclose your secret key in client-side applications (SPA, mobile apps, or public GitHub repositories). All requests must originate from your secure backend server.

## Calculating Request Signatures

For high-security operations (e.g., disbursements and direct debit setup), you must attach an \`X-Signature\` header calculated as:

\`\`\`
Signature = HMAC_SHA256(SecretKey, HTTP_METHOD + ":" + PATH + ":" + TIMESTAMP + ":" + HASH(BODY))
\`\`\`

Here is a reference implementation in Node.js:

\`\`\`typescript
import crypto from 'crypto';

export function generateSignature(
  secretKey: string,
  method: string,
  path: string,
  timestamp: string,
  body: object
): string {
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');

  const payload = \`\${method.toUpperCase()}:\${path}:\${timestamp}:\${bodyHash}\`;
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}
\`\`\`
`
  },
  {
    id: 'art_pn_errors',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_getting_started',
    title: 'Error Handling & Idempotency',
    slug: 'errors',
    description: 'Standard HTTP error codes, error envelope format, and automatic retries.',
    type: 'guide',
    order: 3,
    updatedAt: '2026-11-22T08:00:00Z',
    content: `# Error Handling & Idempotency

PayNusantara uses conventional HTTP status codes to indicate the success or failure of an API request.

## Error Response Format

Errors always return a structured JSON object containing an \`error\` block with a unique incident code for quick tracing:

\`\`\`json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "The source account does not have sufficient funds to complete the transaction.",
    "field": "amount",
    "trace_id": "trc_4419ad20bb4"
  }
}
\`\`\`

## Common Error Codes

| Status | Code | Description |
| :--- | :--- | :--- |
| **400** | \`INVALID_PAYLOAD\` | Missing required parameters or malformed JSON structure |
| **401** | \`UNAUTHORIZED\` | Invalid or expired API Key supplied |
| **403** | \`IP_NOT_WHITELISTED\` | Production traffic originated from an unapproved IP |
| **409** | \`IDEMPOTENCY_CONFLICT\` | Request sent with duplicate \`X-Idempotency-Key\` but different parameters |
| **429** | \`RATE_LIMIT_EXCEEDED\` | Maximum rate limit of 120 req/second reached |

> [!TIP]
> Always implement exponential backoff with jitter when encountering \`429 Rate Limit Exceeded\` or \`502 Bad Gateway\` responses.
`
  },
  {
    id: 'art_pn_create_charge',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_payments',
    title: 'Create Payment Charge',
    slug: 'create-charge',
    description: 'Initialize a charge for Virtual Account, QRIS, or Credit Card payment.',
    type: 'api',
    order: 1,
    updatedAt: '2026-11-23T11:20:00Z',
    content: `# Create Payment Charge

Creates a new charge object. Depending on the \`payment_method\` chosen, the response will include payment instructions such as a **Virtual Account number**, a **QRIS raw string**, or an **approval redirect URL**.

### Idempotency
To prevent accidental duplicate payments on network timeouts, always supply a unique UUID in the \`X-Idempotency-Key\` header.

### Supported Channels
- \`qris\`: Dynamic Indonesian standard QR code
- \`bca_va\`: Bank Central Asia Virtual Account
- \`mandiri_va\`: Bank Mandiri Bill Payment
- \`bri_va\`: Bank Rakyat Indonesia BRIVA
- \`bni_va\`: Bank Negara Indonesia Virtual Account
- \`credit_card\`: Visa / Mastercard / JCB 3DS 2.0
`,
    endpoint: {
      method: 'POST',
      path: '/v1/charges',
      baseUrl: 'https://sandbox.api.paynusantara.id',
      summary: 'Initiate a new payment charge across supported payment rails.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token with your secret API key (e.g. Bearer sk_test_...)',
          example: 'Bearer sk_test_paynusantara_demo'
        },
        {
          name: 'X-Idempotency-Key',
          type: 'string',
          required: false,
          description: 'Unique client-generated UUID to ensure idempotent processing',
          example: 'a4b8-9912-4c22-90ab'
        }
      ],
      queryParams: [],
      pathParams: [],
      requestBodySchema: JSON.stringify({
        order_id: "ORD-2026-78912",
        amount: 350000,
        currency: "IDR",
        payment_method: "qris",
        customer: {
          name: "Rizky Firmansyah",
          email: "rizky.firman@example.com",
          phone: "+6281234567890"
        },
        description: "Payment for Cloud Server Annual Subscription #78912",
        callback_url: "https://myshop.com/payment/callback"
      }, null, 2),
      mockResponse: {
        status: 201,
        statusText: 'Created',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'req_719028abff',
          'X-RateLimit-Remaining': '119'
        },
        body: {
          id: "chg_8819f2a0b1c2",
          order_id: "ORD-2026-78912",
          status: "PENDING",
          amount: 350000,
          currency: "IDR",
          payment_method: "qris",
          qris_payload: "00020101021226670016ID.CO.PAYNUSANTARA.WWW01189360099881234567890215chg_8819f2a0b1c252045812530336054063500005802ID5914MYSHOP MERCH6007JAKARTA62070703A01630489AB",
          qr_image_url: "https://sandbox.api.paynusantara.id/v1/qr/chg_8819f2a0b1c2.png",
          expires_at: "2026-11-27T11:45:00Z",
          created_at: "2026-11-27T11:15:00Z"
        }
      }
    }
  },
  {
    id: 'art_pn_get_charge',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_payments',
    title: 'Get Charge Status',
    slug: 'get-charge',
    description: 'Retrieve real-time transaction status and payment timestamps.',
    type: 'api',
    order: 2,
    updatedAt: '2026-11-23T12:00:00Z',
    content: `# Get Charge Status

Retrieves the current status of an existing charge using its unique identifier (\`chg_...\`).

Use this endpoint for polling transactions if webhook delivery fails or for periodic reconciliation jobs.
`,
    endpoint: {
      method: 'GET',
      path: '/v1/charges/:id',
      baseUrl: 'https://sandbox.api.paynusantara.id',
      summary: 'Fetch the real-time settlement status of a specific charge.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token with your secret API key',
          example: 'Bearer sk_test_paynusantara_demo'
        }
      ],
      queryParams: [],
      pathParams: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'The unique charge identifier returned during creation',
          example: 'chg_8819f2a0b1c2'
        }
      ],
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'req_992102feea'
        },
        body: {
          id: "chg_8819f2a0b1c2",
          order_id: "ORD-2026-78912",
          status: "PAID",
          amount: 350000,
          currency: "IDR",
          payment_method: "qris",
          settlement_time: "2026-11-27T11:17:34Z",
          acquirer: "BANK_INDONESIA_QRIS",
          fee: 2450,
          net_amount: 347550
        }
      }
    }
  },
  {
    id: 'art_pn_refund',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_payments',
    title: 'Create Refund',
    slug: 'create-refund',
    description: 'Issue a partial or full refund for a settled charge.',
    type: 'api',
    order: 3,
    updatedAt: '2026-11-23T14:10:00Z',
    content: `# Create Refund

Initiates an automated reversal or refund for a previously successful charge. Partial refunds are supported up to the original transaction value.
`,
    endpoint: {
      method: 'POST',
      path: '/v1/charges/:id/refund',
      baseUrl: 'https://sandbox.api.paynusantara.id',
      summary: 'Process a full or partial refund on a paid charge.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer secret API key',
          example: 'Bearer sk_test_paynusantara_demo'
        }
      ],
      queryParams: [],
      pathParams: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Target charge ID to refund',
          example: 'chg_8819f2a0b1c2'
        }
      ],
      requestBodySchema: JSON.stringify({
        amount: 350000,
        reason: "Customer requested order cancellation before dispatch",
        refund_id: "ref_custom_90912"
      }, null, 2),
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          refund_id: "ref_90912ab45",
          charge_id: "chg_8819f2a0b1c2",
          status: "REFUNDED",
          amount_refunded: 350000,
          currency: "IDR",
          created_at: "2026-11-27T11:30:00Z"
        }
      }
    }
  },
  {
    id: 'art_pn_webhooks_guide',
    projectId: 'proj_paynusantara',
    sectionId: 'sec_pn_webhooks',
    title: 'Webhook Verification',
    slug: 'webhook-verification',
    description: 'Validate webhook signatures using HMAC-SHA256 in Node.js, Go, or Python.',
    type: 'guide',
    order: 1,
    updatedAt: '2026-11-24T16:00:00Z',
    content: `# Webhook Verification

Whenever a payment is settled, expired, or refunded, PayNusantara delivers an asynchronous HTTP POST request to your webhook endpoint.

> [!IMPORTANT]
> Your webhook endpoint must respond with an HTTP \`200 OK\` within **5000ms**. If an error or timeout occurs, PayNusantara retries up to 8 times with exponential backoff.

## Verifying Webhook Signatures

Each webhook payload includes the \`X-PayNusantara-Signature\` header. Compute the HMAC-SHA256 signature using your Webhook Secret:

\`\`\`python
import hmac
import hashlib

def verify_webhook(raw_payload_bytes: bytes, received_signature: str, webhook_secret: str) -> bool:
    computed = hmac.new(
        webhook_secret.encode('utf-8'),
        raw_payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed, received_signature)
\`\`\`
`
  },

  // --- NeuroFlow AI SDK Articles ---
  {
    id: 'art_nf_quickstart',
    projectId: 'proj_neuroflow',
    sectionId: 'sec_nf_intro',
    title: 'SDK Quickstart (Python & TS)',
    slug: 'quickstart',
    description: 'Install NeuroFlow SDK, initialize client credentials, and run your first completion.',
    type: 'guide',
    order: 1,
    updatedAt: '2026-11-25T09:15:00Z',
    content: `# NeuroFlow SDK Quickstart

The **NeuroFlow SDK** gives developers ultra-low-latency access to frontier language models, multi-modal vision encoders, and vector search engines.

## Installation

Install using your favorite package manager:

\`\`\`bash
# Node.js / TypeScript
npm install @neuroflow/ai-sdk

# Python 3.10+
pip install neuroflow-engine
\`\`\`

## Initializing the Client

\`\`\`typescript
import { NeuroFlow } from '@neuroflow/ai-sdk';

const client = new NeuroFlow({
  apiKey: process.env.NEUROFLOW_API_KEY,
  timeoutMs: 15000,
});

async function main() {
  const response = await client.chat.create({
    model: 'neuro-4-turbo',
    messages: [
      { role: 'system', content: 'You are an expert systems engineer.' },
      { role: 'user', content: 'Explain raft consensus algorithm in 3 concise bullet points.' }
    ],
    temperature: 0.2,
  });

  console.log(response.choices[0].message.content);
}

main();
\`\`\`
`
  },
  {
    id: 'art_nf_models',
    projectId: 'proj_neuroflow',
    sectionId: 'sec_nf_intro',
    title: 'Supported Models & Quotas',
    slug: 'models',
    description: 'Compare model context windows, tokens per minute (TPM), and latency profiles.',
    type: 'guide',
    order: 2,
    updatedAt: '2026-11-25T10:00:00Z',
    content: `# Supported Models & Quotas

NeuroFlow offers optimized models designed for different computational workloads:

| Model ID | Context Window | Max Output | Primary Use Case |
| :--- | :--- | :--- | :--- |
| \`neuro-4-turbo\` | 128,000 tokens | 8,192 tokens | High-reasoning tasks, code generation, architectural analysis |
| \`neuro-4-flash\` | 64,000 tokens | 4,096 tokens | Ultra-low latency chatbot (< 80ms TTFT), real-time triage |
| \`neuro-embed-dense-v2\` | 8,192 tokens | 1536 dims | Dense semantic vector representation, hybrid search indexing |
`
  },
  {
    id: 'art_nf_chat',
    projectId: 'proj_neuroflow',
    sectionId: 'sec_nf_inference',
    title: 'Chat Completions',
    slug: 'chat-completions',
    description: 'Generate multi-turn conversational responses with streaming or JSON schema enforcement.',
    type: 'api',
    order: 1,
    updatedAt: '2026-11-25T11:00:00Z',
    content: `# Chat Completions

Creates a model response for the given chat conversation. Supports structured JSON schema outputs and tool function calling.
`,
    endpoint: {
      method: 'POST',
      path: '/v1/chat/completions',
      baseUrl: 'https://api.neuroflow.ai',
      summary: 'Generate text or structured response from chat history.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token API key',
          example: 'Bearer nf_live_901283810293'
        },
        {
          name: 'Content-Type',
          type: 'string',
          required: true,
          description: 'Content type header',
          example: 'application/json'
        }
      ],
      queryParams: [],
      pathParams: [],
      requestBodySchema: JSON.stringify({
        model: "neuro-4-turbo",
        messages: [
          { role: "system", content: "You are a code documentation assistant." },
          { role: "user", content: "Write a high-performance Go struct for a Redis cache item." }
        ],
        temperature: 0.3,
        max_tokens: 500
      }, null, 2),
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Neuro-Tokens-Prompt': '32',
          'X-Neuro-Tokens-Completion': '88'
        },
        body: {
          id: "chatcmpl_88921a4f0",
          object: "chat.completion",
          created: 1732704100,
          model: "neuro-4-turbo",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: "```go\ntype CacheItem struct {\n\tKey       string        `json:\"key\"`\n\tValue     []byte        `json:\"val\"`\n\tExpiresAt time.Time     `json:\"exp\"`\n\tVersion   uint64        `json:\"ver\"`\n}\n```"
              },
              finish_reason: "stop"
            }
          ],
          usage: {
            prompt_tokens: 32,
            completion_tokens: 88,
            total_tokens: 120
          }
        }
      }
    }
  },
  {
    id: 'art_nf_embeddings',
    projectId: 'proj_neuroflow',
    sectionId: 'sec_nf_inference',
    title: 'Create Embeddings',
    slug: 'create-embeddings',
    description: 'Generate high-dimensional vector representations for texts.',
    type: 'api',
    order: 2,
    updatedAt: '2026-11-25T11:45:00Z',
    content: `# Create Embeddings

Converts text inputs into an array of floating-point numbers suitable for similarity matching and clustering.
`,
    endpoint: {
      method: 'POST',
      path: '/v1/embeddings',
      baseUrl: 'https://api.neuroflow.ai',
      summary: 'Produce 1536-dimensional dense vector embeddings.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer token API key',
          example: 'Bearer nf_live_901283810293'
        }
      ],
      queryParams: [],
      pathParams: [],
      requestBodySchema: JSON.stringify({
        model: "neuro-embed-dense-v2",
        input: [
          "Building scalable real-time microservices with Go and gRPC",
          "PostgreSQL index optimization for high read volume tables"
        ]
      }, null, 2),
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          object: "list",
          data: [
            {
              object: "embedding",
              index: 0,
              embedding: [0.0124, -0.0451, 0.0892, 0.0031, -0.0612, 0.0381, "... (1536 dims)"]
            },
            {
              object: "embedding",
              index: 1,
              embedding: [-0.0318, 0.0211, -0.0142, 0.0883, 0.0412, -0.0195, "... (1536 dims)"]
            }
          ],
          usage: {
            prompt_tokens: 28,
            total_tokens: 28
          }
        }
      }
    }
  },
  {
    id: 'art_nf_vector_search',
    projectId: 'proj_neuroflow',
    sectionId: 'sec_nf_inference',
    title: 'Vector Search Index',
    slug: 'vector-search',
    description: 'Execute k-nearest neighbors (k-NN) queries against pre-indexed vector collections.',
    type: 'api',
    order: 3,
    updatedAt: '2026-11-25T12:30:00Z',
    content: `# Vector Search Index

Performs cosine similarity or Euclidean distance search against a managed vector index.
`,
    endpoint: {
      method: 'POST',
      path: '/v1/vectors/search',
      baseUrl: 'https://api.neuroflow.ai',
      summary: 'Query top-K nearest document chunks by semantic relevance.',
      headers: [
        {
          name: 'Authorization',
          type: 'string',
          required: true,
          description: 'Bearer API Key',
          example: 'Bearer nf_live_901283810293'
        }
      ],
      queryParams: [],
      pathParams: [],
      requestBodySchema: JSON.stringify({
        collection_id: "col_kb_docs_v1",
        query_text: "How to configure SSL TLS termination in NGINX",
        top_k: 3,
        min_score: 0.78
      }, null, 2),
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          collection_id: "col_kb_docs_v1",
          total_matches: 3,
          results: [
            {
              id: "doc_nginx_ssl_01",
              score: 0.9412,
              metadata: {
                title: "NGINX SSL/TLS Configuration Guide",
                category: "DevOps",
                section: "Certificates"
              },
              content: "To configure SSL termination, specify ssl_certificate and ssl_certificate_key in your server block."
            },
            {
              id: "doc_nginx_ssl_02",
              score: 0.8654,
              metadata: {
                title: "Enforcing HTTP Strict Transport Security (HSTS)",
                category: "Security"
              },
              content: "Add add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains' always;"
            }
          ]
        }
      }
    }
  },

  // --- StoreGrid Warehouse Core ---
  {
    id: 'art_sg_overview',
    projectId: 'proj_storegrid',
    sectionId: 'sec_sg_arch',
    title: 'System Topology & CDC',
    slug: 'system-topology',
    description: 'Overview of StoreGrid multi-warehouse replication, Redis distributed locking, and Kafka CDC pipelines.',
    type: 'guide',
    order: 1,
    updatedAt: '2026-11-26T18:45:00Z',
    content: `# StoreGrid Warehouse System Topology

StoreGrid coordinates inventory counts across 14 fulfilment centers simultaneously. To eliminate race conditions during flash sales, it leverages **Redis Redlock distributed locking** and event streaming via Apache Kafka.

\`\`\`
[ Client Checkout ] ──> [ API Gateway ] ──> [ StoreGrid Core ]
                                                  │
                            ┌─────────────────────┴─────────────────────┐
                            ▼                                           ▼
                 [ Redis Redlock Cluster ]                   [ Kafka Event Stream ]
                   (Atomic Stock Hold)                         (CDC Inventory Bus)
\`\`\`

> [!TIP]
> Stock reservations expire automatically after **15 minutes** if no confirmation event is published by the order checkout coordinator.
`
  },
  {
    id: 'art_sg_check',
    projectId: 'proj_storegrid',
    sectionId: 'sec_sg_inventory',
    title: 'Check SKU Stock Level',
    slug: 'check-sku',
    description: 'Query available, reserved, and defective inventory counts for a given product SKU.',
    type: 'api',
    order: 1,
    updatedAt: '2026-11-26T19:00:00Z',
    content: `# Check SKU Stock Level

Returns total physical on-hand quantity, active reservations, and net available units across fulfillment hubs.
`,
    endpoint: {
      method: 'GET',
      path: '/v2/inventory/:sku',
      baseUrl: 'https://internal.storegrid.io',
      summary: 'Get stock level breakdown by SKU across warehouses.',
      headers: [
        {
          name: 'X-StoreGrid-Secret',
          type: 'string',
          required: true,
          description: 'Internal microservice auth token',
          example: 'sg_int_884910a2bb'
        }
      ],
      queryParams: [
        {
          name: 'warehouse_id',
          type: 'string',
          required: false,
          description: 'Filter by warehouse hub (e.g. WH-CGK-01)',
          example: 'WH-CGK-01'
        }
      ],
      pathParams: [
        {
          name: 'sku',
          type: 'string',
          required: true,
          description: 'Stock Keeping Unit identifier',
          example: 'MACBOOK-M3-16-512'
        }
      ],
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          sku: "MACBOOK-M3-16-512",
          on_hand: 1420,
          reserved: 45,
          available: 1375,
          warehouses: [
            { id: "WH-CGK-01", name: "Cengkareng Hub", available: 820 },
            { id: "WH-SUB-02", name: "Surabaya Hub", available: 555 }
          ]
        }
      }
    }
  },
  {
    id: 'art_sg_reserve',
    projectId: 'proj_storegrid',
    sectionId: 'sec_sg_inventory',
    title: 'Reserve Stock Hold',
    slug: 'reserve-stock',
    description: 'Atomically reserve stock for an active checkout session.',
    type: 'api',
    order: 2,
    updatedAt: '2026-11-26T19:30:00Z',
    content: `# Reserve Stock Hold

Locks items for a customer cart for up to 900 seconds. If not confirmed, stock is automatically released back to the general pool.
`,
    endpoint: {
      method: 'POST',
      path: '/v2/inventory/reserve',
      baseUrl: 'https://internal.storegrid.io',
      summary: 'Create an atomic reservation lock on inventory items.',
      headers: [
        {
          name: 'X-StoreGrid-Secret',
          type: 'string',
          required: true,
          description: 'Internal service token',
          example: 'sg_int_884910a2bb'
        }
      ],
      queryParams: [],
      pathParams: [],
      requestBodySchema: JSON.stringify({
        cart_id: "crt_9981240192",
        sku: "MACBOOK-M3-16-512",
        quantity: 2,
        ttl_seconds: 900
      }, null, 2),
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          reservation_id: "resv_4819028",
          cart_id: "crt_9981240192",
          sku: "MACBOOK-M3-16-512",
          reserved_quantity: 2,
          expires_at: "2026-11-27T11:45:00Z",
          status: "LOCKED"
        }
      }
    }
  }
];
