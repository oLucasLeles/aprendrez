// Defesa Siciliana (linha aberta): pretas, nível 3, linha fixa, contra 1.e4.
//
// Linha principal: 1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 d6 6.Be2 e5 7.Nb3 Be7 8.O-O O-O 9.Be3 Be6
// (em português: 1.e4 c5 2.Cf3 Cc6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 d6 6.Be2 e5 7.Cb3 Be7 8.O-O O-O 9.Be3 Be6)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// O nome da base do Lichess é "Sicilian Defense: Open": as entradas desse nome vão de 3.d4 até 4...Nf6.
// O resto da linha (a partir de 5.Nc3) é a teoria clássica da variação Clássica, com o plano ...e5.
//
// "Linha aberta" quer dizer que as brancas jogam d4 e trocam esse peão pelo de c5, abrindo o jogo
// (a coluna c e a diagonal do bispo ficam livres). É o jeito mais comum de enfrentar a Siciliana.
//
// O primeiro lance das brancas (1.e4) é o "lance assumido": o app o joga sozinho e ele é o
// primeiro nó da árvore, jogado pelo adversário.
import type { Opening, OpeningNode } from '../../chess/openingTree'

/** Variação 1: as brancas jogam 6.Bg5 (cravam o cavalo) em vez de 6.Be2. */
const bishopG5Branch: OpeningNode = {
  san: 'Bg5',
  by: 'opponent',
  variationName: 'Brancas jogam Bg5 em vez de Be2',
  children: [
    {
      san: 'e6',
      by: 'user',
      explanation:
        'O bispo branco aponta para o seu cavalo de f6 e, atrás dele, para a sua dama. Com o peão de e6 você fecha a casa d5 para os cavalos brancos e abre a diagonal do seu bispo do rei. Esse é o plano seguro contra o bispo em g5.',
      hint: 'Prepare o bispo do rei e proteja a casa d5 com o peão central, uma casa para a frente.',
      children: [{ san: 'Qd2', by: 'opponent', children: [] }],
    },
  ],
}

/** Variação 2: as brancas trocam os cavalos em c6 (7.Nxc6) em vez de recuar com 7.Nb3. */
const knightTradeBranch: OpeningNode = {
  san: 'Nxc6',
  by: 'opponent',
  variationName: 'Brancas trocam os cavalos (Cxc6)',
  children: [
    {
      san: 'bxc6',
      by: 'user',
      explanation:
        'O cavalo branco capturou o seu cavalo de c6 e agora ameaça a sua dama. Você recaptura com o peão de b7. Os seus peões de c ficam dobrados, mas você ganha o centro forte com c6, d6 e e5.',
      hint: 'Recapture o cavalo branco que está em c6 com o peão que está ao lado do peão de c.',
      commonMistakes: [
        {
          san: 'Nxe4',
          explanation:
            'O cavalo branco de c6 está atacando a sua dama. Se você captura o peão de e4 em vez de recapturar, as brancas pegam a sua dama.',
        },
      ],
      children: [{ san: 'O-O', by: 'opponent', children: [] }],
    },
  ],
}

