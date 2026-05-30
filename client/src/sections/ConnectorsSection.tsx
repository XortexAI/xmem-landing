import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Link } from "wouter";
import { ConnectorLogo, connectors, type ConnectorGroup } from "@/lib/connectors";
import { RevealSection } from "../components/shared/RevealSection";

const groups: ConnectorGroup[] = ["MCP", "Plugins", "Knowledge bases", "Apps & extensions", "Developer"];

export function ConnectorsSection() {
  const counts = groups.map((group) => ({
    group,
    count: connectors.filter((connector) => connector.group === group).length,
  }));

  return (
    <section className="relative overflow-hidden bg-[#080808] py-28">
      <div className="absolute inset-0 dot-pattern opacity-15" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <RevealSection className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-[#15181f]">
          <div className="grid min-h-[180px] gap-6 overflow-hidden md:grid-cols-[1fr_420px]">
            <div className="flex flex-col justify-center px-7 py-8">
              <div className="mb-5 w-fit rounded-md bg-white px-3 py-1 text-xs font-bold uppercase tracking-normal text-black">
                Featured
              </div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Your AI tools remember the work between sessions.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
                Connect XMem to coding agents, MCP clients, knowledge bases, and workspace apps from one dashboard.
              </p>
            </div>
            <div className="relative hidden items-center justify-center overflow-hidden bg-[#0f0f0f] md:flex">
              <div className="relative text-[7rem] font-black leading-none tracking-normal text-white/15 lg:text-[9rem]">
                MCP
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection className="rounded-lg border border-white/10 bg-[#171a21] p-5 shadow-2xl shadow-black/25">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-black/25 p-1">
              <Link href="/auth/connect" className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                All
              </Link>
              {counts.map(({ group, count }) => (
                <a
                  key={group}
                  href={`#connector-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="shrink-0 rounded-full px-4 py-2 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {group} <span className="ml-1 text-white/35">{count}</span>
                </a>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              <Search className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          <div className="space-y-8">
            {groups.map((group) => {
              const groupConnectors = connectors.filter((connector) => connector.group === group);
              if (groupConnectors.length === 0) return null;

              return (
                <div key={group} id={`connector-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="scroll-mt-28">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-normal text-white/55">{group}</h3>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groupConnectors.map((connector, index) => {
                      return (
                        <motion.div
                          key={connector.id}
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.04, duration: 0.35 }}
                          className="rounded-lg border border-white/[0.07] bg-[#121419] p-5 transition-colors hover:border-white/20"
                        >
                          <div className="mb-5 flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white text-black">
                              <ConnectorLogo connector={connector} />
                            </div>
                            <Link href={`/docs#connector-${connector.id}`} className="inline-flex items-center gap-1 text-xs text-white/45 hover:text-white">
                              <BookOpen className="h-3.5 w-3.5" />
                              Docs
                            </Link>
                          </div>

                          <div className="flex min-h-[88px] flex-col">
                            <h4 className="text-base font-semibold text-white">{connector.name}</h4>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">{connector.description}</p>
                          </div>

                          <Link
                            href={connector.connectPath}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08]"
                          >
                            Connect
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
