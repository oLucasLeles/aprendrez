// Abertura Espanhola (Ruy Lopez), linha fechada: brancas, nível 2, linha fixa.
//
// Linha principal: 1.e4 e5 2.Cf3 Cc6 3.Bb5 a6 4.Ba4 Cf6 5.O-O Be7 6.Te1 b5 7.Bb3 d6 8.c3 O-O
// Ela começa com a entrada "Ruy Lopez: Closed" da base do Lichess (código C90).
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
import type { Opening } from '../../chess/openingTree'

const espanhola: Opening = {
  id: 'espanhola',
  name: 'Espanhola (Ruy Lopez)',
  lichessName: 'Ruy Lopez: Closed',
  color: 'white',
  level: 2,
  kind: 'fixed',
  assumedFirstMove: null,
  idea: 'Você aumenta a pressão sobre o cavalo que protege o peão central das pretas e, com calma, monta um centro forte com os peões c3 e d4. É uma abertura de plano longo: nada se resolve de imediato, e quem se prepara melhor ganha espaço e iniciativa.',
  keyIdeas: [
    'O bispo em b5 mira o cavalo de c6, que protege o peão de e5: você pressiona o centro das pretas sem capturar nada ainda.',
    'Rocar cedo deixa o rei seguro, e a torre em e1 protege o peão de e4 para ele aguentar a pressão.',
    'O peão em c3 prepara d4, o avanço que forma um centro grande, e dá ao bispo uma casa segura em c2 ou b3.',
  ],
  tree: [
    {
      san: 'e4',
      by: 'user',
      explanation:
        'O peão avança duas casas e ocupa o centro do tabuleiro (as casas do meio, que dão mais espaço às suas peças). Ele também abre caminho para o bispo e para a dama.',
      hint: 'Comece ocupando o centro com o peão que fica na frente do rei.',
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
                      san: 'Bb5',
                      by: 'user',
                      explanation:
                        'O bispo ataca o cavalo de c6, justamente o que protege o peão de e5. Ainda não há ameaça de capturar, mas você passa a pressionar o centro das pretas. É esse lance que dá nome à abertura (Ruy Lopez era um padre espanhol).',
                      hint: 'Desenvolva o bispo do lado do rei para uma casa de onde ele pressione o defensor do peão preto do centro.',
                      commonMistakes: [
                        {
                          san: 'Nxe5',
                          explanation:
                            'O cavalo captura um peão, mas o peão de e5 está protegido pelo cavalo preto de c6. Você trocaria seu cavalo por um peão e sairia perdendo.',
                        },
                      ],
                      children: [
                        {
                          san: 'a6',
                          by: 'opponent',
                          children: [
                            {
                              san: 'Ba4',
                              by: 'user',
                              explanation:
                                'O bispo recua e continua apontando para o cavalo de c6. Se você capturasse agora, desfaria a pressão; recuando, você mantém a tensão e o bispo fica livre para voltar à diagonal importante.',
                              hint: 'Fuja do peão que ameaça o bispo, mas mantenha-o na mesma diagonal, ainda mirando o cavalo.',
                              commonMistakes: [
                                {
                                  san: 'Bxc6',
                                  explanation:
                                    'Esse lance é possível e jogadores fortes o usam (chama-se Troca), mas você entrega o bispo e as pretas ficam com os dois bispos. Nesta lição o plano é manter a pressão, então o bispo recua.',
                                },
                              ],
                              children: [
                                {
                                  san: 'Nf6',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'O-O',
                                      by: 'user',
                                      explanation:
                                        'Esse lance especial, o roque, leva o rei para o canto, protegido pelos peões, e ao mesmo tempo traz a torre para perto do centro. Você o faz cedo, antes de a posição esquentar.',
                                      hint: 'Proteja o rei e ative a torre com um único lance especial.',
                                      children: [
                                        {
                                          san: 'Be7',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'Re1',
                                              by: 'user',
                                              explanation:
                                                'O cavalo preto de f6 já ataca o peão de e4, e nenhuma peça sua o protege. A torre vai para a coluna do rei, atrás do peão, e resolve isso: agora ele está protegido e você pode seguir com o seu plano.',
                                              hint: 'Coloque a torre na coluna do centro, atrás do peão do rei, para protegê-lo.',
                                              commonMistakes: [
                                                {
                                                  san: 'a3',
                                                  explanation:
                                                    'Esse lance é possível, mas o peão da borda não ajuda o centro nem protege o peão de e4. Falta dar firmeza ao peão do rei antes de pensar nas bordas.',
                                                },
                                              ],
                                              children: [
                                                {
                                                  san: 'b5',
                                                  by: 'opponent',
                                                  children: [
                                                    {
                                                      san: 'Bb3',
                                                      by: 'user',
                                                      explanation:
                                                        'O peão de b5 expulsa o bispo de a4. Recuar para b3 mantém o bispo na diagonal importante, ainda mirando f7, e fora de perigo.',
                                                      hint: 'Mantenha o bispo na diagonal importante, mas numa casa onde ele não possa ser expulso.',
                                                      commonMistakes: [
                                                        {
                                                          san: 'Bxb5',
                                                          explanation:
                                                            'O bispo captura um peão, mas o peão de a6 recaptura. Você trocaria uma peça valiosa por um peão e sairia perdendo.',
                                                        },
                                                      ],
                                                      children: [
                                                        {
                                                          san: 'd6',
                                                          by: 'opponent',
                                                          children: [
                                                            {
                                                              san: 'c3',
                                                              by: 'user',
                                                              explanation:
                                                                'Esse peão prepara o avanço do peão da dama até d4, para formar um centro grande, com dois peões lado a lado (e4 e d4). Ele também dá ao bispo uma casa de retirada, em c2.',
                                                              hint: 'Prepare, com um lance de peão, um avanço no centro que ainda não pode ser feito.',
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
                                                        {
                                                          // Variação 2: as pretas rocam antes de jogar d6 e chegam à mesma posição.
                                                          san: 'O-O',
                                                          by: 'opponent',
                                                          variationName: 'Pretas rocam antes de d6',
                                                          children: [
                                                            {
                                                              san: 'c3',
                                                              by: 'user',
                                                              explanation:
                                                                'Seu plano não muda: o peão c3 prepara o avanço até d4 e dá ao bispo uma casa de retirada. Se as pretas jogarem d6 agora, a posição fica igual à da linha principal.',
                                                              hint: 'Mesmo com o roque das pretas, prepare o avanço do peão da dama.',
                                                              children: [
                                                                {
                                                                  san: 'd6',
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
                                                {
                                                  // Variação 1: as pretas jogam d6 cedo, antes de b5.
                                                  san: 'd6',
                                                  by: 'opponent',
                                                  variationName: 'Pretas jogam d6 cedo',
                                                  children: [
                                                    {
                                                      san: 'c3',
                                                      by: 'user',
                                                      explanation:
                                                        'Sem o lance b5, o seu bispo ainda não precisa recuar. Mesmo assim o plano é o mesmo: o peão c3 prepara o avanço até d4, para formar um centro grande.',
                                                      hint: 'Prepare, com um lance de peão, o avanço no centro que ainda não pode ser feito.',
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

export default espanhola
