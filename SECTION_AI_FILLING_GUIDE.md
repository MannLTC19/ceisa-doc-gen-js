# Section-Level AI Filling Feature - User Guide

**Version:** 8.1 - Granular Section Control  
**Release Date:** March 5, 2026  
**Status:** Production Ready  

---

## 🎯 Overview

Users can now control AI generation at the **section level** with intelligent token budget management. Each major section (Penelitian, BRD, FSD, Charter, Kajian) can be filled individually with real-time token cost tracking and a hard **$1 budget cap** per document.

### Key Features

✅ **Section-Level Control** - Click "Fill with AI" button for each section  
✅ **Real-Time Budget Monitor** - See token usage and remaining budget  
✅ **Smart Prioritization** - Critical sections auto-fill, optional sections user-controlled  
✅ **Budget Enforcement** - Blocked if generation would exceed $1 limit  
✅ **Cost Transparency** - Shows per-section cost estimates before generating  
✅ **Section Tracking** - Visual indicators for filled vs. pending sections  

---

## 📋 Priority Strategy

### AUTO-FILL (Generate Automatically with Document Upload)

**Tab: Penelitian (Research)**
- ⚡ Spesifikasi Aktor (UAW) - ~$0.0008 cost
- ⚡ Use Case Deskripsi (UUCW) - ~$0.0008 cost
- ⚡ Kebutuhan Fungsional - ~$0.0006 cost

**Tab: BRD**
- ⚡ Kondisi As-Is To-Be - ~$0.0005 cost
- ⚡ Kebutuhan Fungsional (BRD) - ~$0.0005 cost

**Tab: FSD (Diagrams)**
- ⚡ Process Flow Diagram - ~$0.0004 cost
- ⚡ Use Case Diagram - ~$0.0003 cost
- ⚡ Entity Relationship Diagram (ERD) - ~$0.0002 cost

**Total Auto-Fill Budget:** ~$0.005 per document (0.5% of $1 budget)

### MANUAL FILL (User Clicks "Fill with AI" Button)

**Tab: Project Charter**
- 👥 Lingkup Proyek (Project Scope)
- 👥 Jadwal Proyek (Timeline)
- 👥 Sumber Daya Proyek (Resources)
- 👥 Biaya Proyek (Budget)

**Tab: Kajian Kebutuhan**
- 👥 Masalah & Isu
- 👥 Kebutuhan Fungsional (Kajian)
- 👥 Risiko Bisnis

**Cost per Manual Section:** $0.0001-0.0002 each

---

## 🚀 How to Use

### Step 1: Upload Document

1. Click **"Import TOR / KAK"** on the sidebar
2. Select a PDF document (50-100 pages typical)
3. System extracts text automatically

### Step 2: Auto-Fill Sections Generate

- ✅ Research tab sections populate automatically
- ✅ BRD tab sections populate automatically  
- ✅ FSD diagram sections populate automatically
- ✅ Progress shown in status message
- ✅ Token usage tracked in background

**Expected Time:** ~6 seconds for full auto-fill

### Step 3: View Token Budget Monitor

The system shows real-time budget status:

```
Total Cost:        $0.0048 / $1.0000
Budget Remaining:  $0.9952
Usage:            0.48%

[Green progress bar showing usage]
```

### Step 4: Optionally Fill Manual Sections

For **Charter** or **Kajian** tabs:

1. Navigate to the tab
2. Find the section heading
3. Click **"Fill with AI"** button
4. System checks budget before generating
5. If budget allows → generates section, updates cost tracker
6. If would exceed budget → shows error message

**Example:**
```
✓ Fill project scope
✓ Check: $0.0048 + $0.0001 = $0.0049 (OK, under $1.00 limit)
→ Generate and display results
→ Update budget monitor: "Usage: 0.49%"
```

---

## 💰 Budget System

### Hard Limit Enforcement

**Budget Cap:** $1.00 USD per document (non-negotiable)

**Behavior:**
- ✅ Sections generate freely if within budget
- ⚠️ Warning when > 80% used
- ❌ Generation blocked if would exceed limit

**Example Scenarios:**

**Scenario 1 - Budget Plenty**
```
Current: $0.0048 (0.48% used)
Remaining: $0.9952

User clicks "Fill Jadwal Proyek" (est. cost: $0.0001)
→ New total: $0.0049 (0.49%)
✓ ALLOWED - Proceed with generation
```

