'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  MessageCircleQuestion,
  RefreshCw,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  listFaqsAction,
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  syncKnowledgeAction,
  getChatbotStatusAction,
  setChatbotEnabledAction,
  type FaqDTO,
} from '@/modules/platform/knowledge/faq/actions';

export default function ChatbotFaqPage() {
  const [faqs, setFaqs] = useState<FaqDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // Add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FaqDTO | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<FaqDTO | null>(null);

  // Chatbot on/off override (null = follow env flag) + sync spinner.
  const [chatbotOverride, setChatbotOverride] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [togglingBot, setTogglingBot] = useState(false);

  const loadStatus = () => {
    startTransition(async () => {
      const res = await getChatbotStatusAction();
      if (res.success) setChatbotOverride(res.data.override);
    });
  };

  const load = () => {
    startTransition(async () => {
      const res = await listFaqsAction();
      if (res.success) setFaqs(res.data);
      else toast.error(res.error);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    loadStatus();
  }, []);

  // Run the knowledge sync from the UI (no CLI). Full = adds new + removes
  // deleted; Quick = incremental changed-content only.
  const runSync = (mode: 'full' | 'incremental') => {
    setSyncing(true);
    startTransition(async () => {
      const res = await syncKnowledgeAction(mode);
      setSyncing(false);
      if (res.success) {
        toast.success(
          `Knowledge synced — +${res.data.created} new, ~${res.data.updated} updated${res.data.failed ? `, ${res.data.failed} failed` : ''}.`,
        );
      } else {
        toast.error(res.error);
      }
    });
  };

  // Turn the whole chatbot on/off (DB override, applies live, no redeploy).
  const setChatbot = (enabled: boolean) => {
    setTogglingBot(true);
    startTransition(async () => {
      const res = await setChatbotEnabledAction(enabled);
      setTogglingBot(false);
      if (res.success) {
        setChatbotOverride(res.data.override);
        toast.success(enabled ? 'Chatbot enabled.' : 'Chatbot disabled.');
      } else {
        toast.error(res.error);
      }
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ question: '', answer: '' });
    setDialogOpen(true);
  };
  const openEdit = (f: FaqDTO) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Both question and answer are required.');
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await updateFaqAction(editing.id, { question: form.question, answer: form.answer })
        : await createFaqAction({ question: form.question, answer: form.answer });
      if (res.success) {
        toast.success(editing ? 'FAQ updated — chatbot re-indexed.' : 'FAQ added — chatbot re-indexed.');
        setDialogOpen(false);
        load();
      } else {
        toast.error(res.error);
      }
    });
  };

  const toggleActive = (f: FaqDTO) => {
    startTransition(async () => {
      const res = await updateFaqAction(f.id, { isActive: !f.isActive });
      if (res.success) {
        toast.success(f.isActive ? 'FAQ hidden from the chatbot.' : 'FAQ enabled for the chatbot.');
        load();
      } else {
        toast.error(res.error);
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteFaqAction(deleteTarget.id);
      if (res.success) {
        toast.success('FAQ deleted — chatbot re-indexed.');
        setDeleteTarget(null);
        load();
      } else {
        toast.error(res.error);
      }
    });
  };

  const activeCount = faqs.filter((f) => f.isActive).length;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-primary mb-1 flex items-center gap-2 text-xs font-jost-bold tracking-widest uppercase">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> Chatbot
          </div>
          <h1 className="text-2xl font-jost-bold tracking-tight md:text-3xl">Chatbot FAQ</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Add hand-written question &amp; answer pairs that the chatbot can use to
            answer visitors. Saving auto-updates the chatbot&apos;s knowledge.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Sync buttons — run the knowledge indexer from the UI (no CLI). */}
          <Button
            variant="outline"
            onClick={() => runSync('incremental')}
            disabled={syncing || pending}
            className="gap-2"
            title="Index changed content only"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Quick sync
          </Button>
          <Button
            variant="outline"
            onClick={() => runSync('full')}
            disabled={syncing || pending}
            className="gap-2"
            title="Full re-index: add new + remove deleted"
          >
            <RefreshCw className="h-4 w-4" />
            Full re-index
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>
      </div>

      {/* Chatbot on/off — DB-backed master switch (applies live, no redeploy). */}
      <div className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${
              chatbotOverride === false
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {chatbotOverride === false ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </span>
          <div>
            <p className="font-jost-medium text-sm">
              Chatbot is{' '}
              <span className={chatbotOverride === false ? 'text-destructive' : 'text-primary'}>
                {chatbotOverride === false ? 'OFF' : 'ON'}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">
              {chatbotOverride === null
                ? 'Following the site default. Toggle to override live.'
                : 'Admin override active — applies immediately, no redeploy.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={chatbotOverride === false ? 'outline' : 'default'}
            size="sm"
            onClick={() => setChatbot(true)}
            disabled={togglingBot || pending}
            className="gap-2"
          >
            <Power className="h-3.5 w-3.5" /> Enable
          </Button>
          <Button
            variant={chatbotOverride === false ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setChatbot(false)}
            disabled={togglingBot || pending}
            className="gap-2"
          >
            <PowerOff className="h-3.5 w-3.5" /> Disable
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="bg-card rounded-xl border px-4 py-3 shadow-sm">
          <div className="text-muted-foreground text-xs font-jost-medium uppercase">Total FAQs</div>
          <div className="mt-1 text-2xl font-jost-bold">{faqs.length}</div>
        </div>
        <div className="bg-card rounded-xl border px-4 py-3 shadow-sm">
          <div className="text-muted-foreground text-xs font-jost-medium uppercase">Active</div>
          <div className="text-primary mt-1 text-2xl font-jost-bold">{activeCount}</div>
        </div>
      </div>

      {/* List */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-muted-foreground p-12 text-center text-sm">
            No FAQs yet. Click <b>Add FAQ</b> to create the first one.
          </div>
        ) : (
          <ul className="divide-y">
            {faqs.map((f) => (
              <li key={f.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-jost-medium">{f.question}</p>
                    <Badge
                      variant={f.isActive ? 'default' : 'secondary'}
                      className={f.isActive ? 'bg-primary/15 text-primary' : ''}
                    >
                      {f.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-3 text-sm whitespace-pre-line">
                    {f.answer}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleActive(f)}
                    title={f.isActive ? 'Hide from chatbot' : 'Enable for chatbot'}
                  >
                    {f.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(f)}
                    title="Edit"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteTarget(f)}
                    title="Delete"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="faq-q">Question</Label>
              <Input
                id="faq-q"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What oils does Jivo sell?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-a">Answer</Label>
              <Textarea
                id="faq-a"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Write the answer the chatbot should give…"
                rows={5}
              />
              <p className="text-muted-foreground text-xs">
                Keep it factual and self-contained — the chatbot uses this text to
                ground its reply.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending} className="min-w-24">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete FAQ?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Delete <b>{deleteTarget?.question}</b>? The chatbot will no longer use it.
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
