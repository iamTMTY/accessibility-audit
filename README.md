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

### Production Deployment (Vercel)

To run Playwright in Vercel's serverless environment, you need a remote browser service. 

1. Sign up for a free account at [Browserless.io](https://www.browserless.io/).
2. Add your **API Key** to your Vercel Environment Variables:
   - Key: `BROWSERLESS_API_KEY`
   - Value: `[Your-API-Key]`
3. Alternatively, you can use a full WebSocket endpoint:
   - Key: `BROWSER_WS_ENDPOINT`
   - Value: `wss://chrome.browserless.io?token=[Your-API-Key]`

The engine will automatically detect these variables and switch to remote mode.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