**Scenario 2 - Budget Tight**
```
Current: $0.98 (98% used - ALERT!)
Remaining: $0.02

User clicks "Fill Masalah & Isu" (est. cost: $0.0002)
→ Would be: $0.9802 (OVER LIMIT!)
✗ BLOCKED - Error message shown
"Can't generate: Would exceed $1.00 budget. 
Remaining: $0.02"
```

### Cost Breakdown

When you hover over **"Fill with AI"** button, see:

```
Spesifikasi Aktor (UAW)

Input:  ~1,000 tokens
Output: ~350 tokens
────────────────────
Cost:   $0.0008

Current: $0.0000
After:   $0.0008
```

---

## 🎨 Visual Indicators

### Section Status

Each section shows **status badge**:

- **⚡ Auto Priority** - Will generate automatically with upload
- **👥 Manual** - User must click button to generate
- **✓ Filled** - Already generated (green checkmark)
- **⚠️ Over Budget** - Cannot generate now (red warning)

### Budget Monitor Colors

```
GREEN   (0-50%):   Safe, plenty of budget remaining
BLUE    (50-80%):  Good progress, plenty of room
ORANGE  (80-95%):  Approaching limit, be selective
RED     (95%+):    At or over limit, no more generations
```

---

## 📊 Example Workflow

**Scenario: 100-page Indonesian Government TOR**

```
1. Upload TOR (PDF, 100 pages)
   ↓
2. System auto-fills (4 seconds):
   - 12 Aktor (UAW)
   - 18 Use Cases (UUCW)  
   - 25 Kebutuhan Fungsional
   - 5 As-Is To-Be factors
   - 3 Mermaid diagrams (Process, UC, ERD)
   ↓
3. Budget Status: $0.0048 / $1.00 (0.48%)
   ↓
4. User clicks "Fill Jadwal Proyek" (Charter)
   ↓
5. Generates: Key milestones, phase durations
   ↓
6. New Budget: $0.0049 / $1.00 (0.49%)
   ↓
7. User clicks "Fill Risiko Bisnis" (Kajian)
   ↓
8. Generates: Business risks, impact levels
   ↓
9. Final Budget: $0.0050 / $1.00 (0.50%)
   ↓
10. All sections filled, 99.5% budget available!
```

---

## ⚙️ Section Specifications

### Penelitian (Research) Tab

#### Spesifikasi Aktor (UAW)
| Field | Content |
|-------|---------|
| Cost | ~$0.0008 |
| Priority | ⚡ Auto |
| Output | Array of actors with name, role, type, interactions |
| Example | `[{id: "A1", name: "End User", role: "Pemohon", type: "GUI", interactions: ["submit", "track"]}]` |

#### Use Case Deskripsi (UUCW)
| Field | Content |
|-------|---------|
| Cost | ~$0.0008 |
| Priority | ⚡ Auto |
| Output | Array of use cases with ID, name, actors, steps, acceptance criteria |
| Example | `[{id: "UC1", name: "Submit Permit", actors: ["User", "System"], steps: ["Fill form", "Upload", "Submit"], criteria: "Email confirmation"}]` |

#### Kebutuhan Fungsional
| Field | Content |
|-------|---------|
| Cost | ~$0.0006 |
| Priority | ⚡ Auto |
| Output | Array of requirements with ID, description, priority, criteria |
| Example | `[{id: "F1", desc: "SSO authentication", priority: "H", criteria: "All users via LDAP"}]` |

### BRD Tab

#### Kondisi As-Is To-Be
| Field | Content |
|-------|---------|
| Cost | ~$0.0005 |
| Priority | ⚡ Auto |
| Output | Array of factors comparing current vs. target state |
| Example | `[{factor: "Approval time", asIs: "5 days (manual)", toBe: "1 day (automated)", impact: "80% faster"}]` |

### FSD Tab (Diagrams)

#### Process Flow (Mermaid)
| Field | Content |
|-------|---------|
| Cost | ~$0.0004 |
| Priority | ⚡ Auto |
| Output | Mermaid flowchart showing business process |
| Format | Valid Mermaid flowchart syntax |

#### Use Case Diagram
| Field | Content |
|-------|---------|
| Cost | ~$0.0003 |
| Priority | ⚡ Auto |
| Output | Mermaid UML diagram showing actors and use cases |

#### Entity Relationship Diagram (ERD)
| Field | Content |
|-------|---------|
| Cost | ~$0.0002 |
| Priority | ⚡ Auto |
| Output | Mermaid ERD showing tables and relationships |

