# [2.0.0](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.2.0...v2.0.0) (2026-05-26)

- feat!: support compound component pattern and improve prop handling ([5635395](https://github.com/Jaganath-MSJ/CalendarSimple/commit/5635395ab21dfa2c49252cce9cfb56088396b496))
- feat(calendar)!: add internationalization support ([1be93db](https://github.com/Jaganath-MSJ/CalendarSimple/commit/1be93db474ff33f9a3a13c9532cf5fedf6d25e72))
- fix!: correct plural unit names and ISO date formatting ([44356a4](https://github.com/Jaganath-MSJ/CalendarSimple/commit/44356a4739391b549962a857867020ffe0d7be06))
- refactor!: migrate from dayjs to luxon for date handling ([7e9d3e3](https://github.com/Jaganath-MSJ/CalendarSimple/commit/7e9d3e3f7c5d8dc7269bf86809fb99687cf38fc2))

### Bug Fixes

- add reusable popover component for calendar events ([a9382cf](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a9382cfb4e576cdef3e3e3542c564164b9cc8913))
- adjust all-day banner and day event layout for partial-day events ([ad18b03](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ad18b034dcf1381233d55e4051b16e27c053c15d))
- **all-day-banner:** show arrows when chip boundary differs from event's actual day ([e6357e1](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e6357e179d5db119b8588c44972852690e96b50c))
- **calendar:** expose testId-container and CSS vars in compound mode ([c1bba44](https://github.com/Jaganath-MSJ/CalendarSimple/commit/c1bba4464c32700295e28265ecc303d41dd5d37f))
- **Calendar:** pass validEvents into context config to close TC3 filter bypass ([7e5714b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/7e5714bbba83221b95b3b95a05507c0df22dd753))
- **Calendar:** remove container div and conditionally use resize observer ([9d88167](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9d88167b7d69149e0d72a65edcdb2bd144154f8d))
- **calendar:** support string CSS lengths for width and height props ([3f1d69d](https://github.com/Jaganath-MSJ/CalendarSimple/commit/3f1d69df8ff3b72c9423e3cd80c3cd524dde17eb))
- cap event z-index to prevent overlapping with header elements ([ee9316c](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ee9316ca4d53ffc27d59d6598888c8a0d001ebc0))
- **ClassNames:** extend classNames support to all calendar views ([a865809](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a86580951cab576b783d94561413425fd06b0cba))
- correct navigation unit for schedule view and clean up unused code ([2951941](https://github.com/Jaganath-MSJ/CalendarSimple/commit/295194163897b15c277daad2700c28b6922f93c0))
- correct theming variable docs and modernize project docs ([83a645e](https://github.com/Jaganath-MSJ/CalendarSimple/commit/83a645e13143355744d556418d7af00084afeaa7))
- **DayView:** add overlapping event layout calculation ([9dbbb1a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9dbbb1a9de9f9cd0df7a46409a93d6bf8790c8e9))
- **DayView:** adjust event layout and styling for small time slots ([9cea280](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9cea2806f6cc858624d4f391acfd180629a80eb2))
- **DayView:** improve overlapping event layout and visual consistency ([a03f29b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a03f29ba323121c6d42b5bfbdb5550d7c703727f))
- **error-boundary:** catch renderer exceptions and show fallback (DI-4) ([b6eed56](https://github.com/Jaganath-MSJ/CalendarSimple/commit/b6eed56a492071cffc06bcd9cd213a24bf3039a3))
- Filter out invalid events where end date occurs before start date ([8d0934d](https://github.com/Jaganath-MSJ/CalendarSimple/commit/8d0934ddf840cec858e4a4a8c355318aeb02b89f))
- **month-view:** pass hidden events array as second arg to onMoreClick ([d9570df](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d9570df7db60e0fda251e8e761809b047e478dbf))
- **MonthView:** reorder onDateClick call to prevent firing on non-selectable dates ([bf401d6](https://github.com/Jaganath-MSJ/CalendarSimple/commit/bf401d64be13c150783be010c0129ff6e98219ed))
- **playground:** avoid render-phase updates and nested button markup ([51e1f4c](https://github.com/Jaganath-MSJ/CalendarSimple/commit/51e1f4c33040a3b769b06922cfaf412fc931cd9e))
- **playground:** replace Vite template README with playground guide ([1d2d9ee](https://github.com/Jaganath-MSJ/CalendarSimple/commit/1d2d9eeba8ecd6424d52cae0157a4e640dec4a1b))
- prevent scrollIntoView from scrolling ancestor containers ([da8bf22](https://github.com/Jaganath-MSJ/CalendarSimple/commit/da8bf22880c8e2f884ae2960c92b4ac37e021bde))
- sync selectedDate prop and fix year list calculation ([e4e3eb8](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e4e3eb8ee985b09a2bfa0f2107b1511ad0b94478))
- **Theme:** change schedule navigation unit from month to day ([9a1bb58](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9a1bb58f8e7cb19958f2de85023151d2304a85a3))
- **View:** document and expose background-refresh loading overlay (DI-3) ([d3de2e5](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d3de2e5a3550b539c67757b128534fb7b0b176e8))
- **views:** correct flex layout to prevent Schedule view content clipping ([2e496e4](https://github.com/Jaganath-MSJ/CalendarSimple/commit/2e496e4d94e68bb8346f1e6c06900e7448801951))

### Features

- **a11y:** add keyboard navigation and ARIA support across all views ([95e7c1b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/95e7c1b38ffa6829a984a0865db852645ea16d8f))
- **accessibility:** improve event text contrast across calendar views ([75c924a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/75c924a757010c452c2089eee9fb5c6b967893b1))
- add 12-hour time format support across calendar views ([72fbc01](https://github.com/Jaganath-MSJ/CalendarSimple/commit/72fbc01e797aa386bb7ac8d74f0718676050c44e))
- add all-day event support and improve multi-day event handling ([32ac60b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/32ac60b4b184db482a913ad3ba013329e7cdbe46))
- add custom renderers for events, header, hour and date cells ([b1f3d1d](https://github.com/Jaganath-MSJ/CalendarSimple/commit/b1f3d1d57548c8d86bb85edc7db7b84ef408ccbe))
- add eventOverlapOffset prop for stacked event layout ([e8d6677](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e8d6677066a56d1f2fb53438b6da9e809e5ebe2e))
- add optional id field to events and use for React keys ([ea8e841](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ea8e841f590de43f53ef16494ee3ca51584d0a10))
- add view field and make is12Hour required in CalendarContentType ([4e84412](https://github.com/Jaganath-MSJ/CalendarSimple/commit/4e84412b0ba7d6477d6273daadeec28da5804b0d))
- **AllDayBanner:** add expandable overflow for hidden events ([8ba1f16](https://github.com/Jaganath-MSJ/CalendarSimple/commit/8ba1f16325b86db3811c341a80775e5d15d3dc8f))
- **AllDayBanner:** add maxEvents prop and improve UX ([a0d8359](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a0d83595a60bda33b4dce786b43c3ce741ad48e0))
- **AllDayBanner:** add timezone label and smart expand/collapse logic ([cc8eee6](https://github.com/Jaganath-MSJ/CalendarSimple/commit/cc8eee6313f95f7cd7329e9b73dc6acbe798c062))
- **AllDayBanner:** improve sticky header layout and add timezone label ([619563d](https://github.com/Jaganath-MSJ/CalendarSimple/commit/619563d7e97342b68b7717f3dedb6b660703c9e8))
- **AutoScroll:** add auto-scroll to current time in calendar views ([7fd8468](https://github.com/Jaganath-MSJ/CalendarSimple/commit/7fd846891c908d179009590f0f7891a99723b4ce))
- **calendar:** add configurable week start and end days ([9f00c15](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9f00c150a6e13c268590d3f6f7ebaa02a67dcb7d))
- **calendar:** add custom days view for flexible multi-day calendar display ([902c997](https://github.com/Jaganath-MSJ/CalendarSimple/commit/902c9977696fac9d53bc174ffecd9b0227f8a452))
- **calendar:** add loading state with skeleton UIs and renderLoading prop ([82a6b78](https://github.com/Jaganath-MSJ/CalendarSimple/commit/82a6b78cb3c80730017f9b2294951e51a3873500))
- **calendar:** add minHour and maxHour props to limit displayed time range ([133af2a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/133af2aca985b072411caac9caace2ecbcfa7675))
- **calendar:** add resetDateOnViewChange prop to reset date on view change ([69bbdfd](https://github.com/Jaganath-MSJ/CalendarSimple/commit/69bbdfd3293a7a44a6e3430608e30593272e7f2d))
- **calendar:** add showAdjacentMonths prop to control adjacent month display ([0523174](https://github.com/Jaganath-MSJ/CalendarSimple/commit/052317470d9d391f26be4faecffbb784aefccb0e))
- **calendar:** add showAllDayRow prop to hide all-day event banner ([693370e](https://github.com/Jaganath-MSJ/CalendarSimple/commit/693370e9a76d49e5dceee4addec4da2e053b3765))
- **calendar:** add slot creation with onSlotClick callback ([43aeaa9](https://github.com/Jaganath-MSJ/CalendarSimple/commit/43aeaa9f86220fd8de4d3493c569884b8385d9ff))
- **calendar:** add week number display support ([9c73ad8](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9c73ad86b064a5e33df5484d0ae1fe5330ecb727))
- **color-scheme:** add color scheme support with auto-detection and dark mode ([e73f9bb](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e73f9bbdb7add98a15747069d2adc6fa48123aa3))
- **context:** add SET_CUSTOM_DAYS action for prop-change syncing ([5f7e755](https://github.com/Jaganath-MSJ/CalendarSimple/commit/5f7e75551463cfa76b3d78eddf16f4f5a004c863))
- **CurrentTime:** add current time indicator for day and week views ([611eeb3](https://github.com/Jaganath-MSJ/CalendarSimple/commit/611eeb3694ec73804ca51a812e40950d03d7daa1))
- **dark-mode:** add color scheme support with auto-detection ([44b49e5](https://github.com/Jaganath-MSJ/CalendarSimple/commit/44b49e5c62481a6289c674814456ee0947a7913c))
- **DayView:** add day view and view switching capability ([6416c61](https://github.com/Jaganath-MSJ/CalendarSimple/commit/6416c61d243693686165dbe2c0e00f69915b815e))
- **Header:** enhance header title and day view layout ([7568473](https://github.com/Jaganath-MSJ/CalendarSimple/commit/75684736c3b9243a30d232b9acea62dafb0376a3))
- **localization:** add full i18n support with Luxon integration ([706e6a0](https://github.com/Jaganath-MSJ/CalendarSimple/commit/706e6a071e3b3ab1a9e1d7a7039c39ac42abc665))
- **performance:** add performance optimization options for calendar events ([fc85441](https://github.com/Jaganath-MSJ/CalendarSimple/commit/fc85441feb5086a5489e553e5c3f6219c87962ab))
- **playground:** expose classNames prop in ControlPanel ([d47c2be](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d47c2be28987218b2690a2cd06a95513c0e604d5))
- replace event color with style for flexible event styling ([d88828f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d88828f0b365c0886a57edbbafe9a938b0eb0d2b))
- **responsive:** add phone breakpoint for Schedule view ([50a4a35](https://github.com/Jaganath-MSJ/CalendarSimple/commit/50a4a351aacd25d895a47180938ca4449f3d7986))
- **responsive:** add tablet and phone breakpoints for Header and Month views ([cb8ba17](https://github.com/Jaganath-MSJ/CalendarSimple/commit/cb8ba174c3a8968165c754133443d048f5b5590a))
- **responsive:** add tablet and phone breakpoints for Week and Day views ([1fa89a8](https://github.com/Jaganath-MSJ/CalendarSimple/commit/1fa89a85733104ce29a4397df2a01f1186ff81d6))
- **rtl:** add direction prop and CSS logical properties for RTL support ([2dd479e](https://github.com/Jaganath-MSJ/CalendarSimple/commit/2dd479e3f86d838abea749d16c49e33285dd2b2c))
- **schedule:** add custom separator rendering between date groups ([cbba97b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/cbba97bb19c9a062fe0bdfd7b817124d6d2a4c91))
- **Schedule:** add schedule view ([b90c076](https://github.com/Jaganath-MSJ/CalendarSimple/commit/b90c0761cced11b4cbd6e5c06c11b8d8846c3b02))
- **stories:** add storybook examples for new calendar props ([5abf136](https://github.com/Jaganath-MSJ/CalendarSimple/commit/5abf136b8244bf58b65a00aa635453e50ec7ecf9))
- **storybook:** add features stories and detailed documentation ([9a3d08e](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9a3d08e3cbe94ea0fe231214f92db49321850fbb))
- **Storybook:** organize stories into view-specific files ([d75f2b8](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d75f2b8ce5dbeccdc54fcc44f489c5c099a46982))
- **testing:** add testId prop for better testability ([0338286](https://github.com/Jaganath-MSJ/CalendarSimple/commit/0338286c3e8e7273f11c6e8d83fd74365950cfc0))
- **useEvents:** add dev warnings for K-03 and K-05 misuse patterns ([73d480f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/73d480ff0c242061a4bc21c0e1be63fab40f1c72))
- **WeekView:** add all-day event banner to week and day views ([1956690](https://github.com/Jaganath-MSJ/CalendarSimple/commit/1956690769a142fbd27f2e91a44c38f2547363ee))
- **WeekView:** add week view to calendar component ([ba316bf](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ba316bf070f7444329862bba352717c6bb9b9f3e))

### BREAKING CHANGES

- support compound component pattern and improve prop handling
- Units for Luxon durations/intervals are now plural,
  and ISO formatting with single quotes around 'T' is now mandatory.
- The calendar now uses Luxon instead of Day.js for all date manipulation.
- add locale and localeMessages props for internationalization

# [1.2.0](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.1.1...v1.2.0) (2026-02-17)

### Bug Fixes

- add explicit type annotations to map callbacks ([fea1b24](https://github.com/Jaganath-MSJ/CalendarSimple/commit/fea1b24babb9ebf8767dd34f2a4658b77d3a54c9))
- centralize calendar constants for consistency ([a7c8e02](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a7c8e02406d20c78893fcf5d5cd456e95092b530))
- **popover:** change positioning to fixed and anchor to button ([03a8413](https://github.com/Jaganath-MSJ/CalendarSimple/commit/03a841355022cc27100971ce96c34cd45f2c5369))
- remove maxEvents from interface and make it dynamic ([b0d5495](https://github.com/Jaganath-MSJ/CalendarSimple/commit/b0d5495096316331a5f0f376ec4759dfb70a1351))

### Features

- add Storybook setup for component documentation and testing ([2ab6e12](https://github.com/Jaganath-MSJ/CalendarSimple/commit/2ab6e127005371f99c80212f96ec3053a07dcc36))
- improve popover positioning and scrolling ([61ff399](https://github.com/Jaganath-MSJ/CalendarSimple/commit/61ff399a86cd3f810e47cd10c103ca8ac8ece5cd))

## [1.1.1](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.1.0...v1.1.1) (2026-02-11)

### Bug Fixes

- fix date selection logic and dependency arrays ([78aa7e7](https://github.com/Jaganath-MSJ/CalendarSimple/commit/78aa7e789d7122d628c409a640a896641411d4de))

## [1.1.1-beta.1](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.1.0...v1.1.1-beta.1) (2026-02-11)

### Bug Fixes

- fix date selection logic and dependency arrays ([78aa7e7](https://github.com/Jaganath-MSJ/CalendarSimple/commit/78aa7e789d7122d628c409a640a896641411d4de))

# [1.1.0](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.0.2...v1.1.0) (2026-02-10)

### Bug Fixes

- **calendar:** correct event width calculation and styling for multi-day events ([e38f00a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e38f00a2700be8711e11a6e69847a0f7b76dfb7f))
- ensure consistent date comparison by using start of day ([5bab11b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/5bab11b078e25bb422f91d328a35f8bd3b1adc97))
- extract header into separate component ([d32e99f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d32e99f6321e1da85f29b8cdae16b84609f0c281))
- remove the registry-url in the setup node.js step ([05ecf99](https://github.com/Jaganath-MSJ/CalendarSimple/commit/05ecf99e3fd734260f26f29a40eaefd74d58cf2a))
- update repository url for semantic-release ([bbf5d9a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/bbf5d9ab50e4bff6030f185d98da1cbe938d1274))
- updating the package-lock file ([55e0c18](https://github.com/Jaganath-MSJ/CalendarSimple/commit/55e0c18bd0acec23ca214110d843378723207d6d))

### Features

- add maxEvents prop to limit displayed events per day ([864ba96](https://github.com/Jaganath-MSJ/CalendarSimple/commit/864ba9652accc49d207b5fa6125607e6746d2dab))
- add onEventClick and onMoreClick callbacks ([90b4d82](https://github.com/Jaganath-MSJ/CalendarSimple/commit/90b4d82fff13b7c7a0fd2e7702033e1bc041f323))
- add optional color property to calendar events ([de976db](https://github.com/Jaganath-MSJ/CalendarSimple/commit/de976db618a75004a0cdc2747bdd31d7112ee18f))
- add spacer handling and improve event limit logic ([9160689](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9160689a6d662173e6209bb5fbd247b14c02cf9b))
- add theme support for calendar date styling ([38a199b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/38a199ba9fd2e73d670fe95819572831e77c3214))
- calculate maxEvents dynamically based on calendar height ([ae3e7ad](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ae3e7ade0a0cf6186c8299f9d98564ef7b0ad178))
- **calendar:** implement week-based event layout with proper spacing ([550fa51](https://github.com/Jaganath-MSJ/CalendarSimple/commit/550fa51405109e6d5d9adb1dbc164833805cc488))
- **calendar:** improve event rendering across week boundaries ([93dac33](https://github.com/Jaganath-MSJ/CalendarSimple/commit/93dac33e833c52b9fb4145452f090d82deb6f8d1))
- **calendar:** support date range events with visual rendering ([437c197](https://github.com/Jaganath-MSJ/CalendarSimple/commit/437c197c746de5edf04836db029ee3149772e3eb))
- enable event item click to select specific date ([cfb43cc](https://github.com/Jaganath-MSJ/CalendarSimple/commit/cfb43ccaf93276e1d28ef9c82a89e8a508b177ce))
- **EventPopover:** add popover for hidden events ([117197f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/117197faf0c599468bbc4d508aa5b1b4ef8c99bf))
- **EventPopover:** correct popover event styling and date color logic ([6fc5662](https://github.com/Jaganath-MSJ/CalendarSimple/commit/6fc56622320af4d8ed9577d318e7f58b8e2c9efa))
- make calendar responsive using resize observer ([a01af33](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a01af33dea77261e15d452e4ec00aff6063975b9))

# [1.1.0-beta.1](https://github.com/Jaganath-MSJ/CalendarSimple/compare/v1.0.2...v1.1.0-beta.1) (2026-02-10)

### Bug Fixes

- **calendar:** correct event width calculation and styling for multi-day events ([e38f00a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/e38f00a2700be8711e11a6e69847a0f7b76dfb7f))
- ensure consistent date comparison by using start of day ([5bab11b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/5bab11b078e25bb422f91d328a35f8bd3b1adc97))
- extract header into separate component ([d32e99f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/d32e99f6321e1da85f29b8cdae16b84609f0c281))
- remove the registry-url in the setup node.js step ([05ecf99](https://github.com/Jaganath-MSJ/CalendarSimple/commit/05ecf99e3fd734260f26f29a40eaefd74d58cf2a))
- update repository url for semantic-release ([bbf5d9a](https://github.com/Jaganath-MSJ/CalendarSimple/commit/bbf5d9ab50e4bff6030f185d98da1cbe938d1274))
- updating the package-lock file ([55e0c18](https://github.com/Jaganath-MSJ/CalendarSimple/commit/55e0c18bd0acec23ca214110d843378723207d6d))

### Features

- add maxEvents prop to limit displayed events per day ([864ba96](https://github.com/Jaganath-MSJ/CalendarSimple/commit/864ba9652accc49d207b5fa6125607e6746d2dab))
- add onEventClick and onMoreClick callbacks ([90b4d82](https://github.com/Jaganath-MSJ/CalendarSimple/commit/90b4d82fff13b7c7a0fd2e7702033e1bc041f323))
- add optional color property to calendar events ([de976db](https://github.com/Jaganath-MSJ/CalendarSimple/commit/de976db618a75004a0cdc2747bdd31d7112ee18f))
- add spacer handling and improve event limit logic ([9160689](https://github.com/Jaganath-MSJ/CalendarSimple/commit/9160689a6d662173e6209bb5fbd247b14c02cf9b))
- add theme support for calendar date styling ([38a199b](https://github.com/Jaganath-MSJ/CalendarSimple/commit/38a199ba9fd2e73d670fe95819572831e77c3214))
- calculate maxEvents dynamically based on calendar height ([ae3e7ad](https://github.com/Jaganath-MSJ/CalendarSimple/commit/ae3e7ade0a0cf6186c8299f9d98564ef7b0ad178))
- **calendar:** implement week-based event layout with proper spacing ([550fa51](https://github.com/Jaganath-MSJ/CalendarSimple/commit/550fa51405109e6d5d9adb1dbc164833805cc488))
- **calendar:** improve event rendering across week boundaries ([93dac33](https://github.com/Jaganath-MSJ/CalendarSimple/commit/93dac33e833c52b9fb4145452f090d82deb6f8d1))
- **calendar:** support date range events with visual rendering ([437c197](https://github.com/Jaganath-MSJ/CalendarSimple/commit/437c197c746de5edf04836db029ee3149772e3eb))
- enable event item click to select specific date ([cfb43cc](https://github.com/Jaganath-MSJ/CalendarSimple/commit/cfb43ccaf93276e1d28ef9c82a89e8a508b177ce))
- **EventPopover:** add popover for hidden events ([117197f](https://github.com/Jaganath-MSJ/CalendarSimple/commit/117197faf0c599468bbc4d508aa5b1b4ef8c99bf))
- **EventPopover:** correct popover event styling and date color logic ([6fc5662](https://github.com/Jaganath-MSJ/CalendarSimple/commit/6fc56622320af4d8ed9577d318e7f58b8e2c9efa))
- make calendar responsive using resize observer ([a01af33](https://github.com/Jaganath-MSJ/CalendarSimple/commit/a01af33dea77261e15d452e4ec00aff6063975b9))