const siciliana: Opening = {
  id: 'siciliana',
  name: 'Defesa Siciliana (linha aberta)',
  lichessName: 'Sicilian Defense: Open',
  color: 'black',
  level: 3,
  kind: 'fixed',
  assumedFirstMove: 'e4',
  idea: 'Você responde ao peão do rei com o peão do bispo da dama (c5), em vez de copiar o lance das brancas. Depois você troca esse peão lateral por um peão central das brancas, e isso abre uma coluna para as suas torres atacarem. A posição fica desequilibrada, com chances de vitória para os dois lados.',
  keyIdeas: [
    'Você troca um peão lateral (o de c) por um peão central das brancas (o de d). Assim você luta pelo centro sem copiar as brancas.',
    'Com d6 e e5 você ocupa o centro e expulsa o cavalo branco de d4. A casa d5 fica um pouco fraca, mas o bispo de e6 e o cavalo de f6 ajudam a vigiá-la.',
    'A coluna c fica aberta: mais tarde, as suas torres podem usá-la para atacar.',
  ],
  tree: [
    {
      san: 'e4',
      by: 'opponent',
      children: [
        {
          san: 'c5',
          by: 'user',
          explanation:
            'Em vez de copiar as brancas com e5, você avança o peão do bispo da dama duas casas. Esse peão vigia a casa d4, que é uma casa importante do centro, e deixa o jogo diferente para os dois lados. É o lance que dá nome à Siciliana.',
          hint: 'Dispute o centro pelo lado: avance duas casas o peão da coluna do bispo da dama.',
          commonMistakes: [
            {
              san: 'f5',
              explanation:
                'Esse avanço enfraquece a diagonal na frente do seu rei e não ajuda a disputar o centro. Nas primeiras jogadas, vale mais cuidar do centro e do rei.',
            },
          ],
          children: [
            {
              san: 'Nf3',
              by: 'opponent',
              children: [
                {
                  san: 'Nc6',
                  by: 'user',
                  explanation:
                    'O cavalo da dama sai para o meio do tabuleiro e passa a vigiar as casas d4 e e5, o que reforça o seu plano. Desenvolver (tirar as peças do lugar de partida) cedo é sempre uma boa ideia.',
                  hint: 'Desenvolva o cavalo da dama para uma casa que vigie o centro e ajude o peão a controlar d4.',
                  commonMistakes: [
                    {
                      san: 'b5',
                      explanation:
                        'O peão fica sem proteção e o bispo branco o captura na hora. Você perde um peão logo no começo.',
                    },
                  ],
                  children: [
                    {
                      san: 'd4',
                      by: 'opponent',
                      children: [
                        {
                          san: 'cxd4',
                          by: 'user',
                          explanation:
                            'Você captura o peão central das brancas com o seu peão lateral. É essa troca que "abre" a Siciliana: a coluna c fica livre e as brancas perdem um peão do centro.',
                          hint: 'Capture o peão branco que acabou de avançar para o centro, usando o seu peão da coluna do bispo da dama.',
                          commonMistakes: [
                            {
                              san: 'e5',
                              explanation:
                                'O peão avança, mas as brancas capturam o peão de e5 com o peão de d4 e você fica com um peão a menos.',
                            },
                          ],
                          children: [
                            {
                              san: 'Nxd4',
                              by: 'opponent',
                              children: [
                                {
                                  san: 'Nf6',
                                  by: 'user',
                                  explanation:
                                    'O cavalo do rei sai para uma casa central e ataca o peão branco de e4. As brancas precisam proteger o peão, e você ganha tempo para desenvolver as próximas peças.',
                                  hint: 'Desenvolva o cavalo do rei para uma casa que ataque o peão branco do rei.',
                                  children: [
                                    {
                                      san: 'Nc3',
                                      by: 'opponent',
                                      children: [
                                        {
                                          san: 'd6',
                                          by: 'user',
                                          explanation:
                                            'O peão de d6 protege a casa e5 e impede o peão branco de avançar com e5 para atacar o seu cavalo. Ele também abre o caminho do bispo da dama.',
                                          hint: 'Proteja a casa e5 e abra caminho para o bispo da dama com um peão do centro, uma casa para a frente.',
                                          commonMistakes: [
                                            {
                                              san: 'Nxe4',
                                              explanation:
                                                'O peão de e4 está protegido pelo cavalo de c3. As brancas capturam o seu cavalo e você troca uma peça inteira por um peão.',
                                            },
                                          ],
                                          children: [
                                            {
                                              san: 'Be2',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'e5',
                                                  by: 'user',
                                                  explanation:
                                                    'O peão ataca o cavalo branco de d4 e toma o centro do tabuleiro. A casa d5 fica um pouco fraca, mas os seus bispos e cavalos vão vigiá-la.',
                                                  hint: 'Ataque o cavalo branco que está no centro com um peão da coluna do rei.',
                                                  commonMistakes: [
                                                    {
                                                      san: 'Nxe4',
                                                      explanation:
                                                        'O cavalo branco de c3 protege o peão de e4. As brancas capturam o seu cavalo, e você perde uma peça por um peão.',
                                                    },
                                                  ],
                                                  children: [
                                                    {
                                                      san: 'Nb3',
                                                      by: 'opponent',
                                                      children: [
                                                        {
                                                          san: 'Be7',
                                                          by: 'user',
                                                          explanation:
                                                            'O bispo do rei sai e libera as casas entre o rei e a torre, o que prepara o roque. Em e7 ele também protege o cavalo de f6.',
                                                          hint: 'Desenvolva o bispo do rei para uma casa perto do rei, que prepare o roque.',
                                                          children: [
                                                            {
                                                              san: 'O-O',
                                                              by: 'opponent',
                                                              children: [
                                                                {
                                                                  san: 'O-O',
                                                                  by: 'user',
                                                                  explanation:
                                                                    'O roque coloca o rei em segurança e traz a torre para perto do centro. É melhor fazê-lo agora, antes que a posição fique mais aberta.',
                                                                  hint: 'Coloque o rei em segurança e traga a torre para o jogo com um único lance.',
                                                                  children: [
                                                                    {
                                                                      san: 'Be3',
                                                                      by: 'opponent',
                                                                      children: [
                                                                        {
                                                                          san: 'Be6',
                                                                          by: 'user',
                                                                          explanation:
                                                                            'O último bispo se desenvolve para uma casa central, de onde vigia a casa d5. Agora todas as suas peças pequenas estão no jogo.',
                                                                          hint: 'Desenvolva o bispo da dama que ainda está em casa, para uma casa da sexta fileira que vigie d5.',
                                                                          commonMistakes: [
                                                                            {
                                                                              san: 'Ng4',
                                                                              explanation:
                                                                                'O cavalo ataca o bispo, mas o bispo branco de e2 o captura primeiro. Depois da recaptura, a dama branca pega o seu bispo e você perde uma peça.',
                                                                            },
                                                                          ],
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
                                                    knightTradeBranch,
                                                  ],
                                                },
                                              ],
                                            },
                                            bishopG5Branch,
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

export default siciliana
