# Security Specification: Gym Log User Access Control

## 1. Data Invariants
- A user can only access, create, edit, or delete their own workouts, templates, and custom exercises.
- All documents must have strict ID formatting (alphanumeric with underscores or dashes, max 128 chars) to prevent injection.
- Workout names and template names are restricted to a maximum of 200 characters to prevent database bloating.
- All workout payloads must contain valid duration (if finished) and startTime (integer timestamps) to prevent resource corruption.

## 2. The "Dirty Dozen" Payloads (Denial-of-Wallet & Privilege Escalation Tests)

1. **Unauthenticated Read Attempt**: Reading workout logs without signing in.
2. **Cross-User Read Attempt**: User A attempting to read User B's workout list.
3. **Cross-User Write Attempt**: User A attempting to add a workout to User B's log.
4. **Workout Name Overflow**: Creating a workout with a 500KB string for the name.
5. **ID Poisoning Attack**: Injecting special characters or a 10KB string as the workout document ID.
6. **Shadow Field Injection**: Injecting an unauthorized field (e.g., `role: "admin"`) inside a workout document.
7. **Invalid Type for Date**: Sending a boolean or integer for the workout `date` field.
8. **Invalid Exercises List Type**: Sending a string instead of a List for the `exercises` property in a template.
9. **Tampering with ID after Creation**: Attempting to modify the ID of an existing workout document.
10. **Template Name Overflow**: Creating a custom template with a 1MB string for the name.
11. **Custom Exercise Muscle Group Spoofing**: Injecting an excessively long or invalid muscle group field.
12. **Cross-User Deletion**: User A attempting to delete User B's template.

## 3. Security Assertions Summary
Every write operation validates `isOwner(userId)` and checks the schema with `isValidWorkout`, `isValidTemplate`, or `isValidExercise` helper functions to enforce type-safety and limits.
