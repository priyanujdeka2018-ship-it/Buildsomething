# CAREER OS — DATA MODEL v1.0
# Six storage keys in window.storage. All values JSON-stringified.
# Every schema is generic — no person-specific defaults.

---

## Storage Key Map

| Key | Contains | Typical Size |
|-----|----------|-------------|
| `cos-profile` | Career identity, org, metrics, achievements, education, psychometrics | ~50-100KB |
| `cos-stars` | STAR story bank + category enum + BQ router mappings | ~30-80KB |
| `cos-pipeline` | Role cards + pipeline state + stage trackers | ~40-100KB |
| `cos-skills` | Skill tracks + curricula + practice results | ~20-50KB |
| `cos-vocab` | Employer→target reframe tables + canonical metrics | ~5-15KB |
| `cos-settings` | App config, scoring weights, segment rules, capacity caps | ~3-5KB |

All keys prefixed `cos-` (Career OS) to avoid collision with other artifacts.

---

## 1. `cos-profile` — Career Profile

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "identity": {
    "name": "",
    "currentTitle": "",
    "employer": "",
    "employerDescription": "",
    "tenureStart": "YYYY-MM",
    "tenureYears": 0,
    "reportsTo": {
      "name": "",
      "title": ""
    },
    "reportsToChain": [
      { "name": "", "title": "", "level": 1 }
    ],
    "location": "",
    "targetLocation": "",
    "email": "",
    "phone": "",
    "linkedin": ""
  },

  "orgStructure": {
    "totalHeadcount": 0,
    "headcountBreakdown": [
      { "location": "", "count": 0, "note": "" }
    ],
    "directReports": [
      {
        "name": "",
        "title": "",
        "teamSize": 0,
        "location": "",
        "note": ""
      }
    ],
    "peers": [
      { "name": "", "title": "", "note": "" }
    ]
  },

  "careerGoal": {
    "transitionSummary": "",
    "targetFunctions": [""],
    "targetIndustries": [""],
    "targetLocations": [""],
    "coreReframe": "",
    "aiDifferentiator": ""
  },

  "titleProgression": [
    {
      "period": "YYYY-MM",
      "title": "",
      "keyEvent": ""
    }
  ],

  "achievementStatement": "",

  "performanceMetrics": {
    "annual": [
      {
        "year": 2024,
        "metrics": [
          { "name": "", "value": "", "yoy": "", "source": "DOC|STATED|CALC" }
        ]
      }
    ],
    "currentYear": {
      "year": 2026,
      "targets": [
        { "name": "", "target": "", "actual": "", "percentAchieved": 0 }
      ]
    },
    "headline": [
      {
        "label": "",
        "value": "",
        "context": "",
        "source": "DOC|STATED|CALC|ANALYSIS"
      }
    ]
  },

  "portfolioScale": {
    "items": [
      { "dimension": "", "value": "", "note": "" }
    ]
  },

  "operationalMetrics": [
    {
      "name": "",
      "before": "",
      "after": "",
      "reduction": "",
      "context": ""
    }
  ],

  "intelligencePlatform": {
    "totalArtifacts": 0,
    "builtPersonally": [
      { "name": "", "type": "", "status": "", "audience": "" }
    ],
    "builtByTeam": [
      { "name": "", "count": 0, "note": "" }
    ]
  },

  "technologyStack": [
    {
      "platform": "",
      "usage": "",
      "resumeInclude": true
    }
  ],

  "governanceArtifacts": [
    {
      "docId": "",
      "name": "",
      "approver": "",
      "date": "YYYY-MM",
      "signatoryRole": ""
    }
  ],

  "currentGoals": [
    {
      "goal": "",
      "weight": 0,
      "target": ""
    }
  ],

  "education": [
    {
      "qualification": "",
      "institution": "",
      "years": "",
      "note": "",
      "gpa": null,
      "volunteerGPA": false
    }
  ],

  "psychometrics": {
    "cliftonStrengths": [""],
    "disc": {
      "high": [""],
      "low": [""]
    },
    "strengths": [""],
    "developmentAreas": [""],
    "interviewReady": true
  },

  "resumeRules": {
    "neverInclude": [""],
    "vocabularyOverrides": [
      { "wrong": "", "correct": "" }
    ],
    "framingRules": [""]
  },

  "pendingItems": [
    {
      "id": "",
      "item": "",
      "impact": "",
      "resolved": false
    }
  ]
}
```

### Source Labels Convention

Every metric and claim carries a source tag:

| Tag | Meaning |
|-----|---------|
| `DOC` | Verified from uploaded document |
| `STATED` | User confirmed verbally/in chat |
| `CALC` | Calculated from documented numbers |
| `ANALYSIS` | Inferred by AI — flag for user confirmation |
| `PENDING` | Claimed but not yet verified |

---

## 2. `cos-stars` — STAR Story Bank

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "categoryEnum": [
    "RISK_GOVERNANCE",
    "TEAM_LEADERSHIP",
    "TRANSFORMATION",
    "STAKEHOLDER",
    "ASSERTIVENESS",
    "AI_AUGMENTATION",
    "DATA_OPS",
    "CRISIS",
    "FINANCIAL",
    "PRODUCT_DELIVERY",
    "SCALE_OPS",
    "SELF_AWARENESS",
    "RESERVED"
  ],

  "stories": [
    {
      "storyId": "S1",
      "title": "",
      "category": "RISK_GOVERNANCE",
      "starRating": 3,
      "status": "ACTIVE",

      "situation": "",
      "task": "",
      "action": "",
      "result": "",

      "metrics": [""],
      "sourceLabels": {
        "situation": "DOC",
        "metrics": "CALC"
      },

      "applicableRoleIds": [""],
      "rolesTested": [""],
      "lastRehearsed": null,
      "rehearsalCount": 0,
      "lastReframed": null,
      "reframeOf": null,

      "interviewNotes": "",
      "deploymentTips": ""
    }
  ],

  "bqRouter": [
    {
      "questionPattern": "Tell me about a time you failed",
      "primary": "S1",
      "backup": "S2",
      "notes": ""
    }
  ]
}
```

