"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

export function ArenaTokenShare({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function copyToken() {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareLink() {
    const url = `${window.location.origin}/arena/${token}`;
    if (navigator.share) {
      navigator.share({ title: "Entrar na Arena", text: `Token: ${token}`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-xl border border-amber-700/30 bg-amber-100 px-3 py-1.5">
        <span className="font-mono text-xl font-black tracking-[0.3em] text-amber-900">
          {token}
        </span>
      </div>
      <button
        onClick={copyToken}
        title="Copiar token"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-900/15 bg-white/80 text-amber-800 transition hover:bg-amber-100 active:scale-95"
      >
        <Copy size={15} />
      </button>
      <button
        onClick={shareLink}
        title="Compartilhar link"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-900/15 bg-white/80 text-amber-800 transition hover:bg-amber-100 active:scale-95"
      >
        <Share2 size={15} />
      </button>
      {copied && (
        <span className="text-xs font-semibold text-emerald-700 animate-in fade-in">
          Copiado!
        </span>
      )}
    </div>
  );
}
