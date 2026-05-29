import type { ComponentType } from "react";
import {
  Bot,
  Boxes,
  Code2,
  Database,
  Flame,
  KeyRound,
  MousePointer2,
  Network,
  Puzzle,
  Sparkles,
  Terminal,
} from "lucide-react";
import {
  SiClaude,
  SiGithub,
  SiGithubcopilot,
  SiGoogledrive,
  SiGooglechrome,
  SiNotion,
  SiOpenai,
} from "react-icons/si";

export type ConnectorStatusKind = "oauth" | "api-key" | "mcp-token";
export type ConnectorGroup = "MCP" | "Plugins" | "Knowledge bases" | "Apps & extensions" | "Developer";

export interface Connector {
  id: string;
  name: string;
  shortName: string;
  category: string;
  group: ConnectorGroup;
  statusKind: ConnectorStatusKind;
  description: string;
  docs: string[];
  connectPath: string;
  accent: string;
  icon: ComponentType<{ className?: string }>;
  installCommand?: string;
}

export const connectors: Connector[] = [
  {
    id: "opencode",
    name: "OpenCode",
    shortName: "OpenCode",
    category: "Coding agent",
    group: "Plugins",
    statusKind: "oauth",
    description: "Install the XMem OpenCode plugin and connect it with browser auth.",
    connectPath: "/auth/connect/opencode",
    accent: "from-sky-400 to-cyan-300",
    icon: Terminal,
    installCommand: "bunx opencode-xmem@latest install",
    docs: [
      "Run the installer in your OpenCode environment.",
      "Use /xmem-login or run bunx opencode-xmem@latest login.",
      "Approve the browser connection when XMem opens.",
      "Restart OpenCode so the xmem tool is loaded.",
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    shortName: "Claude Code",
    category: "Coding agent",
    group: "Plugins",
    statusKind: "api-key",
    description: "Add XMem slash commands, MCP config, and persistent coding memory to Claude Code.",
    connectPath: "/auth/connect/claude-code",
    accent: "from-amber-300 to-orange-200",
    icon: SiClaude,
    installCommand: "npx xmem-claude-code@latest install",
    docs: [
      "Run the connector installer from the project or home directory you want Claude Code to use.",
      "Keep XMEM_API_KEY and XMEM_USERNAME in your environment or secret store.",
      "Restart Claude Code so the XMem MCP server and slash commands are loaded.",
      "Use XMem memory tools when you need prior project or user context.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    shortName: "Cursor",
    category: "IDE",
    group: "MCP",
    statusKind: "mcp-token",
    description: "Install XMem MCP config and Cursor rules for project memory inside Cursor.",
    connectPath: "/auth/connect/cursor",
    accent: "from-sky-300 to-blue-200",
    icon: MousePointer2,
    installCommand: "npx xmem-cursor@latest install",
    docs: [
      "Run the connector installer in a workspace or pass --config-root for a specific project.",
      "Set XMEM_API_KEY and XMEM_USERNAME in the Cursor MCP launch environment.",
      "Open Cursor settings and confirm the xmem MCP server is available.",
      "Use XMem tools for memory search, recall, and durable project notes.",
    ],
  },
  {
    id: "hermes",
    name: "Hermes",
    shortName: "Hermes",
    category: "Coding agent",
    group: "Plugins",
    statusKind: "api-key",
    description: "Configure Hermes Agent with XMem MCP memory and shared agent instructions.",
    connectPath: "/auth/connect/hermes",
    accent: "from-rose-300 to-pink-200",
    icon: Sparkles,
    installCommand: "npx xmem-hermes@latest install",
    docs: [
      "Run the Hermes connector installer to create local MCP config and HERMES.md guidance.",
      "Keep XMEM_API_KEY out of the generated files and provide it through the environment.",
      "Restart Hermes after installing the connector config.",
      "Use XMem for persistent memory across Hermes sessions.",
    ],
  },
  {
    id: "codex",
    name: "Codex",
    shortName: "Codex",
    category: "Coding agent",
    group: "Plugins",
    statusKind: "api-key",
    description: "Install XMem as a Codex plugin plus MCP-backed project memory instructions.",
    connectPath: "/auth/connect/codex",
    accent: "from-indigo-300 to-cyan-200",
    icon: Bot,
    installCommand: "npx xmem-codex@latest install",
    docs: [
      "Run the Codex connector installer to create config.toml and AGENTS.md memory guidance.",
      "Install the included Codex plugin bundle when you want Codex app discoverability.",
      "Set XMEM_API_KEY and XMEM_USERNAME in the runtime environment.",
      "Use XMem tools for durable user and project memory.",
    ],
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    shortName: "OpenClaw",
    category: "Coding agent",
    group: "Plugins",
    statusKind: "api-key",
    description: "Connect OpenClaw to XMem with an MCP plugin bundle and memory skill.",
    connectPath: "/auth/connect/openclaw",
    accent: "from-red-300 to-orange-200",
    icon: Flame,
    installCommand: "npx xmem-openclaw@latest install",
    docs: [
      "Run the OpenClaw connector installer to generate plugin and MCP files.",
      "Provide XMEM_API_KEY and XMEM_USERNAME from the environment.",
      "Install or reload the OpenClaw plugin bundle.",
      "Use the XMem memory skill for cross-session recall.",
    ],
  },
  {
    id: "mcp",
    name: "MCP Server",
    shortName: "MCP",
    category: "Protocol",
    group: "MCP",
    statusKind: "mcp-token",
    description: "Generate a temporary token for MCP-compatible clients.",
    connectPath: "/auth/connect/mcp",
    accent: "from-violet-400 to-fuchsia-300",
    icon: Network,
    docs: [
      "Generate a one-time token from this page.",
      "Paste authenticate(token=\"...\") into the MCP client.",
      "The MCP server exchanges it for a permanent XMem API key.",
      "Use the generated server config in Claude Desktop, ChatGPT, or another MCP host.",
    ],
  },
  {
    id: "claude",
    name: "Claude Desktop",
    shortName: "Claude",
    category: "MCP client",
    group: "MCP",
    statusKind: "mcp-token",
    description: "Connect Claude Desktop through the XMem MCP server.",
    connectPath: "/auth/connect/claude",
    accent: "from-orange-300 to-amber-200",
    icon: SiClaude,
    docs: [
      "Install or update the XMem MCP server.",
      "Generate a temporary token here.",
      "Run authenticate(token=\"...\") from Claude Desktop.",
      "Keep Claude Desktop open while the server stores the permanent key.",
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    shortName: "ChatGPT",
    category: "MCP client",
    group: "MCP",
    statusKind: "mcp-token",
    description: "Use XMem memory from ChatGPT through an MCP connector.",
    connectPath: "/auth/connect/chatgpt",
    accent: "from-emerald-300 to-teal-200",
    icon: SiOpenai,
    docs: [
      "Add the XMem MCP server in ChatGPT connectors.",
      "Generate a temporary token here.",
      "Authenticate the server with authenticate(token=\"...\").",
      "Use XMem search and recall from ChatGPT conversations.",
    ],
  },
  {
    id: "chrome",
    name: "Chrome Extension",
    shortName: "Chrome",
    category: "Browser",
    group: "Apps & extensions",
    statusKind: "api-key",
    description: "Use XMem inline memory inside AI chat websites.",
    connectPath: "/auth/connect/chrome",
    accent: "from-lime-300 to-yellow-200",
    icon: SiGooglechrome,
    docs: [
      "Download the XMem extension package from docs.",
      "Load the unpacked extension from chrome://extensions.",
      "Create or copy an XMem API key from the dashboard.",
      "Set API URL, API key, and username in the extension popup.",
    ],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    shortName: "Copilot",
    category: "IDE assistant",
    group: "MCP",
    statusKind: "mcp-token",
    description: "Prepare XMem memory for Copilot-compatible MCP workflows.",
    connectPath: "/auth/connect/copilot",
    accent: "from-gray-200 to-white",
    icon: SiGithubcopilot,
    docs: [
      "Enable MCP support in your editor or Copilot environment.",
      "Add the XMem MCP server config.",
      "Generate a temporary token here.",
      "Authenticate once, then query XMem from coding sessions.",
    ],
  },
  {
    id: "github",
    name: "GitHub Scanner",
    shortName: "GitHub",
    category: "Code memory",
    group: "Knowledge bases",
    statusKind: "api-key",
    description: "Index repositories into XMem code memory and query them later.",
    connectPath: "/auth/connect/github",
    accent: "from-white to-zinc-300",
    icon: SiGithub,
    docs: [
      "Open Scanner from the dashboard or docs.",
      "Create an API key for automation or local scripts.",
      "Submit the repository URL and branch to index.",
      "Query indexed code memory from API, MCP, or OpenCode.",
    ],
  },
  {
    id: "notion",
    name: "Notion",
    shortName: "Notion",
    category: "Knowledge base",
    group: "Knowledge bases",
    statusKind: "oauth",
    description: "Sync selected Notion pages and workspace notes into XMem memory.",
    connectPath: "/auth/connect/notion",
    accent: "from-white to-zinc-300",
    icon: SiNotion,
    docs: [
      "Open the Notion connector page and start OAuth.",
      "Choose the workspace and pages XMem can access.",
      "Review imported page memory from the dashboard.",
      "Disconnect or rotate access from connector settings when needed.",
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    shortName: "Drive",
    category: "Knowledge base",
    group: "Knowledge bases",
    statusKind: "oauth",
    description: "Bring Google Drive docs and files into XMem as searchable memory.",
    connectPath: "/auth/connect/google-drive",
    accent: "from-emerald-300 to-yellow-200",
    icon: SiGoogledrive,
    docs: [
      "Open the Google Drive connector page and start OAuth.",
      "Grant read access only to the files or folders you want indexed.",
      "Let XMem ingest supported docs into memory.",
      "Manage sync state from the connector dashboard.",
    ],
  },
  {
    id: "api",
    name: "XMem API",
    shortName: "API",
    category: "Developer",
    group: "Developer",
    statusKind: "api-key",
    description: "Use direct REST, Python, or TypeScript SDK access.",
    connectPath: "/auth/connect/api",
    accent: "from-blue-300 to-indigo-200",
    icon: KeyRound,
    docs: [
      "Create an API key on the dashboard.",
      "Send Authorization: Bearer <key> with every request.",
      "Use ingest to save memories and retrieve/search to recall them.",
      "Keep production keys separate from local development keys.",
    ],
  },
  {
    id: "custom",
    name: "Custom Connector",
    shortName: "Custom",
    category: "SDK",
    group: "Developer",
    statusKind: "api-key",
    description: "Bring XMem into an internal agent, plugin, or workflow.",
    connectPath: "/auth/connect/custom",
    accent: "from-pink-300 to-rose-200",
    icon: Code2,
    docs: [
      "Create a scoped API key for your connector.",
      "Store the key in your secret manager or local env.",
      "Call XMem ingest, retrieve, search, or code endpoints.",
      "Document the connector owner and rotation plan.",
    ],
  },
];

export const defaultConnector = connectors[0];

export function getConnector(id?: string | null): Connector {
  if (!id) return defaultConnector;
  return connectors.find((connector) => connector.id === id) ?? defaultConnector;
}

function normalizeKeyName(name?: string) {
  return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function keyNameMatchesConnector(name: string, connector: Connector) {
  const candidates = [connector.id, connector.name, connector.shortName]
    .map((value) => value.toLowerCase())
    .filter(Boolean);

  if (candidates.some((candidate) => name === candidate || name.startsWith(`${candidate} connector`))) {
    return true;
  }

  return connector.id === "mcp" && name.startsWith("mcp client");
}

export function getConnectorStatus(connector: Connector, apiKeys: Array<{ name?: string }>) {
  if (connector.statusKind === "oauth") {
    return { label: "Not connected", connected: false, detail: "OAuth authorization required" };
  }

  const normalizedNames = apiKeys.map((key) => normalizeKeyName(key.name));
  const hasNamedKey = normalizedNames.some((name) => keyNameMatchesConnector(name, connector));

  if (hasNamedKey) {
    return { label: "Connected", connected: true, detail: "Connector key found" };
  }

  if (connector.statusKind === "api-key") {
    return apiKeys.length > 0
      ? { label: "Ready", connected: false, detail: "Use an existing API key" }
      : { label: "Not connected", connected: false, detail: "Create an API key first" };
  }

  return { label: "Not connected", connected: false, detail: "Generate a token to connect" };
}

export function connectorLogoLabel(connector: Connector) {
  return `${connector.name} logo`;
}

export { Bot, Boxes, Database, Puzzle };
