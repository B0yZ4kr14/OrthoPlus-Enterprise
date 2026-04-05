"""
Tools para ler e escrever arquivos no codebase OrthoPlus
"""
import os
from pathlib import Path
from typing import Optional

from src.config import BACKEND_PATH, FRONTEND_PATH


class ReadFileTool:
    """Lê um arquivo do projeto"""
    
    name = "read_file"
    description = "Lê o conteúdo de um arquivo no projeto"
    
    @staticmethod
    def run(file_path: str, max_lines: int = 100) -> str:
        """
        Lê um arquivo do projeto
        
        Args:
            file_path: Caminho relativo ao backend (ex: "src/modules/pacientes/pacientes.controller.ts")
            max_lines: Número máximo de linhas para ler
        
        Returns:
            Conteúdo do arquivo
        """
        try:
            full_path = BACKEND_PATH / file_path
            
            if not full_path.exists():
                return f"❌ Arquivo não encontrado: {file_path}"
            
            with open(full_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()[:max_lines]
                content = ''.join(lines)
                
                if len(lines) == max_lines:
                    content += f"\n\n... ({max_lines} linhas mostradas)"
                
                return f"📄 {file_path}:\n```typescript\n{content}\n```"
                
        except Exception as e:
            return f"❌ Erro ao ler arquivo: {str(e)}"


class WriteFileTool:
    """Escreve um arquivo no projeto"""
    
    name = "write_file"
    description = "Escreve ou sobrescreve um arquivo no projeto"
    
    @staticmethod
    def run(file_path: str, content: str, overwrite: bool = False) -> str:
        """
        Escreve um arquivo no projeto
        
        Args:
            file_path: Caminho relativo ao backend
            content: Conteúdo a escrever
            overwrite: Se deve sobrescrever arquivo existente
        
        Returns:
            Resultado da operação
        """
        try:
            full_path = BACKEND_PATH / file_path
            
            # Criar diretórios se necessário
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Verificar se arquivo já existe
            if full_path.exists() and not overwrite:
                return f"⚠️  Arquivo já existe: {file_path}. Use overwrite=True para sobrescrever."
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            action = "Sobrescrito" if overwrite else "Criado"
            return f"✅ {action}: {file_path} ({len(content)} caracteres)"
            
        except Exception as e:
            return f"❌ Erro ao escrever arquivo: {str(e)}"


class SearchCodeTool:
    """Busca código no projeto"""
    
    name = "search_code"
    description = "Busca por padrões no código do projeto"
    
    @staticmethod
    def run(pattern: str, file_extension: str = ".ts", max_results: int = 10) -> str:
        """
        Busca por padrão no código
        
        Args:
            pattern: Texto ou regex para buscar
            file_extension: Extensão de arquivo (ex: ".ts", ".tsx")
            max_results: Número máximo de resultados
        
        Returns:
            Resultados da busca
        """
        try:
            import subprocess
            
            # Usar ripgrep se disponível, senão grep
            cmd = [
                "rg", "-n", "-t", file_extension.replace(".", ""),
                "--max-count", str(max_results),
                pattern, str(BACKEND_PATH)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return f"🔍 Resultados para '{pattern}':\n```\n{result.stdout}\n```"
            else:
                return f"🔍 Nenhum resultado encontrado para '{pattern}'"
                
        except Exception as e:
            return f"❌ Erro na busca: {str(e)}"


class ListDirTool:
    """Lista diretórios do projeto"""
    
    name = "list_dir"
    description = "Lista o conteúdo de um diretório"
    
    @staticmethod
    def run(dir_path: str = "src/modules", max_items: int = 20) -> str:
        """
        Lista diretório
        
        Args:
            dir_path: Caminho relativo ao backend
            max_items: Número máximo de itens
        
        Returns:
            Lista de arquivos/diretórios
        """
        try:
            full_path = BACKEND_PATH / dir_path
            
            if not full_path.exists():
                return f"❌ Diretório não encontrado: {dir_path}"
            
            items = list(full_path.iterdir())[:max_items]
            
            result = [f"📁 {dir_path}/"]
            for item in items:
                icon = "📁" if item.is_dir() else "📄"
                result.append(f"  {icon} {item.name}")
            
            return "\n".join(result)
            
        except Exception as e:
            return f"❌ Erro ao listar diretório: {str(e)}"
