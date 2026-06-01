import {
  BookText,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  FolderOpen,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Textarea } from "@orthoplus/core-ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useWiki } from "@/hooks/api/useWiki";

const CATEGORIES = [
  { value: "general", label: "Geral" },
  { value: "processes", label: "Processos" },
  { value: "apis", label: "APIs" },
  { value: "troubleshooting", label: "Troubleshooting" },
  { value: "guides", label: "Guias" },
];

export default function WikiPage() {
  const { clinicId, user } = useAuth();
  const {
    pages,
    filteredPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    dialogOpen,
    setDialogOpen,
    editingPage,
    formData,
    setFormData,
    handleSave,
    handleDelete,
    startEditing,
    startCreating,
    isSaving,
    isDeleting,
  } = useWiki(clinicId ?? undefined, user?.id ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wiki Interna"
        description="Documentação e base de conhecimento da clínica"
        icon={BookText}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" onClick={startCreating}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Página
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? "Editar" : "Nova"} Página Wiki
                </DialogTitle>
                <DialogDescription>
                  Crie ou edite páginas de documentação usando Markdown
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    id="wiki-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Como realizar um backup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_published: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Publicado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Conteúdo (Markdown)
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="# Título\n\nConteúdo da página..."
                    rows={15}
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="button"
                    onClick={handleSave}
                    disabled={isSaving || isDeleting}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      ></PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Páginas"
          value={pages.length}
          icon={BookText}
          variant="primary"
        />
        <StatsCard
          title="Publicadas"
          value={pages.filter((p) => p.is_published).length}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Categorias"
          value={CATEGORIES.length}
          icon={FolderOpen}
          variant="default"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="wiki-search"
            placeholder="Buscar páginas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card variant="elevated" className="glass-card">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Carregando páginas...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <Card key={page.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">
                        {page.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="mr-2">
                          {
                            CATEGORIES.find((c) => c.value === page.category)
                              ?.label
                          }
                        </Badge>
                        {page.is_published ? (
                          <Badge variant="default">Publicado</Badge>
                        ) : (
                          <Badge variant="secondary">Rascunho</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {page.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Atualizado:{" "}
                      {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                    <span>• v{page.version}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => startEditing(page)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPages.length === 0 && (
            <Card variant="elevated" className="glass-card">
              <CardContent className="text-center py-12">
                <BookText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">Nenhuma página encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie sua primeira página de documentação
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
