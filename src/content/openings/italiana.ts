// Abertura Italiana (Giuoco Piano): brancas, nível 1, linha fixa.
//
// Linha principal: 1.e4 e5 2.Cf3 Cc6 3.Bc4 Bc5 4.c3 Cf6 5.d3 d6 6.O-O O-O 7.Te1 a6 8.Bb3 Ba7
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
import type { Opening } from '../../chess/openingTree'

const italiana: Opening = {
  id: 'italiana',
  name: 'Italiana (Giuoco Piano)',
  lichessName: 'Italian Game: Giuoco Piano',
  color: 'white',
  level: 1,
  kind: 'fixed',
  assumedFirstMove: null,
  idea: 'Você ocupa o centro do tabuleiro, põe o bispo numa diagonal que mira o ponto mais fraco das pretas e protege o rei com o roque. É um começo natural e fácil de entender, em que cada peça sai para um lugar claro.',
  keyIdeas: [
    'Ocupar o centro com o peão de e4 e reforçá-lo com d3 dá espaço às suas peças. O avanço d4 fica para mais tarde.',
    'O bispo em c4 aponta para f7, a casa mais frágil das pretas, porque só o rei a protege.',
    'Rocar cedo deixa o rei seguro e leva a torre para perto do centro.',
  ],
  tree: [
    {
      san: 'e4',
      by: 'user',
      explanation:
        'O peão avança duas casas e ocupa o centro do tabuleiro (as casas do meio, que dão mais espaço às suas peças). Ele também abre caminho para o bispo e para a dama.',
      hint: 'Comece ocupando o centro com o peão que fica na frente do rei.',
      commonMistakes: [
        {
          san: 'a4',
          explanation:
            'Esse lance é possível, mas o peão da borda quase não influencia o centro. Nos primeiros lances vale mais a pena disputar o meio do tabuleiro.',
        },
      ],
      children: [
        {
          san: 'e5',
          by: 'opponent',
          children: [
            {
              san: 'Nf3',
              by: 'user',
              explanation:
                'O cavalo sai para uma casa de onde ataca o peão preto de e5 e ajuda a controlar o centro. Colocar as peças em jogo se chama desenvolver.',
              hint: 'Desenvolva o cavalo do lado do rei: ele deve atacar o peão preto do centro.',
              commonMistakes: [
                {
                  san: 'Qh5',
                  explanation:
                    'A dama até ataca o peão de e5, mas sair cedo demais a deixa exposta: as pretas desenvolvem peças atacando a dama e você perde tempo fugindo.',
                },
              ],
              children: [
                {
                  san: 'Nc6',
                  by: 'opponent',
                  children: [
                    {
                      san: 'Bc4',
                      by: 'user',
                      explanation:
                        'O bispo vai para uma diagonal forte, apontada para f7, a casa mais frágil das pretas (só o rei a protege). É esse lance que dá à abertura o nome de Italiana.',
                      hint: 'Desenvolva o bispo do lado do rei, numa diagonal que mire o ponto fraco das pretas.',
                      commonMistakes: [
                        {
                          san: 'Nxe5',
                          explanation:
                            'O cavalo captura um peão, mas o peão de e5 está protegido pelo cavalo preto de c6. Você trocaria seu cavalo por um peão e sairia perdendo.',
                        },
                      ],
                      children: [
                        {
                          san: 'Bc5',
                          by: 'opponent',
                          children: [
                            {
                              san: 'c3',
                              by: 'user',
                              explanation:
                                'Esse peão prepara o avanço do peão da dama até d4, para formar um centro grande, com dois peões lado a lado (e4 e d4).',
                              hint: 'Prepare, com um lance de peão, um avanço no centro que ainda não pode ser feito.',
                              commonMistakes: [
                                {
                                  san: 'Bxf7+',
                                  explanation:
                                    'O bispo captura um peão dando xeque (ataque direto ao rei), mas o rei preto simplesmente captura o bispo. Você troca uma peça valiosa por um peão.',
                                },
                              ],
                              children: [
                                {
                                  san: 'Nf6',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'd3',
                                      by: 'user',
                                      explanation:
                                        'É um plano calmo: em vez de abrir o centro de uma vez, você primeiro fortalece o peão de e4 com este peão. Ele também libera o bispo que ficou em casa.',
                                      hint: 'Dê firmeza ao peão do rei com um lance calmo de peão.',
                                      children: [
                                        {
                                          san: 'd6',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'O-O',
                                              by: 'user',
                                              explanation:
                                                'Esse lance especial, o roque, leva o rei para o canto, protegido pelos peões, e ao mesmo tempo traz a torre para perto do centro.',
                                              hint: 'Proteja o rei e ative a torre com um único lance especial.',
                                              children: [
                                                {
                                                  san: 'O-O',
                                                  by: 'opponent',
                                                  children: [
                                                    {
                                                      san: 'Re1',
                                                      by: 'user',
                                                      explanation:
                                                        'A torre vai para a coluna do rei, atrás do peão de e4, para protegê-lo e preparar a abertura do centro mais tarde.',
                                                      hint: 'Coloque a torre na coluna do centro, atrás do peão do rei.',
                                                      children: [
                                                        {
                                                          san: 'a6',
                                                          by: 'opponent',
                                                          children: [
                                                            {
                                                              san: 'Bb3',
                                                              by: 'user',
                                                              explanation:
                                                                'O peão preto de a6 ameaça avançar até b5 e expulsar o seu bispo. Recuar para b3 mantém o bispo na mesma diagonal, ainda mirando f7, e fora de perigo.',
                                                              hint: 'Mantenha o bispo na diagonal importante, mas numa casa onde ele não possa ser expulso.',
                                                              children: [
                                                                {
                                                                  san: 'Ba7',
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
                                        {
                                          // Variação 2: as pretas jogam a6 cedo e só depois rocam.
                                          san: 'a6',
                                          by: 'opponent',
                                          variationName: 'Pretas jogam a6 antes do roque',
                                          children: [
                                            {
                                              san: 'O-O',
                                              by: 'user',
                                              explanation:
                                                'Seu plano não muda: o rei vai para o canto, protegido, e a torre chega perto do centro. Ainda não há motivo para pressa com o bispo.',
                                              hint: 'Mesmo com o lance a6, proteja o rei com o roque.',
                                              children: [
                                                {
                                                  san: 'd6',
                                                  by: 'opponent',
                                                  children: [
                                                    {
                                                      san: 'Re1',
                                                      by: 'user',
                                                      explanation:
                                                        'A torre vai para a coluna do rei, atrás do peão de e4. Se as pretas rocarem agora, a posição fica igual à da linha principal.',
                                                      hint: 'Coloque a torre na coluna do centro, atrás do peão do rei.',
                                                      children: [
                                                        {
                                                          san: 'O-O',
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
                                {
                                  // Variação 1: as pretas jogam d6 cedo, e você pode abrir o centro.
                                  san: 'd6',
                                  by: 'opponent',
                                  variationName: 'Pretas jogam d6 cedo',
                                  children: [
                                    {
                                      san: 'd4',
                                      by: 'user',
                                      explanation:
                                        'As pretas não deixaram você jogar o plano calmo, mas agora o centro está pronto: o peão avança e ataca o peão preto de e5.',
                                      hint: 'Faça o avanço que o lance c3 preparou, atacando o peão preto do centro.',
                                      children: [
                                        {
                                          san: 'exd4',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'cxd4',
                                              by: 'user',
                                              explanation:
                                                'Capture de volta com o peão da coluna c. Assim você fica com dois peões no centro (d4 e e4), que é o que você queria.',
                                              hint: 'Recupere o peão com o peão que preparou o avanço.',
                                              children: [
                                                {
                                                  san: 'Bb6',
                                                  by: 'opponent',
                                                  children: [
                                                    {
                                                      san: 'Nc3',
                                                      by: 'user',
                                                      explanation:
                                                        'Desenvolve o cavalo da dama, que protege o peão de e4 e aumenta a sua pressão sobre o centro.',
                                                      hint: 'Traga o cavalo que ainda está em casa para ajudar o centro.',
                                                      children: [
                                                        {
                                                          san: 'Nf6',
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
    },
  ],
}

export default italiana
