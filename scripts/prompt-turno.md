# Rotina de um turno

Você está trabalhando de forma autônoma no Aprendrez. Ninguém vai responder
perguntas durante este turno, então tome decisões razoáveis e registre-as.
Siga os passos na ordem.

## 1. Orientar-se (não pule)
1. Leia `CLAUDE.md` e `SPEC.md`.
2. Leia `PROGRESSO.md` inteiro, com atenção especial à última entrada e às pendências.
3. Rode `git log --oneline -15` e `git status`.
4. Rode `npm run features` para ver quanto falta.

## 2. Conferir a saúde do projeto
Rode `npm run verificar`.
- **Se algo falhar, o turno inteiro passa a ser consertar isso.** Não comece uma
  funcionalidade nova em cima de um projeto quebrado. Conserte, rode de novo,
  registre no diário, faça o commit e encerre o turno.

## 3. Escolher UMA funcionalidade
Em `features.json`, escolha a **primeira** funcionalidade (na ordem do arquivo)
com `"passes": false`. Pule uma funcionalidade só se ela depender claramente de
outra que ainda não passa, e registre o motivo no diário.

## 4. Implementar
- Releia na SPEC as seções relacionadas à funcionalidade.
- Implemente o mínimo necessário para cumprir a descrição e os passos de
  verificação, respeitando as regras do `CLAUDE.md`.
- Escreva os testes **junto** com o código: testes de unidade para a lógica e
  testes em `e2e/` para o que a pessoa vê e faz.

## 5. Verificar de verdade
1. Execute cada passo de verificação da funcionalidade.
2. Para funcionalidades de interface, abra o app com o Playwright, tire uma
   captura de tela em 1440 px e em 375 px e **olhe as imagens**. Confira se o
   resultado faz sentido visualmente, não só se o teste passou.
3. Rode `npm run verificar`. Tudo precisa passar.
4. Só então mude `"passes"` para `true` nessa funcionalidade, e só nela.

Se não conseguir concluir a funcionalidade neste turno, **não** marque `passes`.
Deixe o código num estado que compila e passa nos testes (desfaça o que estiver
quebrado, se precisar) e registre no diário o que falta.

## 6. Registrar no diário
Acrescente uma entrada no **fim** de `PROGRESSO.md`, no formato:

```
## Turno AAAA-MM-DD HH:MM · [Fxx] Título
**Status:** concluída | parcial | consertos
**O que fiz:** 2 a 5 frases em linguagem acessível.
**Decisões:** escolhas feitas sem consultar ninguém e o porquê (ou "nenhuma").
**Problemas e pendências:** o que ficou estranho, frágil ou por fazer (ou "nenhum").
**Próximo turno:** a funcionalidade seguinte e qualquer aviso útil.
```

## 7. Commit
`git add -A` e depois `git commit` com a mensagem `[Fxx] Título` e uma
explicação curta. Confira com `git status` que não sobrou nada pendente.

## 8. Encerrar
Termine o turno com um resumo de no máximo 3 linhas: a funcionalidade, o
status e o resultado de `npm run verificar`. Não comece outra funcionalidade.
