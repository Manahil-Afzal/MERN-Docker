# TODO - Lint pipeline fixes

- [ ] Fix React hook rule violation in `client/app/hooks/userAuth.tsx` (rename to `useUserAuth` custom hook, remove invalid hook naming/types).
- [ ] Fix `react-hooks/set-state-in-effect` errors by moving state updates out of `useEffect` blocks in:
  - [ ] `client/app/components/Auth/verification.tsx`
  - [ ] `client/app/components/Header.tsx`
  - [ ] `client/app/components/Payment/CheckoutForm.tsx`
  - [ ] `client/app/components/Profile/ChangePassword.tsx`
  - [ ] `client/app/components/Course/CourseContentMedia.tsx`
  - [ ] `client/app/components/Profile/Profile.tsx`
  - [ ] `client/app/components/Profile/ProfileInfo.tsx`
  - [ ] `client/app/course-access/[id]/page.tsx`
  - [ ] `client/app/components/Route/Courses.tsx`
- [ ] Remove/replace all `any` and `{}` empty-object typing errors, starting with the files causing `@typescript-eslint/no-explicit-any` and `no-empty-object-type` errors.
- [ ] Fix remaining hook dependency warnings only if they become errors in CI.
- [ ] Re-run `cd client && npm run lint --if-present` until pipeline is green.

