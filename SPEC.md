# RIGWISE - LLM Compatibility Analyzer
## Complete Technical Specification v1.0
**Generated:** November 12, 2025

---

## 1. Technology Stack

### **Frontend**
- **Framework:** Next.js 15.0 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 4.0 + shadcn/ui components
- **Forms:** React Hook Form + Zod validation
- **State:** React Context + Zustand (for hardware profiles)
- **Charts:** Recharts (for progress bars/visualizations)

### **Backend**
- **API Layer:** tRPC v11 (type-safe API)
- **Runtime:** Node.js 20+ LTS
- **Validation:** Zod schemas (shared with frontend)

### **Database**
- **DBMS:** PostgreSQL 16
- **ORM:** Prisma 5.x
- **Migrations:** Prisma Migrate
- **Connection Pooling:** PgBouncer (production)

### **Authentication** (Phase 2)
- **Library:** NextAuth.js v5 (Auth.js)
- **Providers:** Email/Password, Google OAuth

### **Deployment**
- **Platform:** Vercel (recommended) or Railway
- **Database:** Supabase or Neon (serverless Postgres)
- **CDN:** Vercel Edge Network

---

## 2. Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========== USER MANAGEMENT ==========
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts           Account[]
  sessions           Session[]
  hardwareProfiles   HardwareProfile[]
  compatibilityTests CompatibilityAnalysis[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

// ========== HARDWARE PROFILES ==========
model HardwareProfile {
  id          String   @id @default(cuid())
  userId      String?  // Nullable for guest users
  name        String   // e.g., "Gaming Rig", "Workstation"
  
  // CPU
  cpuBrand    String   // "Intel" | "AMD"
  cpuModel    String   // "i9-13900K", "Ryzen 9 7950X"
  cpuCores    Int
  cpuThreads  Int
  
  // GPU
  gpuBrand    String   // "NVIDIA" | "AMD" | "Intel"
  gpuModel    String   // "RTX 4090", "RX 7900 XTX"
  vramGB      Int      // Total VRAM in GB
  
  // RAM
  ramGB       Int      // Total system RAM in GB
  ramType     String   // "DDR4" | "DDR5"
  ramSpeed    Int?     // MHz (optional)
  
  // Storage
  storageGB   Int      // Available storage in GB
  storageType String   // "SSD" | "NVMe" | "HDD"
  
  // Metadata
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user                  User?                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  compatibilityAnalyses CompatibilityAnalysis[]
  
  @@index([userId])
  @@map("hardware_profiles")
}

// ========== LLM MODELS ==========
model LLMModel {
  id              String   @id @default(cuid())
  huggingFaceId   String   @unique // e.g., "meta-llama/Llama-3-70b"
  name            String   // Display name
  architecture    String   // "Llama", "Mistral", "Gemma"
  
  // Model Size
  parameterCount  Float    // In billions (e.g., 7.0, 70.0)
  quantization    String?  // "4-bit", "8-bit", "FP16", null for full precision
  
  // Resource Requirements (base estimates)
  baseVramGB      Float    // Minimum VRAM needed
  baseRamGB       Float    // Minimum RAM needed
  minStorageGB    Int      // Model file size
  
  // Context
  maxContextLength Int     @default(4096)
  
  // Metadata
  modelCardUrl    String?  // Link to Hugging Face
  lastSynced      DateTime @default(now())
  createdAt       DateTime @default(now())
  
  compatibilityAnalyses CompatibilityAnalysis[]
  
  @@index([huggingFaceId])
  @@map("llm_models")
}

// ========== COMPATIBILITY ANALYSIS ==========
model CompatibilityAnalysis {
  id        String   @id @default(cuid())
  userId    String?  // Nullable for guest users
  profileId String
  modelId   String
  
  // Analysis Results
  isCompatible        Boolean
  compatibilityScore  Float    // 0-100 scale
  
  // Resource Usage Estimates
  estimatedVramGB     Float
  estimatedRamGB      Float
  estimatedStorageGB  Int
  
  // Bottlenecks (JSON array of strings)
  bottlenecks         Json?    // ["Insufficient VRAM", "CPU may bottleneck"]
  
  // Upgrade Recommendations
  recommendations     Json?    // [{"type": "GPU", "product": "RTX 4080", "affiliateLink": "..."}]
  
  // Metadata
  createdAt           DateTime @default(now())
  
  user    User?            @relation(fields: [userId], references: [id], onDelete: Cascade)
  profile HardwareProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  model   LLMModel         @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([profileId])
  @@index([modelId])
  @@map("compatibility_analyses")
}

// ========== UPGRADE PRODUCTS ==========
model UpgradeProduct {
  id              String   @id @default(cuid())
  type            String   // "GPU" | "RAM" | "CPU" | "Storage"
  brand           String   // "NVIDIA", "Corsair", etc.
  model           String   // "RTX 4080", "Vengeance RGB 64GB"
  specs           Json     // {"vram": 16, "cores": 16} - flexible specs
  
  // Affiliate Links
  amazonLink      String?
  neweggLink      String?
  
  // Pricing (optional, for display)
  msrpUSD         Float?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([type])
  @@map("upgrade_products")
}
```

---

## 3. tRPC API Contract

### **Router Structure**
```
src/server/api/
├── root.ts                 # Root router
├── routers/
│   ├── hardware.ts         # Hardware profile CRUD
│   ├── model.ts            # LLM model operations
│   ├── compatibility.ts    # Compatibility analysis
│   └── upgrade.ts          # Upgrade recommendations
└── trpc.ts                 # tRPC setup
```

### **3.1 Hardware Router**

```typescript
// hardware.ts
export const hardwareRouter = createTRPCRouter({
  // Create new hardware profile
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      cpuBrand: z.enum(["Intel", "AMD"]),
      cpuModel: z.string(),
      cpuCores: z.number().int().min(1),
      cpuThreads: z.number().int().min(1),
      gpuBrand: z.enum(["NVIDIA", "AMD", "Intel"]),
      gpuModel: z.string(),
      vramGB: z.number().int().min(1),
      ramGB: z.number().int().min(4),
      ramType: z.enum(["DDR4", "DDR5"]),
      ramSpeed: z.number().int().optional(),
      storageGB: z.number().int().min(50),
      storageType: z.enum(["SSD", "NVMe", "HDD"]),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // List user's profiles
  list: protectedProcedure
    .query(async ({ ctx }) => { /* ... */ }),

  // Get single profile
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Update profile
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      // ... same fields as create
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Delete profile
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Set as default
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
});
```

### **3.2 Model Router**

```typescript
// model.ts
export const modelRouter = createTRPCRouter({
  // Parse Hugging Face URL
  parseHuggingFace: publicProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      // Fetch model card, extract params
      // Return: { name, parameterCount, quantization, ... }
    }),

  // Search models by name
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => { /* ... */ }),

  // Get popular models
  getPopular: publicProcedure
    .query(async () => {
      // Return preset models: Llama 3, Mistral, Gemma
    }),

  // Get model by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => { /* ... */ }),
});
```

### **3.3 Compatibility Router**

```typescript
// compatibility.ts
export const compatibilityRouter = createTRPCRouter({
  // Analyze compatibility
  analyze: publicProcedure
    .input(z.object({
      profileId: z.string(),
      modelId: z.string(),
      contextLength: z.number().int().min(512).max(128000).default(4096),
      batchSize: z.number().int().min(1).max(64).default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Run compatibility algorithm (see section 4)
      // Return: { isCompatible, score, estimatedVram, ... }
    }),

  // Get analysis history
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get single analysis
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => { /* ... */ }),
});
```

### **3.4 Upgrade Router**

```typescript
// upgrade.ts
export const upgradeRouter = createTRPCRouter({
  // Get recommendations based on analysis
  getRecommendations: publicProcedure
    .input(z.object({
      analysisId: z.string(),
    }))
    .query(async ({ input }) => {
      // Query UpgradeProduct table
      // Return products that would make it compatible
    }),

  // Get all products by type
  getProductsByType: publicProcedure
    .input(z.object({
      type: z.enum(["GPU", "RAM", "CPU", "Storage"]),
    }))
    .query(async ({ input }) => { /* ... */ }),
});
```

---

## 4. Compatibility Algorithm

### **4.1 VRAM Calculation**

```typescript
function calculateVRAMRequirement(
  parameterBillions: number,
  quantization: string | null,
  contextLength: number,
  batchSize: number = 1
): number {
  // Base model size
  let bytesPerParam: number;
  switch (quantization) {
    case "4-bit":
      bytesPerParam = 0.5; // 4 bits = 0.5 bytes
      break;
    case "8-bit":
      bytesPerParam = 1;
      break;
    case "FP16":
      bytesPerParam = 2;
      break;
    default: // FP32
      bytesPerParam = 4;
  }
  
  const modelWeightsGB = (parameterBillions * 1e9 * bytesPerParam) / 1e9;
  
  // KV Cache estimation
  // Formula: 2 * layers * hiddenSize * contextLength * batchSize * bytesPerActivation
  // Simplified: ~0.1GB per 1B params per 1K context tokens
  const kvCacheGB = (parameterBillions * contextLength / 1000) * 0.1 * batchSize;
  
  // Inference overhead (activations, gradients buffers)
  const overheadGB = parameterBillions * 0.2;
  
  // Total VRAM
  return modelWeightsGB + kvCacheGB + overheadGB;
}
```

### **4.2 RAM Calculation**

```typescript
function calculateRAMRequirement(
  parameterBillions: number,
  contextLength: number
): number {
  // Model should fit in VRAM, but RAM handles:
  // - OS overhead (4GB)
  // - Loading buffers (20% of model size)
  // - Context preprocessing
  
  const baseSystemGB = 4;
  const modelBufferGB = parameterBillions * 0.2;
  const contextBufferGB = contextLength / 2000; // Rough estimate
  
  return baseSystemGB + modelBufferGB + contextBufferGB;
}
```

### **4.3 Compatibility Decision Tree**

```typescript
function analyzeCompatibility(
  hardware: HardwareProfile,
  model: LLMModel,
  options: { contextLength: number; batchSize: number }
): CompatibilityResult {
  const requiredVram = calculateVRAMRequirement(
    model.parameterCount,
    model.quantization,
    options.contextLength,
    options.batchSize
  );
  
  const requiredRam = calculateRAMRequirement(
    model.parameterCount,
    options.contextLength
  );
  
  const bottlenecks: string[] = [];
  let isCompatible = true;
  let score = 100;
  
  // VRAM Check
  if (hardware.vramGB < requiredVram) {
    isCompatible = false;
    bottlenecks.push(
      `Insufficient VRAM: Need ${requiredVram.toFixed(1)}GB, have ${hardware.vramGB}GB`
    );
    score -= 40;
  } else if (hardware.vramGB < requiredVram * 1.2) {
    bottlenecks.push("VRAM usage will be very high (>80%)");
    score -= 15;
  }
  
  // RAM Check
  if (hardware.ramGB < requiredRam) {
    isCompatible = false;
    bottlenecks.push(
      `Insufficient RAM: Need ${requiredRam.toFixed(1)}GB, have ${hardware.ramGB}GB`
    );
    score -= 30;
  }
  
  // Storage Check
  if (hardware.storageGB < model.minStorageGB) {
    isCompatible = false;
    bottlenecks.push(
      `Insufficient storage: Need ${model.minStorageGB}GB, have ${hardware.storageGB}GB`
    );
    score -= 20;
  }
  
  // CPU Warning (soft check)
  if (hardware.cpuCores < 8 && model.parameterCount > 13) {
    bottlenecks.push("CPU may bottleneck with fewer than 8 cores");
    score -= 10;
  }
  
  return {
    isCompatible,
    compatibilityScore: Math.max(0, score),
    estimatedVramGB: requiredVram,
    estimatedRamGB: requiredRam,
    estimatedStorageGB: model.minStorageGB,
    bottlenecks,
  };
}
```

---

## 5. UI/UX Specification

### **5.1 Page Structure**

```
app/
├── page.tsx                    # Landing page
├── profiles/
│   ├── page.tsx                # List all profiles
│   ├── new/page.tsx            # Create profile
│   └── [id]/
│       ├── page.tsx            # View/edit profile
│       └── edit/page.tsx       # Edit form
├── check/
│   └── page.tsx                # Compatibility checker (main tool)
├── results/
│   └── [id]/page.tsx           # Analysis results
├── history/
│   └── page.tsx                # Past analyses
└── settings/
    └── page.tsx                # User settings