### Story Status Values

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Full STAR, ready for deployment |
| `STUB` | Outline only — needs user input to complete |
| `DRAFT` | Written but not rehearsed/validated |
| `VALIDATED` | Used in a real interview with positive signal |
| `RETIRED` | Superseded or no longer relevant |

### Star Rating

| Rating | Meaning |
|--------|---------|
| 3 (★★★) | Strongest evidence — quantified, documented, interview-tested |
| 2 (★★) | Solid — clear STAR structure, some metrics |
| 1 (★) | Supporting — usable but thin on specifics |

### Default BQ Patterns (16)

Pre-loaded patterns the user can customize:

1. Walk me through your career
2. Tell me about a time you failed
3. What's your weakness
4. Biggest achievement
5. Time you held a standard under pressure
6. Time you pushed back on leadership
7. Cross-functional stakeholder management
8. Process you redesigned
9. Data-driven decision
10. Remote / multi-geo team leadership
11. Building something from scratch
12. Scaling under volume pressure
13. Senior presentations / influence
14. Conflict or disagreement
15. Building team capability
16. Time you owned an outcome solo

---

## 3. `cos-pipeline` — Role Pipeline

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "roles": [
    {
      "id": "company-role-slug",
      "role": "",
      "company": "",
      "division": "",
      "cluster": "",
      "location": "",
      "workMode": "remote|hybrid|onsite",

      "segment": "P2|P3A|P3B|P3C|ARCHIVE",
      "status": "ACTIVE_NOW|ACTIVE_NEW|PARALLEL|PREP|EXPLORATORY|CONDITIONAL|BLOCKED|STEPPING_STONE|DNP|INTERNAL",
      "applicationStatus": "BUILD|SUBMITTED|INTERVIEW|COMPLETE|BLOCKED",
      "statusReason": null,
      "boundaryException": null,

      "fitBase": 0,
      "fitTarget": 0,
      "fitGap": 0,
      "stabilityDiscount": 0,
      "fitNet": 0,

      "subScores": {
        "functional": 0,
        "technicalCert": 0,
        "leadershipVocab": 0
      },
      "dimensionScores": [
        { "dim": 1, "name": "Functional Alignment", "score": 0, "evidence": "" },
        { "dim": 2, "name": "Technical/Cert Prereqs", "score": 0, "evidence": "" },
        { "dim": 3, "name": "Leadership & Vocab", "score": 0, "evidence": "" },
        { "dim": 4, "name": "Programme Scale Match", "score": 0, "evidence": "" },
        { "dim": 5, "name": "Domain Relevance", "score": 0, "evidence": "" },
        { "dim": 6, "name": "AI/Portfolio Relevance", "score": 0, "evidence": "" },
        { "dim": 7, "name": "Stakeholder Altitude", "score": 0, "evidence": "" },
        { "dim": 8, "name": "Geographic/Mode Fit", "score": 0, "evidence": "" },
        { "dim": 9, "name": "Compensation Alignment", "score": 0, "evidence": "" },
        { "dim": 10, "name": "Career Trajectory Value", "score": 0, "evidence": "" }
      ],

      "ctcMin": 0,
      "ctcMax": 0,
      "ctcMidpoint": 0,
      "ctcCurrency": "INR",
      "ctcConfidence": "HIGH|MED|LOW",
      "walkAwayFloor": 0,

      "prepMonths": 0,
      "effortTier": "LOW|LOW_MOD|MODERATE|MOD_HIGH|HIGH|HIGHEST",

      "whatItIs": "",
      "top3Requirements": "",
      "reframeStrategy": "",
      "gaps": "",
      "certs": "",
      "psych": "",

      "starIds": ["S1", "S2"],
      "aiProjects": [],
      "portfolioRelevance": "",

      "resumeStatus": "PENDING|BUILT|DEFERRED",
      "resumeVersion": null,
      "playbookStatus": "PENDING|BUILT|DEFERRED",
      "coverNoteStatus": "PENDING|BUILT|DEFERRED",

      "stageTracker": {
        "currentStage": "IDENTIFIED|RESEARCHED|PLAYBOOKED|RESUME_READY|APPLIED|SCREENING|INTERVIEW_1|INTERVIEW_2|OFFER|NEGOTIATING|ACCEPTED|REJECTED|WITHDRAWN",
        "lastUpdated": "ISO-8601",
        "history": [
          { "stage": "", "date": "ISO-8601", "note": "" }
        ]
      },

      "referrals": [
        {
          "name": "",
          "connection": "",
          "status": "IDENTIFIED|REACHED_OUT|RESPONDED|REFERRED|DECLINED",
          "notes": "",
          "date": "ISO-8601"
        }
      ],

      "redTeamFindings": [
        {
          "source": "chatgpt|gemini|other",
          "date": "ISO-8601",
          "findings": "",
          "addressed": false
        }
      ],

      "intakeDate": "ISO-8601",
      "lastScored": "ISO-8601",
      "lastActivity": "ISO-8601",
      "jdUrl": "",
      "jdText": "",
      "notes": ""
    }
  ],

  "capacityCaps": {
    "P2": 5,
    "P3B": 7
  },

  "segmentCriteria": {
    "P3A": "addressable >= 80 AND (gap <= 10 OR boundary exception with addressable >= 85)",
    "P3B": "addressable 70-79 OR (>= 80 with gap > 10 and addressable < 85)",
    "P3C": "addressable < 70 OR conditional"
  },

  "stalenessThresholds": {
    "P2_submitted": { "weeks": 4, "action": "flag follow-up or demotion" },
    "P3A": { "weeks": 6, "action": "rescore" },
    "P3B": { "weeks": 8, "action": "rescore" },
    "P3C": { "weeks": 12, "action": "quarterly review" }
  }
}
```

### Segment Routing Logic (for UI enforcement)

```
On role move:
  if targetSegment == "P2":
    assert count(P2 roles) < capacityCaps.P2
    if at cap: identify lowest-fit BUILD-status role for demotion
  if targetSegment == "P3B":
    assert count(P3B roles) < capacityCaps.P3B
    if overflow <= 2: flag, resolve by next weekly refresh
    if overflow >= 3: block move, require kill/promote first
  P3A, P3C: no caps

