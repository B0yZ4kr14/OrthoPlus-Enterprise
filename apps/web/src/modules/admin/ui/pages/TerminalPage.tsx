import { useState, useRef, useEffect } from "react";
import { Terminal, Send, Trash2, History, Activity, Clock } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Input } from "@orthoplus/core-ui/input";
import { Button } from "@orthoplus/core-ui/button";
import { ScrollArea } from "@orthoplus/core-ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useTerminalPage } from "@/hooks/api/useTerminalPage";

export default function TerminalPage() {
  const { clinicId } = useAuth();
  const [command, setCommand] = useState("");
  const { history, isExecuting, executeCommand, clearHistory } = useTerminalPage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleExecute = () => {
    if (!command.trim() || !clinicId) return;
    executeCommand(command);
    setCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isExecuting) {
      handleExecute();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terminal Shell"
        description="Execute comandos shell seguros com whitelist de comandos permitidos"
        icon={Terminal}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Comandos Executados"
          value={history.length}
          icon={History}
          variant="primary"
        />
        <StatsCard
          title="Status"
          value="Conectado"
          icon={Activity}
          variant="success"
        />
        <StatsCard
          title="Sessão Ativa"
          value="Sim"
          icon={Clock}
          variant="default"
        />
      </div>

      <Card variant="elevated" className="glass-card">
        <CardHeader>
          <CardTitle>Console Interativo</CardTitle>
          <CardDescription>
            Comandos permitidos: ls, pwd, whoami, date, uptime, df, free, ps,
            git status, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminal Output */}
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
            <ScrollArea className="h-[400px]" ref={scrollRef}>
              <div className="space-y-3">
                <div className="text-success">
                  OrthoPlus Enterprise Terminal Shell v1.0 - DEMO MODE
                </div>
                <div className="text-muted-foreground">
                  Digite 'help' para ver comandos disponíveis
                </div>
                <div className="border-t border-border my-2" />

                {history.map((entry, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-info">$</span>
                      <span className="text-foreground">{entry.command}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={
                        entry.exitCode === 0 ? "text-success" : "text-destructive"
                      }
                    >
                      <pre className="whitespace-pre-wrap break-words">
                        {entry.output}
                      </pre>
                    </div>
                    {entry.exitCode !== 0 && (
                      <div className="text-warning text-xs">
                        Exit code: {entry.exitCode}
                      </div>
                    )}
                  </div>
                ))}

                {isExecuting && (
                  <div className="flex items-center gap-2 text-warning">
                    <span className="animate-pulse">Executando...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Command Input */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-2">
              <span className="text-info font-mono">$</span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite um comando..."
                className="border-0 bg-transparent focus-visible:ring-0 font-mono"
                disabled={isExecuting}
              />
            </div>
            <Button
              onClick={handleExecute}
              disabled={!command.trim() || isExecuting}
            >
              <Send className="h-4 w-4 mr-2" />
              Executar
            </Button>
            <Button
              variant="outline"
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          {/* Command Suggestions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              "ls -la",
              "pwd",
              "date",
              "uptime",
              "git status",
              "git log --oneline",
            ].map((cmd) => (
              <Button
                key={cmd}
                variant="secondary"
                size="sm"
                onClick={() => setCommand(cmd)}
                className="font-mono text-xs justify-start"
              >
                {cmd}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Comandos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {history.length === 0 ? (
              <p>Nenhum comando executado ainda</p>
            ) : (
              <p>{history.length} comando(s) executado(s) nesta sessão</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
