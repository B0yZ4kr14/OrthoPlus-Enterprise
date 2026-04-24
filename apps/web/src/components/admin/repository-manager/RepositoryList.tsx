// cspell:disable
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Github, ExternalLink, Play, RefreshCw, Trash2 } from "lucide-react";
import type { Repository } from "./types";

interface RepositoryListProps {
  repos: Repository[];
  isLoading: boolean;
  onAddRepo: () => void;
  onExecuteWorkflow: (repoName: string, workflowId: string, branch: string) => void;
}

export function RepositoryList({
  repos,
  isLoading,
  onAddRepo,
  onExecuteWorkflow,
}: RepositoryListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Repositórios Conectados</CardTitle>
            <CardDescription>Gerencie os repositórios GitHub vinculados ao sistema</CardDescription>
          </div>
          <Button onClick={onAddRepo}>+ Adicionar Repositório</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando repositórios...</p>
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum repositório conectado</p>
        ) : (
          <div className="space-y-3">
            {repos.map((repo) => (
              <Card key={repo.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{repo.full_name}</p>
                        <Badge variant={repo.private ? "secondary" : "outline"}>
                          {repo.private ? "Privado" : "Público"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {repo.description || "Sem descrição"}
                      </p>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Ver no GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onExecuteWorkflow(repo.name, "deploy", "main")}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