On demotion from P2:
  route by addressable fit:
    >= 80 AND gap <= 10 → P3A
    70-79 OR (>= 80 AND gap > 10) → P3B
    < 70 → P3C
    borderline (exactly 70 or 80) → route DOWN (conservative)
```

---

## 4. `cos-skills` — Skill Tracks

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "tracks": [
    {
      "trackId": "TRK-01",
      "name": "",
      "type": "CERT|TOOL|DOMAIN|LANGUAGE|PROTOTYPE",
      "status": "ACTIVE|QUEUED|NOT_STARTED|COMPLETE|PAUSED",

      "linkedRoleIds": [""],
      "rolesUnlocked": 0,

      "priority": 1,
      "priorityReason": "",

      "startDate": null,
      "targetDate": null,
      "gateDate": null,
      "gateDateHard": false,

      "curriculum": {
        "generatedBy": "claude-api|manual",
        "generatedDate": "ISO-8601",
        "totalWeeks": 0,
        "hoursPerWeek": 0,
        "weeks": [
          {
            "weekNumber": 1,
            "title": "",
            "objectives": [""],
            "tasks": [
              {
                "id": "W1-T1",
                "description": "",
                "completed": false,
                "completedDate": null,
                "timeEstimateMinutes": 0
              }
            ],
            "resources": [""],
            "milestone": ""
          }
        ]
      },

      "practiceResults": [
        {
          "date": "ISO-8601",
          "source": "chatgpt|gemini|manual|claude-api",
          "type": "EXERCISE|MOCK_EXAM|DRILL",
          "score": null,
          "totalQuestions": 0,
          "correct": 0,
          "notes": "",
          "importedMd": ""
        }
      ],

      "dependencies": ["TRK-XX"],
      "lastActivity": "ISO-8601",
      "stallThresholdDays": 3,
      "notes": ""
    }
  ],

  "certPriorityStack": [
    {
      "rank": 1,
      "certName": "",
      "rolesUnlocked": [""],
      "estimatedTime": "",
      "notes": "",
      "isOverride": false,
      "overrideReason": ""
    }
  ]
}
```