```

### **5.2 Key Components**

#### **Hardware Profile Form**
```tsx
// components/HardwareProfileForm.tsx
- CPU Section:
  - Brand dropdown (Intel/AMD)
  - Model text input with autocomplete
  - Cores/threads number inputs
  
- GPU Section:
  - Brand dropdown (NVIDIA/AMD/Intel)
  - Model text input with autocomplete
  - VRAM slider (1-96 GB) with live value display
  
- RAM Section:
  - Capacity slider (4-256 GB)
  - Type toggle (DDR4/DDR5)
  - Optional speed input
  
- Storage Section:
  - Capacity input (GB)
  - Type dropdown (SSD/NVMe/HDD)
  
- Validation:
  - React Hook Form + Zod
  - Real-time error messages
  - Submit button disabled until valid
```

#### **Compatibility Checker**
```tsx
// app/check/page.tsx
- Profile Selector:
  - Dropdown of saved profiles
  - "Create New" button
  
- Model Input:
  - Hugging Face URL paste field
  - OR search popular models
  - Preview card: Name, size, quantization
  
- Advanced Options (collapsible):
  - Context length slider (512-128K)
  - Batch size input
  
- "Analyze" button (primary CTA)
```

#### **Results Dashboard**
```tsx
// components/CompatibilityResults.tsx
- Hero Section:
  - Large icon: ✅ Green check or ❌ Red X
  - Verdict: "Can Run!" or "Not Compatible"
  - Compatibility score (0-100) with color gradient
  
