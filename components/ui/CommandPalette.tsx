"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion } from "motion/react";
import { useAppState } from "@/components/providers/AppState";

const GROUP_HEADING =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-fg-dim";

export function CommandPalette() {
  const router = useRouter();
  const {
    commandOpen,
    setCommandOpen,
    toggleChaos,
    setSelectMode,
    setSlideshow,
    accent,
    setAccent,
    pushToast,
    setQuery,
    focusGallery,
  } = useAppState();
  const [text, setText] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commandOpen && e.key === "Escape") {
        e.preventDefault();
        setCommandOpen(false);
        return;
      }
      const inField =
        e.target instanceof HTMLElement &&
        (e.target.matches("input, textarea, select") || e.target.isContentEditable);
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const bareK = !inField && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "k";
      if (combo || bareK) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  const close = () => {
    setCommandOpen(false);
    setText("");
  };
  const go = (fn: () => void) => {
    fn();
    close();
  };

  const runSearch = () => {
    if (text.trim().length < 2) return;
    setQuery(text.trim());
    router.push("/");
    setTimeout(focusGallery, 60);
    close();
  };

  if (!commandOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-start justify-center bg-bg/70 p-4 pt-[12vh] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={close}
    >
      <motion.div
            initial={{ y: -24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl brutal-border bg-bg shadow-[12px_12px_0_0_var(--acid)]"
          >
            <Command
              loop
              label="Deez Nutz command menu"
              className="[&_[cmdk-list]]:max-h-[52vh] [&_[cmdk-list]]:overflow-y-auto"
            >
              <div className="flex items-center gap-2 border-b-[3px] border-line px-3 py-2">
                <span className="font-mono text-sm text-acid">deez@nuts:~$</span>
                <Command.Input
                  autoFocus
                  value={text}
                  onValueChange={setText}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && text.trim().length >= 2) {
                      e.preventDefault();
                      runSearch();
                    }
                  }}
                  placeholder="search memes, or type a command"
                  className="w-full bg-transparent py-1 font-mono text-sm text-fg outline-none placeholder:text-fg-dim"
                />
              </div>
              <Command.List className="p-2">
                <Command.Empty className="px-3 py-6 text-center font-mono text-xs uppercase tracking-widest text-fg-dim">
                  nothing. bold.
                </Command.Empty>

                {text.trim().length >= 2 && (
                  <Command.Group heading="Search" className={GROUP_HEADING}>
                    <Item value={`search ${text}`} onSelect={runSearch}>
                      Search for &quot;{text.trim()}&quot;
                    </Item>
                  </Command.Group>
                )}

                <Command.Group heading="Go" className={GROUP_HEADING}>
                  <Item onSelect={() => go(() => router.push("/"))}>Open the gallery</Item>
                  <Item onSelect={() => go(() => router.push("/create"))}>Make a meme</Item>
                  <Item onSelect={() => go(() => router.push("/favorites"))}>Open favorites</Item>
                  <Item onSelect={() => go(() => router.push("/about"))}>What is Deez Nutz</Item>
                </Command.Group>

                <Command.Group heading="Actions" className={GROUP_HEADING}>
                  <Item onSelect={() => go(() => setSlideshow(0))}>Start the slideshow</Item>
                  <Item onSelect={() => go(toggleChaos)}>Toggle chaos mode</Item>
                  <Item onSelect={() => go(() => setSelectMode(true))}>Start a download pack</Item>
                  <Item
                    onSelect={() =>
                      go(() => {
                        navigator.clipboard.writeText(window.location.href);
                        pushToast("page link copied");
                      })
                    }
                  >
                    Copy link to this page
                  </Item>
                </Command.Group>

                <Command.Group heading="Accent" className={GROUP_HEADING}>
                  {(["acid", "hot", "volt", "sun", "grape"] as const).map((a) => (
                    <Item key={a} onSelect={() => go(() => setAccent(a))}>
                      Set accent: {a} {accent === a ? "✦" : ""}
                    </Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
      </motion.div>
    </motion.div>
  );
}

function Item({
  children,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-fg outline-none data-[selected=true]:bg-acid data-[selected=true]:text-bg"
    >
      {children}
    </Command.Item>
  );
}