---

## 5. `cos-vocab` — Vocabulary & Reframe Table

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "employerName": "",

  "mandatoryReframes": [
    {
      "source": "",
      "target": "",
      "note": ""
    }
  ],

  "contextualReframes": [
    {
      "source": "",
      "target": "",
      "context": "",
      "action": "REFRAME|DROP"
    }
  ],

  "roleOverlays": {
    "role-slug": [
      { "source": "", "target": "" }
    ]
  },

  "canonicalMetrics": [
    {
      "label": "",
      "value": "",
      "source": "DOC|STATED|CALC",
      "useExact": true,
      "note": ""
    }
  ],

  "positioningAnchors": {
    "coreReframe": "",
    "aiDifferentiator": "",
    "transitionScript": ""
  }
}
```

---

## 6. `cos-settings` — App Configuration

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "ISO-8601",

  "userName": "",
  "apiConfigured": false,
  "driveConnected": false,
  "driveFolderId": null,
  "lastBackup": null,
  "lastImport": null,
  "onboardingComplete": false,

  "scoringWeights": [
    { "dim": 1, "name": "Functional Alignment", "weight": 20 },
    { "dim": 2, "name": "Technical/Cert Prereqs", "weight": 10 },
    { "dim": 3, "name": "Leadership & Vocab", "weight": 15 },
    { "dim": 4, "name": "Programme Scale Match", "weight": 10 },
    { "dim": 5, "name": "Domain Relevance", "weight": 10 },
    { "dim": 6, "name": "AI/Portfolio Relevance", "weight": 5 },
    { "dim": 7, "name": "Stakeholder Altitude", "weight": 10 },
    { "dim": 8, "name": "Geographic/Mode Fit", "weight": 5 },
    { "dim": 9, "name": "Compensation Alignment", "weight": 10 },
    { "dim": 10, "name": "Career Trajectory Value", "weight": 5 }
  ],

  "scoringScale": {
    "10": "perfect match or overqualified",
    "8": "strong match with minor vocabulary gap",
    "6": "solid transferable match requiring meaningful reframe",
    "4": "partial match with genuine capability gap",
    "2": "weak match requiring major skill acquisition",
    "1": "no relevant experience"
  },

  "stabilityDiscountRules": {
    "amount": -10,
    "triggers": [
      "Pre-profit or in active turnaround",
      "< 3 years operating history",
      "Significant org instability",
      "Revenue-model pivot in progress"
    ],
    "format": "capability [X] - 10 stability = net [Y]"
  },

  "segmentCriteria": {
    "P3A": { "minAddressable": 80, "maxGap": 10, "boundaryExceptionMinAddressable": 85 },
    "P3B": { "minAddressable": 70, "maxAddressable": 79 },
    "P3C": { "maxAddressable": 69 }
  },

  "capacityCaps": {
    "P2": 5,
    "P3B": 7,
    "overflowTolerance": 2,
    "overflowEscalation": 3
  },

  "stalenessWeeks": {
    "P3A": 6,
    "P3B": 8,
    "P3C": 12,
    "P2_submitted": 4,
    "skillStallDays": 3
  },

  "statusEnum": [
    "ACTIVE_NOW", "ACTIVE_NEW", "PARALLEL", "PREP",
    "EXPLORATORY", "CONDITIONAL", "BLOCKED",
    "STEPPING_STONE", "DNP", "INTERNAL"
  ],

  "applicationStatusEnum": [
    "BUILD", "SUBMITTED", "INTERVIEW", "COMPLETE", "BLOCKED"
  ],

  "effortTierEnum": [
    "LOW", "LOW_MOD", "MODERATE", "MOD_HIGH", "HIGH", "HIGHEST"
  ],

  "theme": "dark",
  "currency": "INR",
  "currencySymbol": "₹",
  "currencyUnit": "L"
}
```