- Resource Usage Cards:
  - VRAM Progress Bar:
    - Used / Total (e.g., 18.3 GB / 24 GB)
    - Color: Green <70%, Yellow 70-90%, Red >90%
  - RAM Progress Bar (same format)
  - Storage Requirement (simple text)
  
- Bottlenecks Section:
  - List of issues (if any)
  - Each with icon + description
  
- Upgrade Recommendations (if not compatible):
  - Product cards with:
    - Image
    - Name + specs
    - Price (if available)
    - Affiliate "Buy on Amazon" / "Buy on Newegg" buttons
    - "This would fix: [bottleneck]" badge
  
- Actions:
  - "Save Analysis" button
  - "Share Results" button (copy link)
  - "Try Another Model" button
```

### **5.3 Design System**

**Colors (Dark Theme)**
```css
:root {
  --background: 222.2 84% 4.9%;      /* Near black */
  --foreground: 210 40% 98%;         /* White text */
  --primary: 217.2 91.2% 59.8%;      /* Blue accent */
  --success: 142.1 76.2% 36.3%;      /* Green */
  --warning: 38 92% 50%;              /* Yellow */
  --destructive: 0 72.2% 50.6%;      /* Red */
}
```

**Typography**
- Headings: Inter (font-bold)
- Body: Inter (font-normal)
- Monospace (specs): JetBrains Mono

**Spacing**
- Consistent 4px grid (Tailwind defaults)
- Max content width: 1280px

---

## 6. Hugging Face Integration

### **6.1 Model Card Parser**

```typescript
// src/lib/huggingface.ts

