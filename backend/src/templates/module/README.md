# Template de Módulo

## Estrutura

```
[module-name]/
├── api/
│   ├── [Module]Controller.ts
│   └── routes.ts
├── application/
│   ├── commands/
│   ├── queries/
│   └── services/
├── domain/
│   ├── entities/
│   └── repositories/
└── infrastructure/
    └── repositories/
```

## Convenções

1. Use PascalCase para classes
2. Use camelCase para funções e variáveis
3. Sufixo Controller para controllers
4. Sufixo Service para serviços
5. Prefixo I para interfaces
