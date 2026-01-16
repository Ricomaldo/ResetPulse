---
created: '2026-01-16'
updated: '2026-01-16'
status: active
type: guide
domain: i18n
---

# i18n Professional Translation Plan — ResetPulse

## 📊 Current Status (Post-Backfill)

### Locale Completion Overview

| Locale | Keys | Status | Placeholder Count | Translation Quality |
|--------|------|--------|-------------------|---------------------|
| **FR** | 278 | ✅ Native | 0 | 100% Native |
| **EN** | 278 | ✅ Native | 0 | 100% Native |
| **ES** | 278 | ⚠️ Partial | 128 EN placeholders | 54% Native |
| **DE** | 278 | ⚠️ Partial | 128 EN placeholders | 54% Native |
| **IT** | 278 | ⚠️ Partial | 128 EN placeholders | 54% Native |
| **PT** | 278 | ⚠️ Partial | 128 EN placeholders | 54% Native |
| **NL** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **RU** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **JA** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **KO** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **ZH-Hans** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **ZH-Hant** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **AR** | 278 | ⚠️ Partial | 145 EN placeholders | 48% Native |
| **SV** | 278 | ⚠️ Partial | 158 EN placeholders | 43% Native |
| **NO** | 278 | ⚠️ Partial | 158 EN placeholders | 43% Native |

**Total strings needing translation:** 1,843 across 13 languages

---

## 🎯 Translation Priorities

### Tier 1: High Priority (Target v1.4 - Q1 2026)

**Languages:** ES, DE, PT, IT
**Reason:** European markets + Brazilian market, largest non-FR/EN user bases
**Strings to translate:** 128 per language × 4 = 512 strings

### Tier 2: Medium Priority (Target v1.5 - Q2 2026)

**Languages:** RU, NL, JA, KO, ZH-Hans, ZH-Hant
**Reason:** Growing markets, Asian expansion
**Strings to translate:** 145 per language × 6 = 870 strings

### Tier 3: Lower Priority (Target v1.6 - Q3 2026)

**Languages:** AR, SV, NO
**Reason:** Smaller markets, niche audiences
**Strings to translate:** 145-158 per language × 3 = 461 strings

---

## 💰 Translation Options & Cost Estimates

### Option A: Professional Translation (Recommended for Tier 1)