interface ModelMetadata {
  id: string;
  name: string;
  architecture: string;
  parameterCount: number;
  quantization: string | null;
  maxContextLength: number;
}

async function parseModelCard(url: string): Promise<ModelMetadata> {
  // Extract model ID from URL
  // Example: https://huggingface.co/meta-llama/Llama-3-70b
  const modelId = extractModelId(url);
  
  // Option 1: Use Hugging Face API (if available)
  const response = await fetch(`https://huggingface.co/api/models/${modelId}`);
  const data = await response.json();
  
  // Parse config.json for architecture details
  const configUrl = `https://huggingface.co/${modelId}/raw/main/config.json`;
  const config = await fetch(configUrl).then(r => r.json());
  
  // Extract parameter count from model card or config
  const parameterCount = extractParameterCount(data, config);
  
  // Detect quantization from filename/tags
  const quantization = detectQuantization(data.siblings); // Check for .gguf, .Q4, etc.
  
  return {
    id: modelId,
    name: data.modelId,
    architecture: config.architectures?.[0] || "unknown",
    parameterCount,
    quantization,
    maxContextLength: config.max_position_embeddings || 4096,
  };
}

// Fallback: Web scraping if API unavailable
async function scrapeModelCard(url: string): Promise<ModelMetadata> {
  // Use Cheerio to parse HTML
  // Extract from README.md markdown headings
}
```

### **6.2 Caching Strategy**

```typescript
// Cache parsed models in database
await prisma.lLMModel.upsert({
  where: { huggingFaceId: modelId },
  update: { lastSynced: new Date() },
  create: { /* ... */ },
});