---

## Cross-Key References

Role cards in `cos-pipeline` reference:
- `starIds` → story IDs in `cos-stars.stories[].storyId`
- Vocabulary → `cos-vocab.mandatoryReframes` + `cos-vocab.roleOverlays[role.id]`
- Scoring weights → `cos-settings.scoringWeights`
- Segment rules → `cos-settings.segmentCriteria`

Skill tracks in `cos-skills` reference:
- `linkedRoleIds` → role IDs in `cos-pipeline.roles[].id`
- `dependencies` → other track IDs in `cos-skills.tracks[].trackId`

STAR stories in `cos-stars` reference:
- `applicableRoleIds` → role IDs in `cos-pipeline.roles[].id`

---

## Migration & Versioning

Each storage key carries `schemaVersion`. On app boot:
1. Read all 6 keys
2. Compare each `schemaVersion` to app's expected version
3. If mismatch: run migration function (key-specific)
4. Write migrated data back

Migration functions are one-way (old → new). No downgrade path.

---

## Size Budget

Total across 6 keys: target < 2MB for a 40-role, 30-story pipeline.
Individual key hard limit: 5MB (window.storage constraint).
If a key approaches 4MB, surface a warning in Settings with option to archive completed/killed roles.

---

*CAREER OS DATA MODEL v1.0 — Generic, no person-specific defaults*
*Foundation for: MD_INTERCHANGE_SPEC, API_PROMPTS, OFFLOAD_PROMPTS, app code*
