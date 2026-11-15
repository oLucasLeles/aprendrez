# Aprendrez: instruções para o agente

Aprendrez é um app web estático, em português, para aprender aberturas de xadrez
jogando. **O que** construir está em [SPEC.md](SPEC.md), a fonte de verdade.
Este arquivo diz **como** trabalhar.

## Quem é o dono do projeto

Um Product Designer que está aprendendo a trabalhar mais perto do código. Ele lê
o diário de bordo e os commits para entender o que aconteceu. Por isso:
- Escreva o diário, os commits e os comentários em **português**, em linguagem
  acessível. Quando usar um termo técnico, explique em meia frase.
- Prefira código simples e legível a código "esperto".

## Como você trabalha: em turnos

Você trabalha em **turnos curtos e independentes**. Cada turno começa sem memória
dos anteriores, e tudo o que precisa está nestes arquivos:

| Arquivo | Para que serve |
|---|---|
| `SPEC.md` | O que construir (produto, regras, design) |
| `features.json` | A lista de funcionalidades, cada uma com passos de verificação e o campo `passes` |
| `PROGRESSO.md` | O diário de bordo: o que cada turno fez, decidiu e deixou pendente |
| `scripts/prompt-turno.md` | A rotina exata de um turno |
| histórico do git | O que mudou e quando |

**Uma funcionalidade por turno.** Termine o turno com tudo funcionando e commitado.

## Comandos

```
npm run dev         # servidor local em http://localhost:5173
npm run test        # testes de unidade (Vitest)
npm run e2e         # testes de ponta a ponta no navegador (Playwright, desktop e celular)
npm run verificar   # lint + build + testes de unidade + e2e. TEM que passar no fim de todo turno
npm run features    # quantas funcionalidades já passam
```

Ambiente: Windows. O shell padrão é PowerShell 5.1 (sem `&&`; use `;` ou `if ($?) { }`).

## Estrutura de pastas

```
src/
  styles/tokens.css        # ÚNICO lugar com cores, fontes, espaçamentos e grid
  chess/                   # lógica pura: árvore de aberturas, motor da lição, notação
  content/openings/        # conteúdo: um arquivo por abertura (dados, sem JSX)
  components/              # componentes de interface reutilizáveis (tabuleiro, botões…)
  screens/                 # telas (Início, Lição, Conclusão, Não encontrada)
  progress/                # salvar e ler o progresso (localStorage)
e2e/                       # testes de ponta a ponta
data/lichess-openings/     # base de aberturas do Lichess (CC0). Não editar
docs/                      # ABERTURAS.md (gerado) e capturas de tela
```

## Regras invioláveis

1. **`features.json`:** só altere o campo `passes`, e só de `false` para `true`,
   depois de executar **todos** os passos de verificação daquela funcionalidade.
   Nunca edite, remova ou reordene funcionalidades nem os seus passos. O script
   que roda os turnos confere isso e interrompe tudo se a lista for alterada.
2. **Testes:** nunca apague, pule (`.skip`) ou enfraqueça um teste para fazê-lo
   passar. Se um teste parece errado, registre no diário e siga para outra funcionalidade.
3. **Escopo:** não construa nada que a SPEC deixa de fora. Na dúvida, escolha o
   mais simples e registre a decisão no diário.
4. **Xadrez:** use `chess.js` para regras e lances. Nunca reimplemente regras.
   Toda linha de abertura precisa começar com uma entrada da base em
   `data/lichess-openings/`. Não invente aberturas nem lances "de memória" sem conferir.
5. **Design:** cores, fontes e espaçamentos só via variáveis de
   `src/styles/tokens.css`. Nenhuma cor escrita direto em componentes.
6. **Dependências:** instale um pacote novo só quando necessário. Registre no
   diário o motivo e a licença (precisa ser MIT, BSD, Apache, ISC ou similar).
7. **Nada sai do computador:** não faça `git push`, não publique e não faça
   deploy. Isso é feito por uma pessoa.
8. **Segredos:** nunca crie nem peça chaves, senhas ou tokens. O app não precisa de nenhum.

## Convenções de código

- Nomes de arquivos, variáveis e funções em **inglês** (padrão do ecossistema).
  Textos da interface, comentários, diário e commits em **português**.
- Lógica pura (em `src/chess/`, `src/progress/`) separada da interface e testada com testes de unidade.
- Toda funcionalidade de interface tem pelo menos um teste em `e2e/`.
- Use os papéis de acessibilidade (`getByRole`) nos testes, o que já obriga a interface a ser acessível.
- Mensagem de commit: `[F07] Notação em português` + 1 a 3 linhas explicando o que mudou e por quê.
