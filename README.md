# 🔍 Accessibility Audit Engine

An accessibility auditing tool built with Next.js, axe-core and Playwright. This application allows developers and designers to scan websites or HTML snippets for WCAG violations and offers actionable remediation steps with visual context.

## ✨ Features

-   **Dual Audit Modes**: Scan live websites via URL or test specific components by pasting HTML snippets.
-   **Professional Results**: Detailed breakdown of violations mapped to WCAG 2.1 levels (A, AA, AAA).
-   **Visual Context**: Automatically captures high-quality screenshots of the specific elements failing accessibility checks.
-   **In-Depth Analysis**:
    -   **Contrast Ratios**: Real-time foreground/background color analysis and compliance ratios.
    -   **Element Inspector**: View the exact HTML source code of the offending element.

## 🛠️ Tools

-   **Audit Engine**: [axe-core](https://github.com/dequelabs/axe-core)
-   **Automation/Screenshotting**: [Playwright](https://playwright.dev/)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   Playwright Browsers (installed automatically on first run or via `npx playwright install`)

### Installation

1.  Clone the repository:
    ```bash
    git clone [repository-url]
    cd accessibility-audit
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How It Works

The engine uses **Playwright** to launch a headless Chromium instance. It injects the **axe-core** testing engine into the page (live URL or raw HTML) to perform deep DOM analysis. This allows the tool to:
1.  Verify computed styles (like contrast) exactly as they appear to the user.
2.  Interact with the DOM in a real-world browser environment.
3.  Capture precise visual screenshots of violations using Playwright's native locator screenshotting.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
