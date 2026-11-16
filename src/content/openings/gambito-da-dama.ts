// Gambito da Dama: brancas, nível 3, linha fixa.
//
// Linha principal: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5
// (em português: 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// É a mesma posição que o Gambito da Dama Recusado ensina, só que vista do lado das brancas.
// O nome da base do Lichess é "Queen's Gambit" (1.d4 d5 2.c4): é a entrada que as três linhas
// deste arquivo têm em comum, já que cada uma desvia do adversário logo no segundo lance.
//
// As duas variações são as outras respostas mais comuns das pretas ao 2.c4:
//   - 2...dxc4: as pretas aceitam o gambito (Gambito da Dama Aceito);
//   - 2...c6: as pretas apoiam o peão de d5 com o peão de c (Defesa Eslava).
import type { Opening } from '../../chess/openingTree'

const queensGambit: Opening = {
  id: 'gambito-da-dama',
  name: 'Gambito da Dama',
  lichessName: "Queen's Gambit",
  color: 'white',
  level: 3,
  kind: 'fixed',
  assumedFirstMove: null,
  idea: 'Você oferece um peão com o lance c4 (isso se chama gambito) para tirar o peão preto do centro. Se as pretas aceitarem, você recupera o peão logo depois; se recusarem, você desenvolve as peças e pressiona o centro.',
  keyIdeas: [
    'O peão de c4 não é um sacrifício de verdade: se as pretas o capturarem, o seu bispo o recupera em poucos lances.',
    'Os dois cavalos e o bispo da dama saem rápido e miram o centro. O bispo em g5 pressiona o cavalo de f6, que protege o peão de d5.',
    'O peão de e3 sustenta o centro e abre o caminho do bispo do rei, que vai para d3 e depois captura em c4.',
  ],
  tree: [
    {
      san: 'd4',
      by: 'user',
      explanation:
        'O peão da dama avança duas casas e ocupa o centro (as casas do meio do tabuleiro). É o primeiro passo do gambito e libera o bispo da dama e a dama para entrarem em jogo.',
      hint: 'Ocupe o centro avançando duas casas o peão que fica na frente da dama.',
      commonMistakes: [
        {
          san: 'f3',
          explanation:
            'Esse peão não ocupa o centro e ainda enfraquece a diagonal do seu rei. O peão de d4 faz o mesmo trabalho no centro sem criar esse buraco.',
        },
      ],
      children: [
        {
          san: 'd5',
          by: 'opponent',
          children: [
            {
              san: 'c4',
              by: 'user',
              explanation:
                'Esse é o gambito (a oferta de um peão): o peão de c4 ataca o peão preto de d5 para tentar tirá-lo do centro. Se as pretas o capturarem, você recupera o peão logo depois.',
              hint: 'Ataque o peão de d5 avançando duas casas o peão ao lado do peão da dama.',
              commonMistakes: [
                {
                  san: 'Bf4',
                  explanation:
                    'É um lance jogável, mas é outra abertura (o Sistema Londres, que também está no Aprendrez). Ele deixa de lado o peão de c4, que é o que dá nome ao gambito.',
                },
              ],
              children: [
                {
                  san: 'e6',
                  by: 'opponent',
                  children: [
                    {
                      san: 'Nc3',
                      by: 'user',
                      explanation:
                        'O cavalo da dama sai para c3 e aumenta a pressão sobre o centro: ele vigia a casa d5 e a casa e4. Cavalos costumam ser desenvolvidos antes dos bispos.',
                      hint: 'Desenvolva o cavalo da dama para uma casa que ajude a pressionar o peão preto de d5.',
                      commonMistakes: [
                        {
                          san: 'cxd5',
                          explanation:
                            'Capturar já é jogável (é a chamada Variante da Troca), mas resolve a tensão do centro cedo demais. Aqui o plano é manter a pressão sobre o peão de d5 e desenvolver as peças primeiro.',
                        },
                      ],
                      children: [
                        {
                          san: 'Nf6',
                          by: 'opponent',
                          children: [
                            {
                              san: 'Bg5',
                              by: 'user',
                              explanation:
                                'O bispo da dama sai para fora da corrente de peões e pressiona o cavalo de f6, que é quem protege o peão de d5. Quanto mais pressão sobre esse cavalo, mais frágil fica o centro preto.',
                              hint: 'Desenvolva o bispo da dama para uma casa que pressione o cavalo preto, antes de trancá-lo com o peão de e3.',
                              commonMistakes: [
                                {
                                  san: 'a3',
                                  explanation:
                                    'Esse peão da borda não desenvolve nenhuma peça e não pressiona o centro. É um lance lento no momento em que você ainda tem peças para tirar de casa.',
                                },
                              ],
                              children: [
                                {
                                  san: 'Be7',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'e3',
                                      by: 'user',
                                      explanation:
                                        'O peão de e3 apoia o centro e abre a diagonal do bispo do rei, que vai sair para d3. Como o bispo da dama já está fora, ele não corre o risco de ficar trancado atrás dos peões.',
                                      hint: 'Apoie o centro e abra caminho para o bispo do rei avançando o peão do rei uma casa.',
                                      commonMistakes: [
                                        {
                                          san: 'Bxf6',
                                          explanation:
                                            'Trocar o bispo pelo cavalo agora é jogável, mas você entrega cedo uma peça que estava pressionando o centro, antes de terminar de desenvolver as outras. Vale mais manter a pressão por enquanto.',
                                        },
                                      ],
                                      children: [
                                        {
                                          san: 'O-O',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'Nf3',
                                              by: 'user',
                                              explanation:
                                                'O cavalo do rei sai e protege o seu peão de d4, além de vigiar o centro. Agora você já tem os dois cavalos e o bispo da dama fora de casa, e falta pouco para rocar.',
                                              hint: 'Desenvolva o cavalo do rei, de modo que ele vigie o centro e proteja o seu peão de d4.',
                                              children: [
                                                {
                                                  san: 'Nbd7',
                                                  by: 'opponent',
                                                  children: [
                                                    {
                                                      san: 'Rc1',
                                                      by: 'user',
                                                      explanation:
                                                        'A torre vai para a coluna c, onde fica pronta para agir quando essa coluna se abrir. Se as pretas capturarem em c4, ela passa a olhar direto para o lado delas.',
                                                      hint: 'Leve a torre do canto da dama para a coluna do seu peão de gambito.',
                                                      children: [
                                                        {
                                                          san: 'c6',
                                                          by: 'opponent',
                                                          children: [
                                                            {
                                                              san: 'Bd3',
                                                              by: 'user',
                                                              explanation:
                                                                'O bispo do rei sai para d3, uma casa ativa de onde ele aponta para o lado do rei preto. Se as pretas capturarem o peão de c4, é esse bispo que o recupera.',
                                                              hint: 'Desenvolva o bispo do rei para uma casa ativa da diagonal que olha para o lado do rei preto.',
                                                              children: [
                                                                {
                                                                  san: 'dxc4',
                                                                  by: 'opponent',
                                                                  children: [
                                                                    {
                                                                      san: 'Bxc4',
                                                                      by: 'user',
                                                                      explanation:
                                                                        'Você recupera o peão que ofereceu no começo e o bispo chega a uma casa ativa. O gambito cumpriu o plano: você ficou com bom espaço no centro e as suas peças estão bem colocadas.',
                                                                      hint: 'Recupere o peão que você ofereceu no começo, usando o bispo.',
                                                                      children: [{ san: 'Nd5', by: 'opponent', children: [] }],
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  // Variação 1: as pretas aceitam o gambito. 2...dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6
                  san: 'dxc4',
                  by: 'opponent',
                  variationName: 'Pretas jogam dxc4 em vez de e6',
                  children: [
                    {
                      san: 'Nf3',
                      by: 'user',
                      explanation:
                        'As pretas aceitaram o peão, mas você não precisa correr para pegá-lo de volta: ele não consegue ficar protegido por muito tempo. Primeiro você desenvolve o cavalo do rei.',
                      hint: 'Em vez de recapturar já, desenvolva o cavalo do lado do rei.',
                      children: [
                        {
                          san: 'Nf6',
                          by: 'opponent',
                          children: [
                            {
                              san: 'e3',
                              by: 'user',
                              explanation:
                                'O peão de e3 abre a diagonal do bispo do rei, que vai recuperar o peão de c4. Ao mesmo tempo ele sustenta o seu centro.',
                              hint: 'Abra o caminho do bispo do rei avançando o peão do rei uma casa.',
                              children: [
                                {
                                  san: 'e6',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'Bxc4',
                                      by: 'user',
                                      explanation:
                                        'Agora o bispo recupera o peão do gambito e fica numa casa ativa. Você devolveu o equilíbrio de peões e ficou com mais espaço no centro.',
                                      hint: 'Recupere o peão do gambito com o bispo do rei.',
                                      children: [
                                        {
                                          san: 'c5',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'O-O',
                                              by: 'user',
                                              explanation:
                                                'Você faz o roque (o rei vai para o canto e a torre vem para perto do centro). O rei fica seguro e as suas peças estão todas em jogo.',
                                              hint: 'Coloque o rei em segurança com o roque curto.',
                                              children: [{ san: 'a6', by: 'opponent', children: [] }],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  // Variação 2: as pretas apoiam o peão de d5 com c6 (Defesa Eslava). 2...c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6
                  san: 'c6',
                  by: 'opponent',
                  variationName: 'Pretas jogam c6 em vez de e6',
                  children: [
                    {
                      san: 'Nf3',
                      by: 'user',
                      explanation:
                        'As pretas protegem o peão de d5 com o peão de c6, em vez de usar o peão de e6. Você continua o plano de sempre: desenvolver o cavalo do rei, que vigia o centro.',
                      hint: 'Desenvolva o cavalo do lado do rei, numa casa que vigie o centro.',
                      children: [
                        {
                          san: 'Nf6',
                          by: 'opponent',
                          children: [
                            {
                              san: 'Nc3',
                              by: 'user',
                              explanation:
                                'O cavalo da dama sai para c3 e aumenta a pressão sobre o peão preto de d5. Agora os seus dois cavalos estão mirando o centro.',
                              hint: 'Desenvolva o cavalo da dama para uma casa que pressione o peão preto de d5.',
                              children: [
                                {
                                  san: 'dxc4',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'a4',
                                      by: 'user',
                                      explanation:
                                        'As pretas capturaram o peão. Antes de recuperá-lo, você impede o avanço do peão de b5: se elas conseguissem protegê-lo com ele, seria bem mais difícil pegar o peão de c4 de volta.',
                                      hint: 'Impeça as pretas de proteger o peão capturado com o peão de b5, usando o peão da torre da dama.',
                                      children: [
                                        {
                                          san: 'Bf5',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'e3',
                                              by: 'user',
                                              explanation:
                                                'O peão de e3 abre a diagonal do bispo do rei, que vai recuperar o peão de c4 em seguida. Ao mesmo tempo ele sustenta o seu centro.',
                                              hint: 'Abra o caminho do bispo do rei avançando o peão do rei uma casa.',
                                              children: [{ san: 'e6', by: 'opponent', children: [] }],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default queensGambit
