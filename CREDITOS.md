# Créditos e licenças

O Aprendrez é feito com software e materiais abertos. Este arquivo lista tudo o que
vai junto com o app publicado e as licenças de cada item. O rodapé do app mostra um
resumo dos créditos que as licenças exigem.

## Pacotes do app (`dependencies` do `package.json`)

Um teste de unidade (`src/credits.test.ts`) confere que **todo pacote de
`dependencies` está nesta tabela** e que a licença escrita aqui é a mesma que o pacote
instalado declara. Se você instalar um pacote novo, acrescente uma linha.

| Pacote | Para que serve | Licença |
|---|---|---|
| `@fontsource-variable/geist` | Arquivos da fonte Geist, servidos pelo próprio app | OFL-1.1 |
| `chess.js` | Regras do xadrez e geração de lances | BSD-2-Clause |
| `react` | Biblioteca de interface | MIT |
| `react-chessboard` | Tabuleiro interativo (e as imagens das peças, veja abaixo) | MIT |
| `react-dom` | Liga o React ao navegador | MIT |
| `react-router` | Telas e endereços do app | MIT |

## Materiais que não são pacotes

| Material | Autoria | Licença | Onde aparece |
|---|---|---|---|
| Imagens das peças | Colin M.L. Burnett (conjunto "Cburnett"), embutidas no `react-chessboard` | CC BY-SA 3.0 (exige atribuição) | Crédito no rodapé |
| Fonte Geist | Vercel (https://github.com/vercel/geist-font) | SIL Open Font License 1.1 | Crédito no rodapé |
| Base de aberturas (`data/lichess-openings/`) | Lichess (https://github.com/lichess-org/chess-openings) | CC0 1.0 (domínio público) | Crédito no rodapé |

> **Precisa de conferência humana antes de publicar:** o pacote `react-chessboard` é
> MIT, mas não traz um aviso próprio sobre as imagens das peças. Pelos desenhos, elas
> são o conjunto Cburnett (o mesmo da Wikipédia e do Lichess), que é distribuído com
> mais de uma licença. Por prudência, o rodapé credita o autor e cita a CC BY-SA 3.0.
> Quem publicar deve confirmar a licença e a forma de atribuição na página do conjunto
> no Wikimedia Commons e ajustar o rodapé (`src/components/Footer.tsx`) se for preciso.

## Dependências de desenvolvimento (`devDependencies`)

Servem só para construir e testar o app e **não vão para o app publicado**, por isso
não estão listadas uma a uma. Uma delas merece registro: `axe-core` e
`@axe-core/playwright` (verificação automática de acessibilidade) usam a licença
**MPL-2.0**, que só exige abrir mudanças feitas nos próprios arquivos do axe. O Aprendrez
não os modifica.
