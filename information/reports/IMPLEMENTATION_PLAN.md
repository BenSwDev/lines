# Lines App - Implementation Plan

**Date:** 2025-12-05  
**Version:** v1.4.0 → v2.0.0  
**Goal:** 100% Production-Ready

---

## 🎯 **CRITICAL FIXES - P0**

### **Fix 1: Connect Occurrence Generation** (2-3 days)

**Problem:** Occurrences are NOT created when saving a Line

**Files to Modify:**
1. `src/modules/lines/ui/CreateLineDialog.tsx` - Send dates to action
2. `src/modules/lines/actions/createLine.ts` - Generate occurrences
3. `src/modules/lines/schemas/lineSchemas.ts` - Add optional occurrence data

**Steps:**
- [x] Update `createLineSchema` to accept optional occurrence data ✅
- [x] Update `CreateLineDialog` to send selected dates + manual dates ✅
- [x] Update `createLine` action to generate occurrences using `lineScheduleService` ✅
- [x] Save occurrences using `lineOccurrencesSyncService` ✅
- [x] Handle both suggested (`isExpected: true`) and manual (`isExpected: false`) dates ✅

---

### **Fix 2: Fix Calendar Data Loading** (1-2 days)

**Problem:** Data structure mismatch - Service returns array, UI expects object

**Files to Modify:**
1. `src/modules/calendar/services/calendarService.ts` - Return proper structure
2. `src/modules/calendar/actions/getCalendarData.ts` - Format response
3. `src/modules/calendar/ui/CalendarTab.tsx` - Use correct data structure

**Steps:**
- [x] Fix calendar service to return `{ occurrences, lines }` ✅
- [x] Ensure line relationships loaded correctly ✅
- [x] Map overnight events correctly ✅
- [x] Connect hour compression calculation ✅

---

## 🟡 **HIGH PRIORITY - P1**

### **Fix 3: Write Critical Tests** (2-3 weeks)
### **Fix 4: Set Up Logging & Monitoring** (1 week)
### **Fix 5: Improve Error Handling** (3-5 days)

---

**Status:** ✅ **P0 CRITICAL FIXES COMPLETE**  
**Next Step:** Begin Fix 3 - Write Critical Tests (P1)

