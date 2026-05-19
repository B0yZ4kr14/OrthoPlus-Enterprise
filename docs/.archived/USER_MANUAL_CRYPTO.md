# 📘 Manual do Usuário - Pagamentos em Criptomoedas

## 🎯 Visão Geral

O módulo **Pagamentos em Criptomoedas** do OrthoPlus Enterprise permite que sua clínica aceite pagamentos em **Bitcoin (BTC)**, **Ethereum (ETH)**, **Tether (USDT)** e outras criptomoedas de forma segura e descentralizada.

**Principais benefícios:**
- ✅ Pagamentos globais sem intermediários
- ✅ Taxas mais baixas que cartões de crédito
- ✅ Liquidação em minutos (vs. 30 dias de maquininhas)
- ✅ Proteção contra fraudes (transações irreversíveis)
- ✅ **Você mantém controle total dos fundos** (non-custodial)

---

## 🚀 Como Começar

### Passo 1: Ativar o Módulo

1. Acesse **Configurações → Módulos**
2. Localize **"Pagamentos em Criptomoedas"** na categoria **Gestão Financeira**
3. Clique em **Ativar**
4. Aguarde a confirmação

> 📝 **Nota**: Este módulo depende do módulo **Financeiro** estar ativo.

---

## 🔧 Configuração

### Opção 1: Exchange (Mais Fácil) 🌐

**Recomendado para:** Clínicas que querem conversão automática para BRL.

#### Passo a Passo:

1. **Acesse as Configurações**
   - Vá em **Configurações → Pagamentos Crypto → Exchanges**
   - Clique em **"Adicionar Exchange"**

2. **Escolha sua Exchange**
   - **Binance** (Brasil e Global)
   - **Coinbase** (Global)
   - **Mercado Bitcoin** (Somente Brasil)
   - **Kraken** (Global)