**Providers:**
- **Lokalise** (https://lokalise.com)
- **Phrase** (https://phrase.com)
- **OneSky** (https://www.oneskyapp.com)
- **Gengo** (https://gengo.com)

**Cost Breakdown (Tier 1):**
- 512 strings × 4 languages = 2,048 total translations
- Average rate: $0.10 - $0.15 per word
- Average string length: ~6 words
- **Total words:** 2,048 × 6 = 12,288 words
- **Cost range:** $1,229 - $1,843

**Timeline:** 1-2 weeks
**Quality:** ★★★★★ (Native speakers, context-aware, culturally adapted)

**Pros:**
- ✅ Highest quality, native-level translations
- ✅ Context-aware (UI, tone, brand voice)
- ✅ Culturally adapted (idiomatic expressions)
- ✅ Professional review included
- ✅ Guarantee accuracy for app store submissions

**Cons:**
- ❌ Most expensive option
- ❌ Requires coordination with translation team

---

### Option B: DeepL API + Human Review (Recommended for Tier 2)

**Providers:**
- **DeepL Pro API** (https://www.deepl.com/pro-api)

**Cost Breakdown (Tier 2):**
- 870 strings × 6 languages = 5,220 total translations
- Average string length: ~6 words
- **Total characters:** 5,220 × 6 words × 5 chars = ~156,600 characters
- **DeepL API cost:** $25 per 500,000 characters = ~$8
- **Human review:** 5,220 strings × $0.05 = $261
- **Total cost:** $269

**Timeline:** 3-5 days (1-2 days DeepL + 2-3 days review)
**Quality:** ★★★★☆ (90% accurate, requires human review for edge cases)

**Pros:**
- ✅ Cost-effective (85% cheaper than professional)
- ✅ Fast turnaround (DeepL API is instant)
- ✅ Good quality for 90% of strings
- ✅ Can focus human review on critical strings

**Cons:**
- ⚠️ Requires manual review for accuracy
- ⚠️ May miss cultural nuances
- ⚠️ Technical terms may need adjustment

**Implementation Steps:**
1. Export EN placeholders to JSON
2. Call DeepL API for batch translation
3. Import translations back to locale files
4. Human review pass (focus on UI/UX strings, error messages, CTAs)
5. QA testing in app for each language

---

### Option C: Community Contributions (Free, for Tier 3)

**Platform:** GitHub + Crowdin/Weblate

**Cost:** $0 (volunteer contributions)
**Timeline:** 2-6 months (variable)
**Quality:** ★★★☆☆ (depends on contributor expertise)

**Pros:**
- ✅ Zero cost
- ✅ Community engagement
- ✅ Native speakers contribute
- ✅ Ongoing maintenance by community

**Cons:**
- ❌ Slow, unpredictable timeline
- ❌ Quality varies by contributor
- ❌ Requires moderation/review infrastructure
- ❌ Not suitable for app store launch deadlines

**Implementation Steps:**
1. Set up Crowdin/Weblate project
2. Create contributor guidelines
3. Announce on social media/forums
4. Review and approve contributions
5. Regular sync with locale files

---

## 📋 Recommended Strategy (Hybrid Approach)

### Phase 1: Tier 1 Languages (Q1 2026) — Professional Translation

**Target:** ES, DE, PT, IT
**Method:** Option A (Professional Translation)
**Cost:** $1,229 - $1,843
**Timeline:** 1-2 weeks
**Reason:** Largest markets, highest ROI, critical for EU/Latin America expansion

**Steps:**
1. Select translation provider (Lokalise, Phrase, OneSky, or Gengo)
2. Export EN placeholders for ES, DE, PT, IT (128 strings each)
3. Provide context: screenshots, glossary (app-specific terms like "timer", "dial", "palette")
4. Review translations (2-3 days)
5. Integrate into app
6. QA testing with native speakers
7. Ship v1.4 with fully translated ES, DE, PT, IT

**Expected Impact:**
- ✅ 100% localization for 4 major markets
- ✅ Higher app store rankings in EU/Latin America
- ✅ Better user retention (localized experience)

---

### Phase 2: Tier 2 Languages (Q2 2026) — DeepL + Review

**Target:** RU, NL, JA, KO, ZH-Hans, ZH-Hant
**Method:** Option B (DeepL API + Human Review)
**Cost:** $269
**Timeline:** 3-5 days
**Reason:** Cost-effective, fast, good quality for Asian/European markets

**Steps:**
1. Export EN placeholders for 6 languages (145 strings each)
2. Batch translate via DeepL API
3. Import translations to locale files
4. Human review pass (focus on UI strings, CTAs, error messages)
5. QA testing
6. Ship v1.5 with completed RU, NL, JA, KO, ZH-Hans, ZH-Hant

**Expected Impact:**
- ✅ Expanded reach to Asian and additional European markets
- ✅ Low cost per language ($45 average)
- ✅ Fast time-to-market

---

### Phase 3: Tier 3 Languages (Q3 2026) — Community Contributions

**Target:** AR, SV, NO
**Method:** Option C (Community Contributions)
**Cost:** $0
**Timeline:** 2-6 months
**Reason:** Smaller markets, not urgent, good fit for community engagement

**Steps:**
1. Set up Crowdin project
2. Create contribution guide (context, screenshots, glossary)
3. Announce on Reddit, Discord, Twitter, app store reviews
4. Review and approve contributions
5. Sync to locale files
6. Ship v1.6 when complete

**Expected Impact:**
- ✅ Zero cost localization
- ✅ Community engagement
- ✅ Long-tail market coverage

---

## 🛠️ Translation Workflow (Professional/DeepL)

### 1. Preparation

**Create translation package:**
```bash
# Export EN placeholders for target languages
node scripts/i18n/export-placeholders.js --languages=es,de,pt,it --output=translations/tier1/
```

**Package contents:**
- `en-placeholders.json` (source strings)
- `glossary.md` (app-specific terms)
- `context/` (screenshots, UI context)
- `style-guide.md` (tone, formality, brand voice)

**Glossary (Sample):**
| Term (EN) | Context | ES | DE | PT | IT |
|-----------|---------|----|----|----|----|
| Timer | Main feature | Temporizador | Timer | Temporizador | Timer |
| Dial | Visual timer ring | Dial | Zifferblatt | Mostrador | Quadrante |
| Palette | Color scheme | Paleta | Palette | Paleta | Tavolozza |
| Activity | Timer preset | Actividad | Aktivität | Atividade | Attività |
| Reset | Clear timer | Restablecer | Zurücksetzen | Redefinir | Ripristina |

---

### 2. Translation

**For Professional (Option A):**
1. Upload package to translation platform
2. Assign to native translators
3. Review translations (context check)
4. Approve final translations

**For DeepL (Option B):**
1. Call DeepL API for batch translation
2. Import to locale files
3. Human review critical strings (CTAs, errors, onboarding)
4. Adjust technical terms using glossary

---

### 3. Integration

**Import translations:**
```bash
node scripts/i18n/import-translations.js --source=translations/tier1/ --target=locales/
```

**Verify:**
```bash
npm run i18n:audit
# Should show 0 P0/P1/P2 issues, 0 EN placeholders for target languages
```

---

### 4. QA Testing

**Test checklist (per language):**
- [ ] Change device language to target locale
- [ ] Launch app, complete onboarding flow
- [ ] Test all screens: Timer, Settings, Premium, Discovery, Custom Activities
- [ ] Verify CTAs, error messages, toasts, notifications
- [ ] Check text truncation (long translations)
- [ ] Test RTL languages (AR) for layout issues
- [ ] Verify special characters (accents, Kanji, Cyrillic)

**Tools:**
- Expo Go (device testing)
- Screenshots for app store
- Native speaker review (if possible)

---

### 5. Deployment

**Ship translated version:**
```bash
# Update version
npm run version:minor

# Build
# iOS: Xcode Archive
# Android: ./gradlew bundleRelease

# Submit to app stores
# Update app store listings in target languages
```

---

## 📊 Budget Summary

### Total Cost Estimate (All 13 Languages)

| Phase | Languages | Method | Cost | Timeline |
|-------|-----------|--------|------|----------|
| **Phase 1** | ES, DE, PT, IT | Professional | $1,229 - $1,843 | 1-2 weeks |
| **Phase 2** | RU, NL, JA, KO, ZH-Hans, ZH-Hant | DeepL + Review | $269 | 3-5 days |
| **Phase 3** | AR, SV, NO | Community | $0 | 2-6 months |
| **TOTAL** | 13 languages | Hybrid | **$1,498 - $2,112** | **Q1-Q3 2026** |

**ROI:**
- 13 fully localized languages
- Expanded reach to EU, Latin America, Asia markets
- Improved app store rankings (localized listings)
- Higher user retention (native language experience)
- One-time cost (no recurring fees)

---

## 🎯 Quick Start: Phase 1 (Tier 1 Languages)

### Immediate Action Items

1. **Choose translation provider** (1 day)
   - Compare Lokalise, Phrase, OneSky, Gengo
   - Sign up for trial/account

2. **Prepare translation package** (1-2 days)
   - Export EN placeholders for ES, DE, PT, IT
   - Create glossary from app content
   - Screenshot key screens for context
   - Write style guide (tone, formality)

3. **Submit to translation** (1 day)
   - Upload package to provider
   - Assign to translators
   - Set deadline (1 week)

4. **Review translations** (2-3 days)
   - Check for context accuracy
   - Verify technical terms
   - Request revisions if needed

5. **Integrate & test** (2-3 days)
   - Import translations to locale files
   - Run i18n:audit
   - QA test in app
   - Fix any layout issues

6. **Deploy v1.4** (1 week)
   - Build app
   - Update app store listings in ES, DE, PT, IT
   - Submit to Apple App Store & Google Play

**Total timeline:** 2-3 weeks from start to app store submission

---

## 📝 Template: Translation Brief (for Professional Providers)

```markdown
# ResetPulse Translation Brief

## Project Overview
- **App:** ResetPulse (Visual Timer for ADHD/Autism users)
- **Platform:** iOS/Android (React Native/Expo)
- **Current languages:** French (native), English (native)
- **Target languages:** Spanish, German, Portuguese, Italian
- **Strings to translate:** 128 per language
- **Context:** Mobile app UI, onboarding, settings, premium features

## Tone & Style
- **Tone:** Warm, supportive, encouraging
- **Formality:** Casual, friendly (Tu/Du form in ES/DE, not Usted/Sie)
- **User persona:** Adults with ADHD/Autism (20-40 years old)
- **Key message:** Calm, focus, productivity without stress

## Technical Requirements
- **Character limits:** Some strings have UI constraints (buttons, labels)
- **Variables:** Preserve placeholders like %{time}, %{name}, %{number}
- **Emoji:** Keep emoji in translated strings (they're universal)
- **Special terms:** See glossary for app-specific terminology

## Deliverables
- Translated JSON files (one per language)
- QA review by native speaker
- Revisions if needed (1 round included)
- Deadline: [DATE]

## Reference Materials
- Glossary: [glossary.md]
- Screenshots: [context/ folder]
- Style guide: [style-guide.md]
- Source file: [en-placeholders.json]
```

---

## 🔄 Ongoing Maintenance

After initial translation, maintain localization:

1. **New features:** Translate new strings before release
2. **Updates:** Keep translations in sync with EN/FR
3. **Community:** Accept contributions for minor fixes
4. **Versioning:** Track which app version has which translations

**Recommended workflow:**
- Add new EN strings → Mark for translation
- Before release → Batch translate new strings
- QA → Verify translations in app
- Deploy → Ship with complete translations

**Tools:**
- i18n:audit script (detect missing translations)
- Translation memory (reuse previous translations)
- Automated alerts (notify when new strings added)

---

## ✅ Success Metrics

Track translation impact:

1. **App Store:**
   - Downloads by country/language
   - Rankings in localized app stores
   - Reviews in target languages

2. **In-App:**
   - User language preference distribution
   - Retention rate by language
   - Premium conversion by language

3. **Quality:**
   - User feedback on translations
   - Support tickets (translation issues)
   - Community corrections submitted

---

## 📚 Resources

**Translation Providers:**
- Lokalise: https://lokalise.com
- Phrase: https://phrase.com
- OneSky: https://www.oneskyapp.com
- Gengo: https://gengo.com

**Machine Translation:**
- DeepL API: https://www.deepl.com/pro-api
- Google Cloud Translation: https://cloud.google.com/translate

**Community Platforms:**
- Crowdin: https://crowdin.com
- Weblate: https://weblate.org

**i18n Best Practices:**
- React Native i18n Guide: https://reactnative.dev/docs/languages
- Expo Localization: https://docs.expo.dev/versions/latest/sdk/localization/

---

## 🎯 Recommendation

**Start with Phase 1 (Tier 1) using professional translation.**

**Why:**
- Largest markets (ES, DE, PT, IT)
- Highest ROI ($1,500 investment → 4 fully localized markets)
- Fast timeline (2-3 weeks)
- Quality guarantee (native speakers)
- Critical for EU/Latin America expansion

**Next steps:**
1. Get approval for $1,500-2,000 budget
2. Choose translation provider
3. Prepare translation package
4. Submit for translation
5. Ship v1.4 with ES, DE, PT, IT in Q1 2026

---

**Questions?** Contact Eric for budget approval and vendor selection.