// Cache duration: 7 days
// After 7 days, re-fetch to catch updates
```

---

## 7. Affiliate Link Management

### **7.1 Product Database Seed**

```typescript
// prisma/seed.ts

const gpuUpgrades = [
  {
    type: "GPU",
    brand: "NVIDIA",
    model: "GeForce RTX 4090",
    specs: { vramGB: 24, cudaCores: 16384 },
    amazonLink: "https://amazon.com/...",
    neweggLink: "https://newegg.com/...",
    msrpUSD: 1599,
  },
  {
    type: "GPU",
    brand: "NVIDIA",
    model: "GeForce RTX 4080",
    specs: { vramGB: 16 },
    amazonLink: "...",
    msrpUSD: 1199,
  },
  // Add RTX 4070 Ti, 4060 Ti, AMD 7900 XTX, etc.
];

const ramUpgrades = [
  {
    type: "RAM",
    brand: "Corsair",
    model: "Vengeance RGB 64GB (2x32GB) DDR5",
    specs: { capacityGB: 64, type: "DDR5", speedMHz: 6000 },
    amazonLink: "...",
    msrpUSD: 199,
  },
  // Add 32GB, 128GB options
];
```

### **7.2 Recommendation Logic**

```typescript
function getUpgradeRecommendations(
  hardware: HardwareProfile,
  requiredVram: number,
  requiredRam: number
): UpgradeProduct[] {
  const recommendations: UpgradeProduct[] = [];
  
  // GPU upgrade needed
  if (hardware.vramGB < requiredVram) {
    const minVram = Math.ceil(requiredVram * 1.2); // 20% headroom
    const gpus = await prisma.upgradeProduct.findMany({
      where: {
        type: "GPU",
        specs: {
          path: ["vramGB"],
          gte: minVram,
        },
      },
      orderBy: { msrpUSD: "asc" }, // Cheapest first
      take: 3,
    });
    recommendations.push(...gpus);
  }
  
  // RAM upgrade needed
  if (hardware.ramGB < requiredRam) {
    const minRam = Math.ceil(requiredRam / 16) * 16; // Round to 16GB increments
    const rams = await prisma.upgradeProduct.findMany({
      where: {
        type: "RAM",
        specs: {
          path: ["capacityGB"],
          gte: minRam,
        },
      },
      take: 2,
    });
    recommendations.push(...rams);
  }
  
  return recommendations;
}
```

---

## 8. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rigwise"

# NextAuth (Phase 2)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Affiliate Tracking (optional)
AMAZON_AFFILIATE_TAG="youraffid-20"
NEWEGG_AFFILIATE_ID=""

# Hugging Face API (if using)
HUGGINGFACE_API_KEY=""

# Analytics (optional)
NEXT_PUBLIC_GA_ID=""
```