3. **Obtenha as API Keys**

   **Para Binance:**
   1. Faça login em [binance.com](https://binance.com)
   2. Acesse **Perfil → API Management**
   3. Crie uma nova API Key:
      - ✅ Habilitar: **Leitura** e **Depósitos**
      - ❌ **NÃO** habilitar: Saques
   4. Anote a **API Key** e **Secret Key**
   5. Configure IP Whitelist (opcional, mais seguro)

   **Para Coinbase:**
   1. Acesse [coinbase.com/settings/api](https://coinbase.com/settings/api)
   2. Crie uma nova API Key com permissões:
      - `wallet:accounts:read`
      - `wallet:addresses:read`
      - `wallet:buys:read`
   3. Copie a **API Key** e **API Secret**

   **Para Mercado Bitcoin:**
   1. Acesse [mercadobitcoin.com.br](https://mercadobitcoin.com.br)
   2. Vá em **Configurações → API**
   3. Gere uma nova chave com permissões de leitura

4. **Configure no OrthoPlus Enterprise**
   - Cole a **API Key** e **API Secret**
   - Clique em **"Testar Conexão"**
   - Selecione as moedas aceitas (BTC, ETH, USDT, BNB, USDC)
   - Ative **"Conversão Automática para BRL"** (opcional)
   - Clique em **"Salvar"**

5. **Pronto!** ✅
   - Pagamentos recebidos serão creditados na sua exchange
   - Se ativou conversão automática, serão convertidos para BRL automaticamente

#### ⚠️ Importante:

> **A exchange tem custódia dos seus fundos.** Isto significa que a exchange controla as chaves privadas. Para maior segurança, considere a **Opção 2: Wallet Offline**.

---

### Opção 2: Wallet Offline (Mais Seguro) 🔐

**Recomendado para:** Clínicas que querem controle total e segurança máxima.

#### Requisitos:
- Hardware Wallet (Trezor, Coldcard, KRUX) ou Software Wallet (Electrum, Sparrow)

#### Passo a Passo:

1. **Acesse as Configurações**
   - Vá em **Configurações → Pagamentos Crypto → Wallets Offline**
   - Clique em **"Nova Wallet Offline"**

2. **Prepare sua Hardware Wallet**
   
   **Para Trezor:**
   1. Conecte seu Trezor ao computador
   2. Abra o **Trezor Suite**
   3. Vá em **Conta Bitcoin → Detalhes**
   4. Copie a **xPub (Extended Public Key)**
   5. Exemplo: `xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKp...`

   **Para Coldcard:**
   1. No menu do Coldcard, vá em **Advanced → Export Wallet → Generic JSON**
   2. Salve no cartão microSD
   3. Abra o arquivo `.json` no computador
   4. Copie o campo `"xpub"` ou `"zpub"` (SegWit Native)

   **Para KRUX (DIY):**
   1. Vá em **Tools → Export**
   2. Selecione **Wallet Export → Electrum**
   3. Copie a xPub exibida na tela

3. **Configure no OrthoPlus Enterprise**
   - **Nome da Wallet**: Ex: "Trezor Principal", "Coldcard Implantes"
   - **Tipo de Hardware**: Selecione o fabricante
   - **Extended Public Key (xPub)**: Cole a xPub copiada
   
   ⚠️ **NUNCA** cole a **seed (24 palavras)** ou **chave privada** aqui!
   
   - **Derivation Path**: Escolha o padrão
     - **BIP84 (bc1...)** ✅ Recomendado - SegWit Native (taxas mais baixas)
     - **BIP49 (3...)** - SegWit Wrapped (compatibilidade)
     - **BIP44 (1...)** - Legacy (taxas mais altas)

4. **Teste a Configuração**
   - Clique em **"Testar xPub"**
   - O sistema irá gerar o **endereço #0**
   - Exemplo: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
   - **Confirme** que este endereço bate com o da sua wallet (índice 0)
   
   ✅ Se bater, clique em **"Salvar Configuração"**
   
   ❌ Se não bater, verifique:
   - xPub está correta?
   - Derivation path está correto? (BIP84, BIP49, BIP44)

5. **Pronto!** 🎉
   - O OrthoPlus Enterprise irá gerar um **novo endereço único** para cada pagamento
   - Você **mantém controle total** das chaves privadas
   - Os fundos vão **direto para sua wallet** (sem intermediários)

#### 🔐 Segurança:

> ✅ **O OrthoPlus Enterprise NUNCA tem acesso às suas chaves privadas.**
> 
> A xPub permite apenas **gerar endereços de recebimento** (somente leitura). Para **gastar** os fundos, você precisará da **chave privada** (que fica na sua Hardware Wallet).

---

## 💰 Como Receber Pagamentos

### No PDV (Ponto de Venda)

1. Acesse **PDV**
2. Adicione produtos/serviços à venda
3. Clique em **"Finalizar Venda"**
4. Na tela de pagamento, selecione **"Crypto"**
5. Escolha a moeda (BTC, ETH, USDT, BNB)
6. Clique em **"Gerar QR Code"**
7. Exiba o QR Code para o paciente
8. Aguarde a confirmação na blockchain (1-6 confirmações)
9. ✅ Pagamento confirmado automaticamente!

### Em Contas a Receber

1. Acesse **Financeiro → Contas a Receber**
2. Localize a conta a receber
3. Clique em **"Registrar Pagamento"**
4. Selecione **"Crypto"** como forma de pagamento
5. Escolha a moeda
6. Gere o QR Code
7. Envie para o paciente (via WhatsApp, email, etc)
8. Aguarde confirmação

### No Orçamento Digital

1. No orçamento aprovado, clique em **"Receber Pagamento"**
2. Selecione **"Crypto"**
3. Gere QR Code
4. Paciente escaneia e paga
5. Aguarde confirmação

---

## 🔔 Notificações

Configure notificações para ser avisado quando um pagamento for confirmado:

1. Acesse **Configurações → Notificações**
2. Ative **"Pagamentos Crypto Confirmados"**
3. Escolha os canais:
   - ✅ Notificação no sistema
   - ✅ E-mail
   - ✅ WhatsApp (se integrado)

---

## 📊 Relatórios e Analytics

### Dashboard de Crypto Pagamentos

Acesse **Financeiro → Crypto Pagamentos** para ver:

- **Total recebido** (em BRL e em crypto)
- **Transações recentes**
- **Conversões BRL → Crypto**
- **Status de confirmações**
- **Histórico de taxas de câmbio**

### Exportar Relatórios

1. No dashboard, clique em **"Exportar"**
2. Escolha o formato (PDF, Excel, CSV)
3. Selecione o período
4. Download automático

---

## ❓ Perguntas Frequentes (FAQ)

### 1. Qual a diferença entre Exchange e Wallet Offline?

| Critério | Exchange | Wallet Offline |
|----------|----------|----------------|
| **Custódia** | Exchange controla fundos | Você controla fundos |
| **Segurança** | Depende da exchange | Máxima (suas chaves) |
| **Conversão BRL** | ✅ Automática | ❌ Manual |
| **Configuração** | ⭐⭐⭐ Fácil | ⭐⭐ Intermediário |
| **Taxas** | Exchange cobra | Apenas taxas blockchain |

### 2. Quanto tempo leva para confirmar um pagamento?

- **Bitcoin (BTC)**: 10-60 minutos (1-6 confirmações)
- **Ethereum (ETH)**: 1-5 minutos
- **Tether (USDT)**: 1-5 minutos (ERC20) ou instantâneo (TRC20)

### 3. Posso aceitar Lightning Network?

**Sim!** Se você usar **BTCPay Server** (auto-hospedado), pode aceitar pagamentos via Lightning Network (confirmação instantânea).

### 4. As chaves privadas ficam no OrthoPlus Enterprise?

**NÃO!** O OrthoPlus Enterprise **NUNCA** tem acesso às suas chaves privadas.

- **Exchanges**: As chaves ficam na exchange (custódia)
- **Wallets Offline**: As chaves ficam na **sua** Hardware Wallet (você controla)

### 5. E se o paciente pagar o valor errado?

Se pagar **menos** que o esperado:
- Pagamento ficará como **"Parcial"**
- Você pode gerar um novo QR Code para a diferença

Se pagar **mais**:
- Pagamento será confirmado normalmente
- A diferença ficará registrada no sistema
- Você pode devolver manualmente (blockchain não permite estorno automático)

### 6. Posso ter múltiplas wallets?

**Sim!** Você pode configurar:
- Múltiplas exchanges (ex: Binance + Coinbase)
- Múltiplas wallets offline (ex: Trezor Principal + Coldcard Backup)
- Mix de exchanges e wallets offline

Na hora de gerar o pagamento, você escolhe qual usar.

### 7. Como funciona a conversão para BRL?

**Exchanges (automático):**
- Pagamento recebido → Exchange converte automaticamente
- Taxa de câmbio da exchange no momento da conversão

**Wallets Offline (manual):**
- Pagamento recebido → Fica em crypto na sua wallet
- Você decide quando vender (via exchange ou P2P)

### 8. Há limite de valor?

**Não!** Criptomoedas não têm limite de valor por transação.

Mas atenção:
- Exchanges podem ter limites diários de saque
- Para valores muito altos (> R$ 100.000), considere usar wallet offline

### 9. E a LGPD? Os dados são seguros?

✅ Sim! O módulo é **100% compatível com LGPD**:

- API Keys são **criptografadas** em repouso (AES-256)
- xPub é **criptografada** em repouso
- Logs de auditoria registram todas as operações
- Dados podem ser **deletados** a pedido do paciente
- Transações blockchain são **públicas** (endereços), mas não expõem dados pessoais

### 10. Preciso declarar no Imposto de Renda?

**Sim!** Receitas em criptomoedas devem ser declaradas.

**Recomendações:**
- Mantenha registro de todas as transações (o OrthoPlus Enterprise faz isso automaticamente)
- Consulte um contador especializado em criptomoedas
- Use os relatórios do OrthoPlus Enterprise para facilitar a declaração

---

## 🆘 Suporte

### Problemas Comuns

**1. "API Key inválida"**
- Verifique se copiou corretamente (sem espaços)
- Confirme que a API Key está ativa na exchange
- Verifique as permissões (deve ter "Leitura" e "Depósitos")

**2. "xPub inválida"**
- Verifique o formato (deve começar com `xpub`, `ypub` ou `zpub`)
- Confirme o derivation path correto
- Teste em outra wallet (ex: Electrum) para validar

**3. "Pagamento não foi confirmado"**
- Verifique na blockchain explorer (ex: blockstream.info)
- Aguarde mais tempo (blockchain pode estar congestionada)
- Verifique se o valor enviado está correto

**4. "Endereço já foi usado"**
- Não é um problema! Endereços podem ser reutilizados
- Mas para melhor privacidade, gere um novo para cada pagamento

### Contato

- 📧 Email: suporte@orthoplus.com.br
- 💬 WhatsApp: (11) 9999-9999
- 🌐 Base de Conhecimento: [docs.orthoplus.com.br](https://docs.orthoplus.com.br)

---

## 🎓 Recursos Educacionais

### Recomendações de Hardware Wallets

- **Trezor One** (~$50 USD) - Fácil de usar, ideal para iniciantes
- **Coldcard Mk4** (~$150 USD) - Bitcoin-only, máxima segurança
- **KRUX** (DIY, ~$20 USD) - Open-source, monte você mesmo

### Tutoriais em Vídeo

- [Como Configurar Binance API](https://youtube.com/...)
- [Como Usar Trezor com OrthoPlus Enterprise](https://youtube.com/...)
- [Recebendo Primeiro Pagamento Bitcoin](https://youtube.com/...)

### Livros Recomendados

- 📖 "Mastering Bitcoin" - Andreas Antonopoulos
- 📖 "The Bitcoin Standard" - Saifedean Ammous (português: "O Padrão Bitcoin")

---

## ✅ Checklist de Segurança

Antes de começar a aceitar pagamentos crypto, verifique:

- [ ] API Keys estão criptografadas (automático)
- [ ] Ativou autenticação de 2 fatores (2FA) na exchange
- [ ] Configurou whitelist de IPs (se disponível)
- [ ] Testou com um pagamento pequeno primeiro
- [ ] Configurou notificações de pagamento
- [ ] Fez backup da seed da Hardware Wallet (24 palavras)
- [ ] Guardou a seed em local seguro (fireproof, offline)
- [ ] **NUNCA** compartilhou a seed com ninguém
- [ ] Treinou a equipe sobre como processar pagamentos crypto

---

## 🚀 Próximos Passos

1. Configure sua wallet/exchange ✅
2. Faça um pagamento de teste ✅
3. Treine sua equipe ✅
4. Divulgue para os pacientes ✅
5. Monitore os relatórios ✅

**Pronto!** Você agora aceita pagamentos crypto de forma profissional e segura! 🎉

---

*Última atualização: 15/11/2025*
*Versão: 1.0*
*OrthoPlus Enterprise © 2025 - Todos os direitos reservados*
