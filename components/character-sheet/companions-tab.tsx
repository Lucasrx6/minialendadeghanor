"use client";

import { useState, useTransition } from "react";
import { Plus, X, PawPrint, Users, ChevronDown, Skull, Pencil, Check } from "lucide-react";
import {
  ANIMAL_CONFIGS, KIND_LABEL, TYPE_LABEL, POWER_LEVEL_LABEL,
  type Companion, type CompanionKind, type CompanionType,
} from "@/lib/ghanor/animals";
import {
  addAnimalCompanion, addCustomCompanion, updateCompanion,
  markCompanionDead, removeCompanion,
} from "@/app/actions/companions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatMoney } from "@/lib/ghanor/inventory";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  characterId: string;
  companions: Companion[];
  moneyPc: number;
  isDmMode: boolean;
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function CompanionsTab({ characterId, companions, moneyPc, isDmMode }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const alive = companions.filter(c => c.is_alive);
  const dead  = companions.filter(c => !c.is_alive);

  const animals     = alive.filter(c => c.kind === "animal");
  const mercenaries = alive.filter(c => c.kind === "mercenary");
  const classComps  = alive.filter(c => c.kind === "class_companion");
  const others      = alive.filter(c => c.kind === "follower" || c.kind === "custom");

  const totalAnimalCapacity = animals.reduce((s, c) => s + c.carry_capacity_spaces, 0);

  return (
    <div className="space-y-4">
      {/* Resumo de carga dos animais */}
      {totalAnimalCapacity > 0 && (
        <div className="rounded-xl bg-stone-950 px-5 py-3 text-sm flex items-center justify-between">
          <span className="font-bold text-amber-200 flex items-center gap-2">
            <PawPrint size={16} /> Carga dos animais
          </span>
          <span className="text-emerald-300 font-semibold">{totalAnimalCapacity} espaços disponíveis</span>
        </div>
      )}

      <Button fullWidth variant="primary" onClick={() => setShowAddModal(true)}>
        <Plus size={16} /> Adicionar parceiro
      </Button>

      {/* Lista de animais */}
      {animals.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
            <PawPrint size={12} /> Animais
          </p>
          {animals.map(c => (
            <CompanionCard
              key={c.id}
              companion={c}
              isDmMode={isDmMode}
              onToast={showToast}
            />
          ))}
        </section>
      )}

      {/* Mercenários */}
      {mercenaries.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
            <Users size={12} /> Mercenários
          </p>
          {mercenaries.map(c => (
            <CompanionCard key={c.id} companion={c} isDmMode={isDmMode} onToast={showToast} />
          ))}
        </section>
      )}

      {/* Companheiros de classe */}
      {classComps.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Companheiros de Classe</p>
          {classComps.map(c => (
            <CompanionCard key={c.id} companion={c} isDmMode={isDmMode} onToast={showToast} />
          ))}
        </section>
      )}

      {/* Outros */}
      {others.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Outros</p>
          {others.map(c => (
            <CompanionCard key={c.id} companion={c} isDmMode={isDmMode} onToast={showToast} />
          ))}
        </section>
      )}

      {alive.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-stone-400">
          <PawPrint size={32} />
          <p className="text-sm">Nenhum parceiro ainda</p>
        </div>
      )}

      {/* Parceiros mortos / dispensados */}
      {dead.length > 0 && (
        <details className="rounded-xl border border-stone-200 bg-stone-50">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-stone-500">
            Histórico ({dead.length})
          </summary>
          <div className="space-y-2 px-4 pb-3">
            {dead.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-sm text-stone-400">
                <Skull size={12} />
                <span className="line-through">{c.name}</span>
                <span className="text-xs">{c.species ?? KIND_LABEL[c.kind]}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Modal de adição */}
      {showAddModal && (
        <AddCompanionModal
          characterId={characterId}
          moneyPc={moneyPc}
          isDmMode={isDmMode}
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => { setShowAddModal(false); showToast(msg); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-amber-50 shadow-xl"
          style={{ background: "linear-gradient(135deg, #78350f, #b45309)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Card de companion ────────────────────────────────────────────────────────

function CompanionCard({ companion: c, isDmMode, onToast }: {
  companion: Companion;
  isDmMode: boolean;
  onToast: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(c.name);
  const [editNotes, setEditNotes] = useState(c.notes ?? "");
  const [editCapacity, setEditCapacity] = useState(c.carry_capacity_spaces);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmDead, setConfirmDead] = useState(false);
  const [isPending, startTransition] = useTransition();

  function saveEdits() {
    startTransition(async () => {
      const result = await updateCompanion({
        companionId: c.id,
        name: editName,
        notes: editNotes,
        carryCapacitySpaces: isDmMode ? editCapacity : undefined,
      });
      if (result.error) onToast(result.error);
      else { setEditing(false); onToast("Parceiro atualizado."); }
    });
  }

  function handleDead() {
    startTransition(async () => {
      const result = await markCompanionDead(c.id);
      if (result.error) onToast(result.error);
      else onToast(`${c.name} marcado como morto.`);
      setConfirmDead(false);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCompanion(c.id);
      if (result.error) onToast(result.error);
      else onToast(`${c.name} removido.`);
      setConfirmRemove(false);
    });
  }

  const typeLabel = c.companion_type ? (TYPE_LABEL[c.companion_type] ?? c.companion_type) : null;
  const levelLabel = POWER_LEVEL_LABEL[c.power_level] ?? c.power_level;

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition"
      >
        <span className="text-xl">{c.kind === "animal" ? "🐾" : c.kind === "mercenary" ? "⚔️" : "🤝"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-900 truncate">{c.name}</p>
          <p className="text-xs text-stone-500">
            {c.species ?? KIND_LABEL[c.kind]}
            {typeLabel && ` · ${typeLabel}`}
            {` · ${levelLabel}`}
          </p>
        </div>
        {c.carry_capacity_spaces > 0 && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
            +{c.carry_capacity_spaces} esp.
          </span>
        )}
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-3 bg-stone-50">
          {!editing ? (
            <>
              {c.notes && <p className="text-xs italic text-stone-500">{c.notes}</p>}
              {c.carry_capacity_spaces > 0 && (
                <p className="text-xs text-stone-500">
                  Capacidade de carga: <strong>{c.carry_capacity_spaces} espaços</strong>
                  {c.species === "Mula" && " (base 5; +5 com alforjes)"}
                  {(c.species === "Cavalo" || c.species === "Cavalo de guerra") && " (0 sem alforjes; +5 com alforjes)"}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition flex items-center gap-1"
                >
                  <Pencil size={11} /> Editar
                </button>
                {c.kind === "animal" && !confirmDead && (
                  <button
                    onClick={() => setConfirmDead(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    Marcar como morto
                  </button>
                )}
                {confirmDead && (
                  <span className="flex items-center gap-1 text-xs text-red-700 font-semibold">
                    Confirmar?
                    <button onClick={handleDead} disabled={isPending} className="rounded px-2 py-0.5 bg-red-700 text-white hover:bg-red-600 transition disabled:opacity-50">Sim</button>
                    <button onClick={() => setConfirmDead(false)} className="rounded px-2 py-0.5 bg-stone-200 text-stone-700 hover:bg-stone-300 transition">Não</button>
                  </span>
                )}
                {(c.kind === "mercenary" || isDmMode) && !confirmRemove && (
                  <button
                    onClick={() => setConfirmRemove(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    {c.kind === "mercenary" ? "Dispensar" : "Remover"}
                  </button>
                )}
                {confirmRemove && (
                  <span className="flex items-center gap-1 text-xs text-red-700 font-semibold">
                    Confirmar?
                    <button onClick={handleRemove} disabled={isPending} className="rounded px-2 py-0.5 bg-red-700 text-white hover:bg-red-600 transition disabled:opacity-50">Sim</button>
                    <button onClick={() => setConfirmRemove(false)} className="rounded px-2 py-0.5 bg-stone-200 text-stone-700 hover:bg-stone-300 transition">Não</button>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold">
                Nome
                <Input value={editName} onChange={e => setEditName(e.target.value)} />
              </label>
              <label className="block text-xs font-semibold">
                Notas
                <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} />
              </label>
              {isDmMode && (
                <label className="block text-xs font-semibold">
                  Capacidade de carga (espaços)
                  <Input type="number" min={0} value={editCapacity} onChange={e => setEditCapacity(Number(e.target.value))} />
                </label>
              )}
              <div className="flex gap-2">
                <Button onClick={saveEdits} disabled={isPending}>
                  <Check size={13} /> Salvar
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Modal de adição ──────────────────────────────────────────────────────────

function AddCompanionModal({ characterId, moneyPc, isDmMode, onClose, onSuccess }: {
  characterId: string;
  moneyPc: number;
  isDmMode: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [tab, setTab] = useState<"animal" | "custom">("animal");
  const [isPending, startTransition] = useTransition();

  // Animal form
  const [selectedSlug, setSelectedSlug] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [deductCost, setDeductCost] = useState(true);

  // Custom form
  const [customName, setCustomName] = useState("");
  const [customKind, setCustomKind] = useState<CompanionKind>("animal");
  const [customType, setCustomType] = useState<CompanionType | "">("");
  const [customSpecies, setCustomSpecies] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [customCapacity, setCustomCapacity] = useState(0);

  const selectedConfig = selectedSlug ? ANIMAL_CONFIGS[selectedSlug] : null;

  function submitAnimal() {
    if (!selectedSlug) return;
    startTransition(async () => {
      const result = await addAnimalCompanion({
        characterId,
        animalSlug: selectedSlug,
        customName: animalName || undefined,
        deductCost: !isDmMode && deductCost,
      });
      if (result.error) onSuccess(result.error);
      else onSuccess(`${animalName || selectedConfig?.defaultName} adicionado!`);
    });
  }

  function submitCustom() {
    if (!customName.trim()) return;
    startTransition(async () => {
      const result = await addCustomCompanion({
        characterId,
        name: customName,
        kind: customKind,
        companionType: customType || undefined,
        species: customSpecies || undefined,
        notes: customNotes || undefined,
        carryCapacity: customCapacity,
      });
      if (result.error) onSuccess(result.error);
      else onSuccess(`${customName} adicionado!`);
    });
  }

  const animalEntries = Object.entries(ANIMAL_CONFIGS);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-amber-50 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-amber-900/15 px-4 py-3">
          <h2 className="text-lg font-black">Adicionar parceiro</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-amber-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-amber-900/10 px-3 py-2">
          {(["animal", "custom"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${tab === t ? "bg-amber-800 text-amber-50" : "text-stone-600"}`}
            >
              {t === "animal" ? "Animal" : "Customizado"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === "animal" && (
            <>
              <div className="space-y-1">
                {animalEntries.map(([slug, cfg]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => { setSelectedSlug(slug); setAnimalName(cfg.defaultName); }}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${selectedSlug === slug ? "bg-amber-800 text-amber-50" : "bg-white hover:bg-amber-100"}`}
                  >
                    <span className="font-semibold">{cfg.species}</span>
                    <span className={`ml-2 text-xs ${selectedSlug === slug ? "text-amber-200" : "text-stone-400"}`}>
                      {TYPE_LABEL[cfg.companionType]}
                      {cfg.carryCapacity > 0 && ` · +${cfg.carryCapacity} espaços`}
                    </span>
                  </button>
                ))}
              </div>

              {selectedConfig && (
                <>
                  <label className="block text-sm font-semibold">
                    Nome do animal
                    <Input
                      value={animalName}
                      onChange={e => setAnimalName(e.target.value)}
                      placeholder={selectedConfig.defaultName}
                    />
                  </label>

                  {selectedConfig.alforjesBonus > 0 && (
                    <p className="text-xs text-stone-500 italic">
                      Com alforjes: +{selectedConfig.alforjesBonus} espaços de carga adicionais.
                    </p>
                  )}

                  {!isDmMode && (
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deductCost}
                        onChange={e => setDeductCost(e.target.checked)}
                        className="rounded"
                      />
                      Comprar (descontar do saldo — {formatMoney(moneyPc)} disponível)
                    </label>
                  )}
                </>
              )}
            </>
          )}

          {tab === "custom" && (
            <>
              <label className="block text-sm font-semibold">
                Nome
                <Input value={customName} onChange={e => setCustomName(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Tipo
                <select
                  value={customKind}
                  onChange={e => setCustomKind(e.target.value as CompanionKind)}
                  className="mt-1 min-h-12 w-full rounded-xl border border-amber-900/20 px-3"
                >
                  <option value="animal">Animal</option>
                  <option value="mercenary">Mercenário</option>
                  <option value="class_companion">Companheiro de Classe</option>
                  <option value="follower">Seguidor</option>
                  <option value="custom">Customizado</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Espécie / Raça (opcional)
                <Input value={customSpecies} onChange={e => setCustomSpecies(e.target.value)} placeholder="Humano, Elfo, Urso…" />
              </label>
              <label className="block text-sm font-semibold">
                Capacidade de carga (espaços)
                <Input type="number" min={0} value={customCapacity} onChange={e => setCustomCapacity(Number(e.target.value))} />
              </label>
              <label className="block text-sm font-semibold">
                Notas
                <Textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)} rows={2} />
              </label>
            </>
          )}
        </div>

        <div className="border-t border-amber-900/10 p-4">
          <Button
            fullWidth
            size="lg"
            disabled={isPending || (tab === "animal" ? !selectedSlug : !customName.trim())}
            onClick={tab === "animal" ? submitAnimal : submitCustom}
          >
            <Plus size={18} /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