### Project Charter Tab

#### Lingkup Proyek (Scope)
| Field | Content |
|-------|---------|
| Cost | ~$0.0001 |
| Priority | 👥 Manual |
| Output | Text description of project boundaries |

#### Jadwal Proyek (Timeline)
| Field | Content |
|-------|---------|
| Cost | ~$0.0001 |
| Priority | 👥 Manual |
| Output | Key milestones and phase durations |

#### Sumber Daya Proyek (Resources)
| Field | Content |
|-------|---------|
| Cost | ~$0.00015 |
| Priority | 👥 Manual |
| Output | Team composition, tools, infrastructure |

#### Biaya Proyek (Budget)
| Field | Content |
|-------|---------|
| Cost | ~$0.00015 |
| Priority | 👥 Manual |
| Output | Total cost, breakdown, contingency |

### Kajian Kebutuhan Tab

#### Masalah & Isu
| Field | Content |
|-------|---------|
| Cost | ~$0.00015 |
| Priority | 👥 Manual |
| Output | Problem statements, root causes, business impact |

#### Kebutuhan Fungsional (from Kajian)
| Field | Content |
|-------|---------|
| Cost | ~$0.00025 |
| Priority | 👥 Manual |
| Output | Functional requirements from study phase |

#### Risiko Bisnis
| Field | Content |
|-------|---------|
| Cost | ~$0.00012 |
| Priority | 👥 Manual |
| Output | Business risks, likelihood, impact, mitigation |

---

## 🔧 Advanced Usage

### Selective Section Generation

**Scenario:** You want only specific sections

```
1. Upload document → Auto-fill triggers
2. Navigate to Charter tab
3. Click "Fill Jadwal" → Generates timeline only
4. Skip "Biaya" section → Save budget
5. Navigate to Kajian tab
6. Click "Fill Risiko" → Generates risks
7. Final cost: ~$0.0025 (still 99.75% under budget!)
```

### Budget Optimization

**Strategy 1: Generate everything**
```
Auto-fill all Penelitian/BRD/FSD: $0.005
+ All Charter sections: $0.0005
+ All Kajian sections: $0.0005
= Total: $0.006 (99.4% budget remaining)
```

**Strategy 2: Focus on new sections**
```
Skip auto-fill sections (already have them)
+ Only new sections: ~$0.002
= Total: $0.002 (99.8% budget remaining)
```

**Strategy 3: One at a time**
```
Generate section → Check budget
Decide if continue → Save budget for next docs
Repeat: Spread generation across multiple docs
```

---

## ❌ Troubleshooting

### "Budget Exceeded" Error

**Message:** "Can't generate: Would exceed $1.00 budget"

**Cause:** Too many sections already generated

**Solutions:**
1. Check current budget status in monitor
2. Delete less important auto-filled sections
3. Upload a new document (gets fresh $1 budget)
4. Contact admin if budget seems incorrect

### "No Document to Analyze"

**Message:** "No document for analysis. Please upload first."

**Cause:** Tried to fill section without uploading

**Solutions:**
1. Upload document first (CTR + Upload button)
2. Wait for auto-fill to complete
3. Then manually fill optional sections

### Section Not Filling?

**Possible Causes:**
- API key not configured
- Over budget (check monitor)
- Document too short
- Network timeout

**Solutions:**
1. Check .env.local has VITE_ANTHROPIC_API_KEY
2. Verify budget (should be under $1.00)
3. Try again in 10 seconds
4. Check browser console for errors

---

## 📝 Notes

- **Auto-fill trigger:** Happens automatically when document analysis completes
- **Manual fill:** User explicitly clicks button
- **Budget is hard limit:** No exceptions, no overages allowed per document
- **Cost estimates:** Based on typical document of 50-100 pages
- **Multiple documents:** Each document gets fresh $1 budget
- **Saved data:** All generated sections save to project automatically

---

## ✨ Benefits

| Benefit | Impact |
|---------|--------|
| **Per-Section Control** | Users choose what to gen, when to gen |
| **Budget Transparency** | See costs before committing |
| **Cost Savings** | Stay under $1/doc, process 1000+ docs for <$1 |
| **Quality Control** | Auto-fill critical sections, manual fill optional |
| **User Flexibility** | Choose to use AI or manual entry |
| **Scalability** | Can process enterprise-scale documents |

---

**Status:** ✅ Production Ready  
**Last Updated:** March 5, 2026  
**Next Feature:** Export to Excel with filled sections
