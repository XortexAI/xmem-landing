import type { ComponentType } from "react";
import {
  Bot,
  Code2,
  KeyRound,
  Network,
  Puzzle,
  Terminal,
} from "lucide-react";
import {
  SiClaude,
  SiGithub,
  SiGithubcopilot,
  SiGooglechrome,
  SiOpenai,
} from "react-icons/si";

export type ConnectorStatusKind = "oauth" | "api-key" | "mcp-token";

export interface Connector {
  id: string;
  name: string;
  shortName: string;
  category: string;
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
    id: "mcp",
    name: "MCP Server",
    shortName: "MCP",
    category: "Protocol",
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
    id: "api",
    name: "XMem API",
    shortName: "API",
    category: "Developer",
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

export function getConnectorStatus(connector: Connector, apiKeys: Array<{ name?: string }>) {
  const normalizedNames = apiKeys.map((key) => (key.name || "").toLowerCase());
  const hasNamedKey = normalizedNames.some((name) => {
    if (name.includes(connector.id)) return true;
    if (name.includes(connector.shortName.toLowerCase())) return true;
    if (connector.statusKind === "mcp-token" && name.includes("mcp client")) return true;
    return false;
  });

  if (hasNamedKey) {
    return { label: "Connected", connected: true, detail: "Connector key found" };
  }

  if (connector.statusKind === "api-key" || connector.statusKind === "oauth") {
    return apiKeys.length > 0
      ? { label: "Ready", connected: false, detail: "Use an existing API key" }
      : { label: "Not connected", connected: false, detail: "Create an API key first" };
  }

  return { label: "Not connected", connected: false, detail: "Generate a token to connect" };
}

export function connectorLogoLabel(connector: Connector) {
  return `${connector.name} logo`;
}

export { Bot, Puzzle };
