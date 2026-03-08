# Migration Guide

This guide provides instructions on how to upgrade your application from older versions of `calendar-simple` to newer, major versions that introduce breaking changes.

---

## Upgrading from v1.x to v2.0

Version 2.0 of `calendar-simple` introduces major improvements to the component architecture, style isolation, and type handling, requiring a few straightforward updates in your application.

### 1. Update Dependencies

Update the `calendar-simple` package to the latest version:

```bash
npm install calendar-simple@2.0.0
# or
yarn add calendar-simple@2.0.0
```

### 2. Breaking Changes

#### CSS Modules and Style Isolation

In v2.0, the library's styling architecture was overhauled to use **CSS Modules**. This change guarantees strict style isolation, preventing `calendar-simple` styles from leaking into your application and vice versa.

**Impact:** Generated class names are now uniquely hashed (e.g., `_MonthView_1x2y3`). If you previously customized the calendar by overriding global class names (like `.calendar-month-view`), your styles will no longer apply.

**Solution:** Only use the officially supported `classNames` and `theme` props provided by the `<Calendar>` component to override styles and inject custom class names safely.

#### Component Library Restructuring

The internal folder layout and file naming conventions have been completely reorganized (now using `snake_case`) and monolithic type definitions were split into separate, modular files.

**Impact:** Top-level package exports remain the same. However, if your code relied on "deep imports" to reach specific internal components, utilities, or types, your build will fail.

**Before (Will Break):**

```ts
import MonthView from "calendar-simple/src/views/month/MonthView";
import type { CalendarEvent } from "calendar-simple/src/types/index";
```

**After (Correct):**

```ts
import Calendar from "calendar-simple";
import type { CalendarEvent, ECalendarViewType } from "calendar-simple";
```

### 3. New Features to Keep in Mind

- **Invalid Event Filtering**: We now automatically validate your event data arrays. Events where the `endDate` incorrectly occurs before the `startDate` are considered natively invalid and silently filtered out. This ensures the calendar no longer crashes or renders malformed UI bounds when receiving bad data.

---

_Need help migrating? If you encounter an issue not covered in this guide, please open an issue on our GitHub repository._
