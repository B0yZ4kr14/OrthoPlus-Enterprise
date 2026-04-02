import { BookOpen, ExternalLink } from 'lucide-react';

interface DocLink {
  name: string;
  url: string;
}

interface DocsTabProps {
  engineName: string;
  docs: DocLink[];
  installCommand?: string;
}

export function DocsTab({
  engineName,
  docs,
  installCommand,
}: DocsTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Documentação oficial e recursos para {engineName}
      </p>

      {/* Links de Documentação */}
      <div className="space-y-3">
        {docs.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-card/50 border border-border hover:border-primary/50 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="group-hover:text-primary transition-colors">{doc.name}</span>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>

      {/* Dicas de Instalação */}
      {installCommand && (
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h4 className="text-warning font-semibold mb-3">💡 Dicas de Instalação</h4>
          <code className="block bg-black/50 rounded-lg px-4 py-3 text-primary text-sm font-mono whitespace-pre-wrap">
            {installCommand}
          </code>
        </div>
      )}
    </div>
  );
}

export default DocsTab
