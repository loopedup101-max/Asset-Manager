import { useState } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePaidAction } from "@/hooks/usePaidAction";
import { useMe } from "@/hooks/useMe";
import { Mail, Send, RefreshCw, AlertCircle, Zap, Sparkles, CheckCircle2, Inbox, Trash2, ExternalLink, MailX, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetEmailStatus,
  useGenerateEmail,
  useSendEmail,
  useListSentEmails,
  useScanInbox,
  getScanInboxQueryKey,
  getListSentEmailsQueryKey,
  type EmailGenerateInputTone,
} from "@workspace/api-client-react";

const TONES: { id: EmailGenerateInputTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
];

function ConnectionBanner() {
  const { data: status, isLoading } = useGetEmailStatus();

  if (isLoading) return null;

  if (status?.connected) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-sm">
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
        <div className="text-emerald-900">
          <p className="font-semibold">Email is connected</p>
          <p className="text-emerald-800">
            Emails you send here will really be delivered from{" "}
            <strong>{status.fromAddress}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
      <div className="text-amber-900">
        <p className="font-semibold">No email account connected yet</p>
        <p className="text-amber-800">
          You can draft emails, but sending is turned off until an email account is
          connected to the app. Reach out and we'll switch it on for you.
        </p>
      </div>
    </div>
  );
}

