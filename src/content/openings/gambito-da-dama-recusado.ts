// Gambito da Dama Recusado: pretas, nível 2, linha fixa, contra 1.d4.
//
// Linha principal: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O
// (em português: 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Bg5 Be7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Bd3 dxc4 9.Bxc4 Cd5 10.Bxe7 Dxe7 11.O-O)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// O nome da base do Lichess é "Queen's Gambit Declined: Modern Variation": a entrada é 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5,
// e todas as linhas deste arquivo começam com ela.
//
// O primeiro lance das brancas (1.d4) é o "lance assumido": o app o joga sozinho e ele é o
// primeiro nó da árvore, jogado pelo adversário.
import type { Opening, OpeningNode } from '../../chess/openingTree'

/**
 * O trecho depois de 6...Nbd7, igual na linha principal e na variação 1 (que chega à mesma posição):
 * 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O.
 * É uma função (e não uma constante) para cada galho ter os seus próprios nós.
 */
function afterKnightD7(): OpeningNode {
  return {
    san: 'Rc1',
    by: 'opponent',
    children: [
      {
        san: 'c6',
        by: 'user',
        explanation:
          'Esse peão reforça o peão de d5 mais uma vez. Com o centro bem protegido, você pode capturar o peão de c4 quando as brancas gastarem um lance com o bispo.',
        hint: 'Reforce o peão de d5 com o peão de uma coluna ao lado, avançando-o uma casa.',
        children: [
          {
            san: 'Bd3',
            by: 'opponent',
            children: [
              {
                san: 'dxc4',
                by: 'user',
                explanation:
                  'Agora o bispo branco já está em d3. Ao capturar o peão de c4, você obriga o bispo a ir até lá para recapturar: ele gasta dois lances para chegar a c4, e você ganha tempo para desenvolver as suas peças.',
                hint: 'Agora que o bispo branco saiu de casa, capture o peão de c4 com o peão da dama.',
                children: [
                  {
                    san: 'Bxc4',
                    by: 'opponent',
                    children: [
                      {
                        san: 'Nd5',
                        by: 'user',
                        explanation:
                          'O cavalo vai para o centro e oferece uma troca de peças. Trocar peças ajuda quem tem menos espaço, como é o seu caso, porque as peças que sobram têm mais lugar para se mexer.',
                        hint: 'Leve o cavalo de f6 para a casa central de d5, de onde ele fica de frente para o cavalo branco.',
                        children: [
                          {
                            san: 'Bxe7',
                            by: 'opponent',
                            children: [
                              {
                                san: 'Qxe7',
                                by: 'user',
                                explanation:
                                  'Você recaptura o bispo com a dama, que fica bem colocada em e7. Daqui você prepara a troca de cavalos e o avanço do peão de e5, que solta o seu jogo.',
                                hint: 'Recapture o bispo branco que acabou de capturar o seu, usando a dama.',
                                children: [{ san: 'O-O', by: 'opponent', children: [] }],
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
}

const queensGambitDeclined: Opening = {
  id: 'gambito-da-dama-recusado',
  name: 'Gambito da Dama Recusado',
  lichessName: "Queen's Gambit Declined: Modern Variation",
  color: 'black',
  level: 2,
  kind: 'fixed',
  assumedFirstMove: 'd4',
  idea: 'As brancas oferecem um peão no centro (isso se chama gambito) para tentar dominar o tabuleiro. Você recusa a oferta: em vez de capturar o peão, sustenta o seu peão central com o peão de e6. Depois desenvolve as peças com calma, faz o roque e usa trocas de peças para soltar o seu jogo.',
  keyIdeas: [
    'O peão de e6 protege o peão de d5 e mantém o centro firme. O preço é que o bispo da dama fica preso atrás dos peões, e você vai resolver isso mais tarde.',
    'Cavalo em f6, bispo em e7 e roque curto: as peças saem rápido e o rei fica seguro cedo.',
    'Quem tem menos espaço deve trocar peças. Capturar em c4 e jogar o cavalo para d5 prepara essas trocas e o avanço e5.',
  ],
  tree: [
    {
      san: 'd4',
      by: 'opponent',
      children: [
        {
          san: 'd5',
          by: 'user',
          explanation:
            'Você ocupa o centro com o peão da dama, de frente para o peão branco. Assim as brancas não ficam sozinhas com o centro.',
          hint: 'Responda ao peão branco avançando o seu peão da dama duas casas.',
          commonMistakes: [
            {
              san: 'e5',
              explanation:
                'As brancas capturam em e5 e ficam com um peão a mais. Recuperar esse peão exige um jogo muito preciso, então é um risco grande no primeiro lance.',
            },
          ],
          children: [
            {
              san: 'c4',
              by: 'opponent',
              children: [
                {
                  san: 'e6',
                  by: 'user',
                  explanation:
                    'O peão de c4 é a oferta de gambito. Você recusa: o peão de e6 protege o peão de d5 e mantém o centro firme, sem capturar nada.',
                  hint: 'Proteja o peão do centro com o peão do rei, avançando-o uma casa.',
                  commonMistakes: [
                    {
                      san: 'dxc4',
                      explanation:
                        'Capturar o peão é um lance jogável, mas é outra abertura (o Gambito da Dama Aceito). Aqui o plano é recusar o gambito e manter o centro.',
                    },
                  ],
                  children: [
                    {
                      san: 'Nc3',
                      by: 'opponent',
                      children: [
                        {
                          san: 'Nf6',
                          by: 'user',
                          explanation:
                            'O cavalo do rei sai para uma casa que reforça o peão de d5 e vigia a casa e4. Desenvolver uma peça é sempre bom nos primeiros lances.',
                          hint: 'Desenvolva o cavalo do rei para uma casa que ajude a proteger o peão de d5.',
                          commonMistakes: [
                            {
                              san: 'Qh4',
                              explanation:
                                'Sair cedo com a dama faz as brancas ganharem tempo: elas desenvolvem uma peça atacando a dama, e você precisa gastar lances para tirá-la de lá.',
                            },
                          ],
                          children: [
                            {
                              san: 'Bg5',
                              by: 'opponent',
                              children: [
                                {
                                  san: 'Be7',
                                  by: 'user',
                                  explanation:
                                    'O bispo branco está pressionando o seu cavalo. Com o bispo em e7, o cavalo deixa de estar "cravado" (preso porque, se sair, a dama fica atacada). Esse lance também prepara o roque.',
                                  hint: 'Solte o cavalo da pressão do bispo branco com o bispo do rei, que ao mesmo tempo prepara o roque.',
                                  children: [
                                    {
                                      san: 'e3',
                                      by: 'opponent',
                                      children: [
                                        {
                                          san: 'O-O',
                                          by: 'user',
                                          explanation:
                                            'O roque (o rei vai para o canto e a torre vem para perto do centro) deixa o rei seguro e liga as suas peças. A posição está fechada, então é um bom momento.',
                                          hint: 'Coloque o rei em segurança com o roque curto.',
                                          children: [
                                            {
                                              san: 'Nf3',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'Nbd7',
                                                  by: 'user',
                                                  explanation:
                                                    'O cavalo da dama sai para d7: ele protege o cavalo de f6 contra o bispo de g5 e abre caminho para o seu plano com c6 e dxc4.',
                                                  hint: 'Desenvolva o cavalo da dama para uma casa em que ele proteja o cavalo de f6.',
                                                  children: [
                                                    afterKnightD7(),
                                                    {
                                                      // Variação 2: as brancas põem a dama em c2 em vez de usar a torre em c1.
                                                      san: 'Qc2',
                                                      by: 'opponent',
                                                      variationName: 'Brancas jogam Dc2 em vez de Tc1',
                                                      children: [
                                                        {
                                                          san: 'c6',
                                                          by: 'user',
                                                          explanation:
                                                            'O plano é o mesmo: o peão de c6 reforça o peão de d5 e deixa você pronto para capturar em c4 quando o bispo branco sair.',
                                                          hint: 'Reforce o peão de d5 com o peão de uma coluna ao lado, avançando-o uma casa.',
                                                          children: [{ san: 'Bd3', by: 'opponent', children: [] }],
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
                                      // Variação 1: as brancas desenvolvem o cavalo antes de jogar e3.
                                      san: 'Nf3',
                                      by: 'opponent',
                                      variationName: 'Brancas jogam Cf3 antes de e3',
                                      children: [
                                        {
                                          san: 'O-O',
                                          by: 'user',
                                          explanation:
                                            'O roque continua sendo o lance certo. A ordem dos lances das brancas mudou, mas o plano é o mesmo: rei seguro e peças desenvolvidas.',
                                          hint: 'Coloque o rei em segurança com o roque curto.',
                                          children: [
                                            {
                                              san: 'e3',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'Nbd7',
                                                  by: 'user',
                                                  explanation:
                                                    'Agora você chega à mesma posição da linha principal: o cavalo da dama sai para d7 e protege o cavalo de f6.',
                                                  hint: 'Desenvolva o cavalo da dama para uma casa em que ele proteja o cavalo de f6.',
                                                  children: [afterKnightD7()],
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

export default queensGambitDeclined
