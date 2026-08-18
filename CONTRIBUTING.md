# Contributing Guide

Welcome! This guide explains how to contribute to this project. It's written for beginners, so follow the steps in order — you won't need to guess anything.

## Table of Contents
- [First-Time Setup (Do This Once)](#first-time-setup-do-this-once)
- [Everyday Workflow](#everyday-workflow)
- [Golden Rules](#golden-rules)
- [Branch Naming](#branch-naming)
- [Project Structure Example](#project-structure-example)
- [Need Help?](#need-help)

---

## First-Time Setup (Do This Once)

### 1. Accept the GitHub invitation
Check your email or GitHub notifications for the repository invite and accept it.

### 2. Clone the repository
```bash
git clone https://github.com/ishtiakalhumaidi/care-OS.git
cd care-OS
```

### 3. Create your own branch
Replace `<your-name>` with your actual name (lowercase, no spaces).
```bash
git switch -c feature-<your-name>
```
Example:
```bash
git switch -c feature-ahmed
```

### 4. Push your branch to GitHub
```bash
git push -u origin feature-<your-name>
```
Your branch is now connected to GitHub. You only need to do this setup **once**.

---

## Everyday Workflow

Follow these 6 steps every time you sit down to work.

### Step 1 — Update the main branch
Always start with the latest code before you write anything.
```bash
git switch main
git pull origin main
```

### Step 2 — Update your own branch
Bring the latest changes from `main` into your branch.
```bash
git switch feature-<your-name>
git merge main
```
> If Git reports a **merge conflict**, resolve it before continuing (ask for help if unsure).

### Step 3 — Work on your feature
Write your code as normal.

### Step 4 — Commit your work
```bash
git add .
git commit -m "Describe what you changed"
```
Example:
```bash
git commit -m "Added login validation"
```

### Step 5 — Push your branch
```bash
git push
```
Since your branch is already connected, this is all you need.

### Step 6 — Create a Pull Request (PR)
1. Open the repository on GitHub.
2. Select your branch from the branch dropdown.
3. Click **Compare & Pull Request**.
4. Fill in a short description of what you did.
5. Click **Create Pull Request**.

Your PR will be reviewed and merged into `main` by the maintainer.

### After your PR is merged
Once your work is merged into `main`, sync your branch again so everyone stays up to date:
```bash
git switch main
git pull origin main
git switch feature-<your-name>
git merge main
```

---

## Golden Rules

- 🚫 **Never** commit directly to `main`.
- ✅ Always work on your **own branch**.
- 🔄 Always **pull the latest `main`** before starting new work.
- ⬆️ **Push your branch regularly** — don't wait until the end.
- 📩 **Create a Pull Request** once your task is complete.

---

## Branch Naming

Use this format:
```
feature-<your-name>
```
Examples: `feature-ahmed`, `feature-rahim`, `feature-sakib`

(If working on a specific task, you can also use `feature-<your-name>-<short-task>`, e.g. `feature-ahmed-login-page`.)

---

## Project Structure Example

```
main
│
├── (maintainer's commits)
│
├── feature-limon
│      ├── Commit 1
│      ├── Commit 2
│      └── Pull Request
│
├── feature-rudra
│      ├── Commit 1
│      └── Pull Request
│
├── feature-roki
│      ├── Commit 1
│      └── Pull Request
│
└── Maintainer reviews and merges everything into main
```

---

## Need Help?

If you get stuck (merge conflicts, push errors, etc.), don't panic — just ask before force-pushing or deleting anything.
