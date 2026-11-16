// Defesa Caro-Kann (variação Clássica): pretas, nível 2, linha fixa, contra 1.e4.
//
// Linha principal: 1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3
// (em português: 1.e4 c6 2.d4 d5 3.Cd2 dxe4 4.Cxe4 Bf5 5.Cg3 Bg6 6.h4 h6 7.Cf3 Cd7 8.h5 Bh7 9.Bd3 Bxd3 10.Dxd3)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// O nome da base do Lichess é "Caro-Kann Defense: Classical Variation": as entradas desse nome vão de
// 3.Nd2 dxe4 4.Nxe4 Bf5 até 7...Nd7. (3.Nc3 chega à mesma posição, mas a base só tem essa ordem com este nome.)
//
// O primeiro lance das brancas (1.e4) é o "lance assumido": o app o joga sozinho e ele é o
// primeiro nó da árvore, jogado pelo adversário.
import type { Opening, OpeningNode } from '../../chess/openingTree'

/**
 * O trecho final, igual na linha principal e na variação 2: 9.Bd3 Bxd3 10.Qxd3.
 * É uma função (e não uma constante) para cada galho ter os seus próprios nós.
 */
function bishopTrade(): OpeningNode {
  return {
    san: 'Bd3',
    by: 'opponent',
    children: [
      {
        san: 'Bxd3',
        by: 'user',
        explanation:
          'Você troca o seu bispo, que já estava bem posicionado, pelo bispo branco. Trocar uma peça que dá trabalho para desenvolver por uma peça das brancas deixa você com mais espaço e sem nenhum bispo ruim.',
        hint: 'Troque o seu bispo pelo bispo branco que acabou de aparecer na mesma diagonal.',
        commonMistakes: [
          {
            san: 'Bg6',
            explanation:
              'Voltar para g6 é um erro: o peão branco de h5 captura o bispo na hora, e você perde uma peça inteira sem receber nada em troca.',
          },
        ],
        children: [{ san: 'Qxd3', by: 'opponent', children: [] }],
      },
    ],
  }
}

