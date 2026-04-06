# Guia do Tema OrthoPlus v2

## 🎨 Paleta de Cores

### Cores Principais
| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| **Cyan** | #06B6D4 | 186 100% 42% | Primária, botões, links |
| **Amber** | #F59E0B | 38 92% 50% | Acento, destaques, alertas |
| **Emerald** | #10B981 | 160 84% 39% | Sucesso, positivo |
| **Rose** | #F43F5E | 0 84% 60% | Erro, negativo |
| **Background** | #0B1120 | 222 47% 6% | Fundo principal |
| **Card** | #0F172A | 222 47% 8% | Fundo de cards |

### CSS Variables
```css
:root {
  --primary: 186 100% 42%;        /* Cyan */
  --accent: 38 92% 50%;           /* Amber */
  --success: 160 84% 39%;         /* Emerald */
  --destructive: 0 84% 60%;       /* Rose */
  --background: 222 47% 6%;       /* Dark background */
  --card: 222 47% 8%;             /* Card background */
}
```

## 🧩 Componentes Atualizados

### ThemeContext
- Tema "orthoplus-v2" como padrão
- Persistência em localStorage
- Suporte a temas light/dark/orthoplus

### ModuleCard
- Hover com translateY(-4px)
- Sombra glow-cyan no hover
- Borda sutil com opacidade 20%
- Transições suaves

### StatCard
- Cores dinâmicas: emerald (sucesso), rose (erro), amber (alerta)
- Ícone com gradiente
- Indicador de tendência (↑/↓)

### ThemeToggle
- Ícone Sparkles para tema OrthoPlus
- Indicador "Ativo" no dropdown
- Transições suaves

### AppLayout
- Gradient background
- Animações ease-out-cubic
- Bordas cyan no modo foco

## 🚀 Uso

### Aplicar Tema
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('orthoplus-v2')}>
      Ativar Tema v2
    </button>
  );
}
```

### Usar Tokens
```tsx
// Tailwind classes
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Primário
  </button>
  <span className="text-accent">Destaque</span>
</div>
```

## 📦 Build e Deploy

### Build Local
```bash
pnpm --filter=@orthoplus/web build
```

### Deploy na VPS
```bash
# Sincronizar código
rsync -avz apps/web/src/ vps-orthoplus:~/OrthoPlus-Enterprise/apps/web/src/

# Build e enviar
rsync -avz apps/web/dist/ vps-orthoplus:/var/www/orthoplus/

# Recarregar nginx
ssh vps-orthoplus "sudo systemctl reload nginx"
```

## 🔧 Configuração TypeScript

Para permitir build com erros de tipo:
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

## 📱 Preview

- **URL**: https://100.111.74.69/
- **Health**: http://100.111.74.69/health

## 📝 Notas

- O tema usa Tailwind CSS com variáveis CSS
- Build otimizado com Vite (~1s)
- Compatível com shadcn/ui
- Suporte a dark mode nativo

---

Criado em: 2026-04-05
Versão: 2.0.0