export function EmailPage() {
  const [activeTab, setActiveTab] = useState("compose");
  const { data: me } = useMe();
  const isOwner = me?.plan === "owner";

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <div className="md:hidden p-4 border-b flex items-center bg-sidebar shrink-0 text-white">
        <Sidebar isMobile />
        <span className="ml-4 font-display font-bold">Email Sender</span>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 space-y-8">
        <div>
          <h1 className="text-4xl font-display font-extrabold gradient-text tracking-tight mb-2">Email Sender</h1>
          <p className="text-muted-foreground font-medium">Draft an email with AI, then send it for real — right from this app.</p>
        </div>

        <ConnectionBanner />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={
              "grid w-full mb-8 h-auto p-1.5 bg-slate-200/50 rounded-xl " +
              (isOwner ? "grid-cols-3 max-w-2xl" : "grid-cols-2 max-w-md")
            }
          >
            <TabsTrigger value="compose" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Send className="w-4 h-4 mr-2" /> Compose &amp; Send
            </TabsTrigger>
            <TabsTrigger value="sent" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Inbox className="w-4 h-4 mr-2" /> Sent
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="clean" className="py-2.5 rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <Trash2 className="w-4 h-4 mr-2" /> Clean Inbox
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="compose" className="space-y-6 animate-in fade-in-50 duration-500">
            <ComposeTab />
          </TabsContent>

          <TabsContent value="sent" className="space-y-6 animate-in fade-in-50 duration-500">
            <SentTab />
          </TabsContent>

          {isOwner && (
            <TabsContent value="clean" className="space-y-6 animate-in fade-in-50 duration-500">
              <CleanInboxTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function ComposeTab() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<EmailGenerateInputTone>("professional");

  const { data: status } = useGetEmailStatus();
  const generateMutation = useGenerateEmail();
  const sendMutation = useSendEmail();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { requirePlan } = usePaidAction();

  const canSend = status?.connected === true;

  const handleGenerate = () => {
    if (!prompt) return;
    if (!requirePlan()) return;
    generateMutation.mutate(
      { data: { prompt, tone } },
      {
        onSuccess: (draft) => {
          setSubject(draft.subject);
          setBody(draft.body);
          toast({ title: "Draft ready", description: "Review it, then send when you're happy." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Couldn't draft that", description: "Please try again." });
        },
      }
    );
  };

  const handleSend = () => {
    if (!to || !subject || !body) return;
    if (!requirePlan()) return;
    sendMutation.mutate(
      { data: { to, subject, body } },
      {
        onSuccess: () => {
          toast({ title: "Email sent!", description: `Sent to ${to} from your connected email account.` });
          setTo("");
          setSubject("");
          setBody("");
          setPrompt("");
          queryClient.invalidateQueries({ queryKey: getListSentEmailsQueryKey() });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Couldn't send",
            description: "Make sure an email account is connected and the address is valid.",
          });
        },
      }
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Write it with AI
          </CardTitle>
          <CardDescription>Describe the email and the AI fills in the subject &amp; message. Optional — you can also type your own on the right.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">What should this email say?</Label>
            <Textarea
              placeholder="e.g., Follow up with Maren about the demo and offer three times next week to meet..."
              className="resize-none h-32 focus-visible:ring-primary"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-medium transition-all border " +
                    (tone === t.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/80 border-t p-4">
          <Button
            className="w-full font-bold h-12 text-md shadow-md gap-2"
            onClick={handleGenerate}
            disabled={!prompt || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Drafting...</>
            ) : (
              <><Zap className="w-5 h-5" /> Draft with AI</>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Your email
          </CardTitle>
          <CardDescription>Review and edit, then hit send. This really sends the email.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">To</Label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Subject</Label>
            <Input
              placeholder="Subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Message</Label>
            <Textarea
              placeholder="Write your message, or draft it with AI on the left."
              className="resize-none min-h-[220px] focus-visible:ring-primary"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t bg-slate-50 flex flex-col gap-2 items-stretch">
          <Button
            className="w-full gap-2 h-12 font-bold"
            onClick={handleSend}
            disabled={!to || !subject || !body || !canSend || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-5 h-5" /> Send email</>
            )}
          </Button>
          {!canSend && (
            <p className="text-xs text-center text-amber-700">
              Sending is off until an email account is connected to the app.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function SentTab() {
  const { data: emails, isLoading } = useListSentEmails();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center p-12 border rounded-xl bg-white border-dashed">
        <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No emails sent yet.</p>
        <p className="text-slate-400 text-sm">Compose one and hit send — it'll show up here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {emails.map((email) => (
        <Card key={email.id} className="overflow-hidden hover:shadow-md transition-all">
          <div className="p-5 flex gap-4 items-start">
            <div className="p-2 rounded-lg bg-primary text-white shrink-0 shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-foreground">{email.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(email.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                To <strong>{email.toAddress}</strong>
                {email.fromAddress ? <> · from {email.fromAddress}</> : null}
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pt-1 line-clamp-4">
                {email.body}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CleanInboxTab() {
  const [scanning, setScanning] = useState(false);
  const { data, isFetching, refetch, error } = useScanInbox({
    query: { enabled: false, queryKey: getScanInboxQueryKey() },
  });

  const runScan = async () => {
    setScanning(true);
    await refetch();
    setScanning(false);
  };

  const busy = scanning || isFetching;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
        <div className="text-blue-900">
          <p className="font-semibold">How this works (honest version)</p>
          <p className="text-blue-800">
            This scans your connected inbox and shows you what's piling up, plus unsubscribe
            links for newsletters. It does <strong>not</strong> delete or move anything itself —
            the connected account only has permission to read and send. Each button opens the
            matching emails <strong>in Gmail</strong>, where you can select all and delete in a
            couple of clicks.
          </p>
        </div>
      </div>

      {!data && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-4">
            <Trash2 className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="font-semibold text-foreground">Scan your inbox for clutter</p>
              <p className="text-sm text-muted-foreground">
                Find your noisiest senders, spam, promotions, and old mail.
              </p>
            </div>
            <Button onClick={runScan} disabled={busy} className="gap-2 h-11 font-bold">
              {busy ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Scanning...</>
              ) : (
                <><Search className="w-5 h-5" /> Scan my inbox</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          Couldn't scan the inbox. Make sure an email account is connected, then try again.
        </div>
      )}

      {data && !data.connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No email account is connected yet, so there's nothing to scan.
        </div>
      )}

      {data && data.connected && (
        <div className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Scanned <strong>{data.emailAddress}</strong> · sampled {data.scannedCount} recent messages
            </p>
            <Button onClick={runScan} disabled={busy} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={"w-4 h-4 " + (busy ? "animate-spin" : "")} /> Rescan
            </Button>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-3">By category</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.categories.map((c) => (
                <a
                  key={c.key}
                  href={c.gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border rounded-xl p-4 bg-white hover:border-primary hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {c.count.toLocaleString()}{c.capped ? "+" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                  </div>
                  <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    Open in Gmail <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-1">Noisiest senders</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Sorted by how much they fill your inbox. Unsubscribe to stop future mail, or open in
              Gmail to bulk-delete what's already there.
            </p>
            {data.topSenders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No senders found in the sample.</p>
            ) : (
              <div className="grid gap-2">
                {data.topSenders.map((s) => (
                  <div
                    key={s.email}
                    className="border rounded-xl p-4 bg-white flex flex-wrap items-center gap-3 justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {s.name || s.email}
                      </p>
                      {s.name && (
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-500 shrink-0">
                      {s.count} in sample
                    </span>
                    <div className="flex gap-2 shrink-0">
                      {s.unsubscribeUrl && (
                        <a href={s.unsubscribeUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <MailX className="w-4 h-4" /> Unsubscribe
                          </Button>
                        </a>
                      )}
                      <a href={s.gmailUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1.5">
                          <ExternalLink className="w-4 h-4" /> Open in Gmail
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