const caroKann: Opening = {
  id: 'caro-kann',
  name: 'Defesa Caro-Kann',
  lichessName: 'Caro-Kann Defense: Classical Variation',
  color: 'black',
  level: 2,
  kind: 'fixed',
  assumedFirstMove: 'e4',
  idea: 'Você prepara o ataque ao centro com um peão ao lado (o de c6) e só então avança o peão da dama. Antes de fechar a sua posição, você tira o bispo da dama para fora da cadeia de peões. O resultado é uma defesa muito sólida, sem pontos fracos.',
  keyIdeas: [
    'O peão de c6 protege a casa d5: assim você avança o peão da dama sem depender da dama para protegê-lo.',
    'O bispo da dama sai para f5 e g6 cedo, antes de você fechar a posição com o peão de e6. Esse é o grande trunfo da Caro-Kann.',
    'Com h6 e Cd7, você prepara o recuo do bispo e o desenvolvimento do outro cavalo sem ficar com peões dobrados.',
  ],
  tree: [
    {
      san: 'e4',
      by: 'opponent',
      children: [
        {
          san: 'c6',
          by: 'user',
          explanation:
            'Esse peão prepara o avanço do peão da dama: no próximo lance, d5 chega com um peão ao lado para protegê-lo. É o lance que dá nome à abertura.',
          hint: 'Prepare o avanço do peão da dama movendo o peão de uma coluna ao lado dele, uma casa para a frente.',
          commonMistakes: [
            {
              san: 'g5',
              explanation:
                'Esse avanço enfraquece as casas na frente do seu rei e não ajuda em nada no centro. Nas primeiras jogadas, vale mais cuidar do centro e do rei.',
            },
          ],
          children: [
            {
              san: 'd4',
              by: 'opponent',
              children: [
                {
                  san: 'd5',
                  by: 'user',
                  explanation:
                    'Agora o peão da dama avança com a proteção do peão de c6 e ataca o peão branco de e4. Você disputa o centro (as casas do meio do tabuleiro) sem arriscar nada.',
                  hint: 'Ataque o peão branco do rei avançando o peão da dama duas casas, agora que ele tem proteção.',
                  commonMistakes: [
                    {
                      san: 'e5',
                      explanation:
                        'O peão de e5 fica atacado pelo peão branco de d4 e você não tem como protegê-lo bem. As brancas capturam e ficam com um peão a mais.',
                    },
                  ],
                  children: [
                    {
                      san: 'Nd2',
                      by: 'opponent',
                      children: [
                        {
                          san: 'dxe4',
                          by: 'user',
                          explanation:
                            'Você captura o peão de e4. Depois que as brancas recapturarem, o peão branco central some e a casa f5 fica livre para o seu bispo, o plano principal da abertura.',
                          hint: 'Capture o peão branco do rei com o seu peão do centro.',
                          children: [
                            {
                              san: 'Nxe4',
                              by: 'opponent',
                              children: [
                                {
                                  san: 'Bf5',
                                  by: 'user',
                                  explanation:
                                    'O bispo da dama sai para fora da cadeia de peões, e ainda ataca o cavalo de e4. Você o desenvolve agora porque, depois de e6, ele ficaria preso atrás dos peões.',
                                  hint: 'Desenvolva o bispo que ficaria trancado atrás dos peões, para uma casa em que ele ataque o cavalo branco.',
                                  commonMistakes: [
                                    {
                                      san: 'Qxd4',
                                      explanation:
                                        'A dama captura um peão, mas ele é protegido pela dama branca. As brancas capturam a sua dama, a peça mais valiosa depois do rei.',
                                    },
                                  ],
                                  children: [
                                    {
                                      san: 'Ng3',
                                      by: 'opponent',
                                      children: [
                                        {
                                          san: 'Bg6',
                                          by: 'user',
                                          explanation:
                                            'O cavalo branco ataca o bispo, então ele recua para g6. Nessa casa ele continua fora dos peões, protegido pelos peões de f7 e h7, e ainda vigia a diagonal até o peão de c2.',
                                          hint: 'Mantenha o bispo na mesma diagonal, mas recue-o para uma casa onde ele fique protegido pelos peões.',
                                          commonMistakes: [
                                            {
                                              san: 'Bxc2',
                                              explanation:
                                                'O bispo captura um peão, mas a dama branca captura o bispo de volta. Você trocaria uma peça por um peão.',
                                            },
                                          ],
                                          children: [
                                            {
                                              san: 'h4',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'h6',
                                                  by: 'user',
                                                  explanation:
                                                    'As brancas ameaçam avançar o peão de h para atacar o seu bispo. O peão de h6 prepara a casa h7, para onde o bispo vai recuar em segurança, e impede o cavalo branco de pular para g5.',
                                                  hint: 'Prepare uma casa de recuo para o bispo com um peão da borda do seu lado do rei.',
                                                  children: [
                                                    {
                                                      san: 'Nf3',
                                                      by: 'opponent',
                                                      children: [
                                                        {
                                                          san: 'Nd7',
                                                          by: 'user',
                                                          explanation:
                                                            'O cavalo da dama sai para d7 para deixar f6 livre para o outro cavalo. Se as brancas trocarem peças em f6, você recaptura com um cavalo e não fica com peões dobrados (dois peões na mesma coluna).',
                                                          hint: 'Desenvolva o cavalo da dama para uma casa que deixe a casa f6 livre para o outro cavalo.',
                                                          children: [
                                                            {
                                                              san: 'h5',
                                                              by: 'opponent',
                                                              children: [
                                                                {
                                                                  san: 'Bh7',
                                                                  by: 'user',
                                                                  explanation:
                                                                    'O peão branco ataca o seu bispo, que recua para h7, a casa que você preparou com h6. Ali ele continua na mesma diagonal, protegido e fora de perigo.',
                                                                  hint: 'Recue o bispo para a casa de segurança que você preparou ao lado do peão de h.',
                                                                  commonMistakes: [
                                                                    {
                                                                      san: 'Bxh5',
                                                                      explanation:
                                                                        'O bispo captura o peão, mas o cavalo branco de g3 captura o bispo. Você perderia uma peça por um peão.',
                                                                    },
                                                                  ],
                                                                  children: [bishopTrade()],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                    {
                                                      // Variação 2: as brancas avançam h5 antes de desenvolver o cavalo.
                                                      san: 'h5',
                                                      by: 'opponent',
                                                      variationName: 'Brancas jogam h5 antes de Cf3',
                                                      children: [
                                                        {
                                                          san: 'Bh7',
                                                          by: 'user',
                                                          explanation:
                                                            'O peão branco ataca o seu bispo, que recua para h7, a casa que você preparou com h6. A ordem dos lances das brancas mudou, mas a sua resposta é a mesma.',
                                                          hint: 'Recue o bispo para a casa de segurança que você preparou ao lado do peão de h.',
                                                          children: [
                                                            {
                                                              san: 'Nf3',
                                                              by: 'opponent',
                                                              children: [
                                                                {
                                                                  san: 'Nd7',
                                                                  by: 'user',
                                                                  explanation:
                                                                    'Agora você chega à mesma posição da linha principal: o cavalo da dama sai para d7 e deixa f6 livre para o outro cavalo.',
                                                                  hint: 'Desenvolva o cavalo da dama para uma casa que deixe a casa f6 livre para o outro cavalo.',
                                                                  children: [bishopTrade()],
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
                                              // Variação 1: as brancas desenvolvem o bispo em vez de avançar o peão de h.
                                              san: 'Bc4',
                                              by: 'opponent',
                                              variationName: 'Brancas jogam Bc4 em vez de h4',
                                              children: [
                                                {
                                                  san: 'e6',
                                                  by: 'user',
                                                  explanation:
                                                    'O bispo branco de c4 mira o seu peão de f7. Com o bispo da dama já fora dos peões, agora é seguro jogar e6: o peão fecha a diagonal do bispo branco e abre caminho para o seu bispo do rei.',
                                                  hint: 'Agora que o seu bispo está fora, feche a diagonal do bispo branco com um peão do centro.',
                                                  children: [
                                                    {
                                                      san: 'Nf3',
                                                      by: 'opponent',
                                                      children: [],
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
}

export default caroKann