---

## 9. Development Workflow

### **Phase 1: MVP Foundation (Weeks 1-2)**
1. ✅ Next.js + Prisma setup
2. ✅ Database schema + migrations
3. ✅ tRPC routers (hardware, model)
4. ✅ Basic UI: Hardware form + model input
5. ✅ Hardcode 5 popular models (Llama 3 7B/70B, Mistral 7B, Gemma 7B, Phi-3)

### **Phase 2: Core Logic (Week 3)**
1. ✅ Implement compatibility algorithm
2. ✅ Results dashboard with progress bars
3. ✅ Upgrade recommendations (seed 10 products)
4. ✅ Affiliate link integration

### **Phase 3: Hugging Face (Week 4)**
1. ✅ Model card parser
2. ✅ Dynamic model support
3. ✅ Caching layer

### **Phase 4: Polish (Week 5)**
1. ✅ Responsive design
2. ✅ Error handling
3. ✅ Loading states
4. ✅ User testing

### **Phase 5: Auth & Deploy (Week 6)**
1. ✅ NextAuth setup
2. ✅ User profiles persistence
3. ✅ Deploy to Vercel
4. ✅ Soft launch

---

## 10. Success Metrics

**MVP Goals:**
- ✅ Support 20+ LLM models
- ✅ <500ms compatibility analysis
- ✅ 95%+ accuracy on VRAM estimates (±2GB)
- ✅ 3+ affiliate clicks per 100 analyses
- ✅ Mobile responsive (Lighthouse score >90)

**Post-Launch:**
- 1000+ analyses in first month
- 5% conversion rate on affiliate links
- <1% error rate

---

## 11. Future Enhancements (Post-MVP)

- 🔮 Auto-detect hardware via browser API (WebGPU, navigator.hardwareConcurrency)
- 🔮 Support for Ollama/LM Studio preset configs
- 🔮 Price alerts for recommended upgrades
- 🔮 Community-submitted hardware profiles
- 🔮 Multi-GPU configurations
- 🔮 MacBook M-series chip support
- 🔮 Fine-tuning vs inference mode toggle
- 🔮 LoRA/PEFT memory calculations

---

## 12. File Structure

```
RIGWISE/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing
│   │   ├── layout.tsx          # Root layout
│   │   ├── profiles/
│   │   ├── check/
│   │   ├── results/
│   │   └── api/
│   │       └── trpc/[trpc]/route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── HardwareProfileForm.tsx
│   │   ├── CompatibilityResults.tsx
│   │   └── UpgradeCard.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── huggingface.ts      # Model parser
│   │   ├── compatibility.ts    # Algorithm
│   │   └── utils.ts
│   ├── server/
│   │   └── api/
│   │       ├── root.ts
│   │       ├── trpc.ts
│   │       └── routers/
│   │           ├── hardware.ts
│   │           ├── model.ts
│   │           ├── compatibility.ts
│   │           └── upgrade.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── images/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## ✅ Specification Complete

**Next Step:** Run `create_new_workspace` to scaffold this project structure.

**Command:**
```bash
npx create-next-app@latest rigwise --typescript --tailwind --app --src-dir
```

Then install dependencies:
```bash
npm install @prisma/client @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query recharts
npm install -D prisma
```

Ready to build? 🚀
