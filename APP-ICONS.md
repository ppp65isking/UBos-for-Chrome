# Vendor product artwork

UBos uses artwork served for these vendor-published Visual Studio Marketplace listings:

- Codex for UBos: OpenAI's Codex extension, identifier openai.chatgpt. Source: https://marketplace.visualstudio.com/items?itemName=openai.chatgpt
- Claude Code for UBos: Anthropic's Claude Code extension, identifier anthropic.claude-code. Source: https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code

The images are loaded remotely from each listing's Marketplace icon asset endpoint. They are not copied into this repository, redrawn, recolored, or licensed as UBos artwork. Their trademarks and applicable rights remain with their respective owners. These integrations do not imply vendor sponsorship or endorsement. Linking to a published asset is not a grant of trademark rights.

The latest asset endpoints may change their artwork. Network, browser security policies, service availability or content blockers can prevent loading; UBos then shows a generic diamond, not a fabricated official logo. Remote image requests go to Microsoft's Marketplace asset infrastructure with no referrer sent.

The icon decorator covers existing and newly rendered Store headings, app headings, Settings app headings, desktop shortcuts, launcher results, running taskbar buttons and window name grips. It does not change the app names, install remote software, or verify installation/running/connection status.

After this commit is deployed to the UBos website, reload the page and open the UB Store. No Codespace restart or package installation is needed for this frontend-only change. If your deployment does not update automatically from main, publish the updated main branch first.

Verification: vendor listing identities were checked. The image endpoints and UI rendering have not been tested in a live browser; verify both icons after deployment, including fallback behavior when image requests are blocked.
