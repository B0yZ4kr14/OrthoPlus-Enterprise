import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";

interface DocsTabProps {
  selectedEngine: string;
}

const ENGINE_DOCS: Record<string, { subtitle: string; links: { label: string; url: string }[]; installTips: { arch: string; ubuntu: string } }> = {
  PostgreSQL: {
    subtitle: 'Documentação oficial e recursos para PostgreSQL',
    links: [
      { label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
      { label: 'Tutorial Iniciante', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
      { label: 'PostgreSQL Wiki', url: 'https://wiki.postgresql.org/' },
    ],
    installTips: { arch: 'sudo pacman -S postgresql', ubuntu: 'sudo apt install postgresql' },
  },
  Firebird: {
    subtitle: 'Documentação oficial e recursos para Firebird',
    links: [
      { label: 'Firebird Docs', url: 'https://firebirdsql.org/en/documentation/' },
      { label: 'Firebird FAQ',  url: 'https://firebirdsql.org/en/faq/' },
    ],
    installTips: { arch: 'yay -S firebird', ubuntu: 'Download: firebirdsql.org/downloads' },
  },
  MariaDB: {
    subtitle: 'Documentação oficial e recursos para MariaDB',
    links: [
      { label: 'MariaDB Docs', url: 'https://mariadb.com/kb/en/' },
      { label: 'MariaDB Blog', url: 'https://mariadb.com/kb/en/mariadb-blog/' },
    ],
    installTips: { arch: 'sudo pacman -S mariadb', ubuntu: 'sudo apt install mariadb-server' },
  },
  SQLite: {
    subtitle: 'Documentação oficial e recursos para SQLite',
    links: [
      { label: 'SQLite Docs',     url: 'https://www.sqlite.org/docs.html' },
      { label: 'SQLite Tutorial', url: 'https://www.sqlitetutorial.net/' },
    ],
    installTips: { arch: 'sudo pacman -S sqlite', ubuntu: 'sudo apt install sqlite3' },
  },
};

export function DocsTab({ selectedEngine }: DocsTabProps) {
  const data = ENGINE_DOCS[selectedEngine] || ENGINE_DOCS.PostgreSQL;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">{selectedEngine} Docs</h3>
        <p className="text-sm text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.links.map((link, idx) => (
          <a 
            key={idx} 
            href={link.url} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{link.label}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </a>
        ))}
      </div>

      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Dicas de Instalação (Linux)</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Arch / CachyOS</p>
              <div className="p-3 rounded-lg bg-black font-mono text-sm text-green-400 border border-gray-800">
                {data.installTips.arch}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ubuntu / Debian</p>
              <div className="p-3 rounded-lg bg-black font-mono text-sm text-green-400 border border-gray-800">
                {data.installTips.ubuntu}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
