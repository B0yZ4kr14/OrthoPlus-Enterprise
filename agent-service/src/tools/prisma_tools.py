"""
Tools para trabalhar com Prisma ORM
"""
from src.config import BACKEND_PATH


class PrismaSchemaTool:
    """Lê e analisa o schema Prisma"""
    
    name = "prisma_schema"
    description = "Lê o schema Prisma do projeto"
    
    @staticmethod
    def run(model_name: str = None) -> str:
        """
        Lê o schema Prisma
        
        Args:
            model_name: Nome do model específico (opcional)
        
        Returns:
            Schema ou model específico
        """
        try:
            schema_path = BACKEND_PATH / "prisma" / "schema.prisma"
            
            if not schema_path.exists():
                return "❌ Schema não encontrado em prisma/schema.prisma"
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if model_name:
                # Extrair model específico
                import re
                pattern = rf"model {model_name} {{[^}}]+}}"
                match = re.search(pattern, content, re.DOTALL)
                if match:
                    return f"📊 Model {model_name}:\n```prisma\n{match.group()}\n```"
                else:
                    return f"❌ Model '{model_name}' não encontrado"
            
            return f"📊 Schema Prisma ({len(content)} caracteres):\n```prisma\n{content[:2000]}...\n```"
            
        except Exception as e:
            return f"❌ Erro ao ler schema: {str(e)}"
    
    @staticmethod
    def list_models() -> str:
        """Lista todos os models do schema"""
        try:
            schema_path = BACKEND_PATH / "prisma" / "schema.prisma"
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            import re
            models = re.findall(r'model (\w+)', content)
            
            return f"📊 Models encontrados:\n" + "\n".join([f"  • {m}" for m in models])
            
        except Exception as e:
            return f"❌ Erro: {str(e)}"


class PrismaMigrateTool:
    """Gera migrations Prisma"""
    
    name = "prisma_migrate"
    description = "Gera migrations do Prisma"
    
    @staticmethod
    def run(migration_name: str = "migration") -> str:
        """
        Gera migration
        
        Args:
            migration_name: Nome da migration
        
        Returns:
            Resultado da operação
        """
        try:
            import subprocess
            
            cmd = [
                "npx", "prisma", "migrate", "dev",
                "--name", migration_name,
                "--schema", str(BACKEND_PATH / "prisma" / "schema.prisma")
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=BACKEND_PATH
            )
            
            if result.returncode == 0:
                return f"✅ Migration gerada: {migration_name}\n```\n{result.stdout}\n```"
            else:
                return f"❌ Erro na migration:\n```\n{result.stderr}\n```"
                
        except Exception as e:
            return f"❌ Erro: {str(e)}"
