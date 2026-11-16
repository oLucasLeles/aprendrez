// Defesa Escandinava: pretas, nível 1, linha fixa, contra 1.e4.
//
// Linha principal: 1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 4.d4 Nf6 5.Nf3 Bf5 6.Bc4 e6 7.Bd2 c6 8.Qe2
// (em português: 1.e4 d5 2.exd5 Dxd5 3.Cc3 Da5 4.d4 Cf6 5.Cf3 Bf5 6.Bc4 e6 7.Bd2 c6 8.De2)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// O primeiro lance das brancas (1.e4) é o "lance assumido": o app o joga sozinho e ele é o
// primeiro nó da árvore, jogado pelo adversário.
import type { Opening } from '../../chess/openingTree'

const escandinava: Opening = {
  id: 'escandinava',
  name: 'Defesa Escandinava',
  lichessName: 'Scandinavian Defense',
  color: 'black',
  level: 1,
  kind: 'fixed',
  assumedFirstMove: 'e4',
  idea: 'Você responde ao peão do rei das brancas atacando o centro de imediato, com o peão da dama. Depois da troca de peões, sua dama sai cedo, mas você a leva para um canto seguro e desenvolve as outras peças com calma.',
  keyIdeas: [
    'Atacar o centro logo no primeiro lance obriga as brancas a decidir o que fazer com o peão de e4.',
    'A dama captura o peão e sai cedo; por isso ela vai para a5, uma casa na lateral onde é difícil as brancas ganharem tempo atacando-a.',
    'O bispo da dama sai para f5, fora da cadeia de peões, antes de você fechar a posição com e6.',
  ],
  tree: [
    {
      san: 'e4',
      by: 'opponent',
      children: [
        {
          san: 'd5',
          by: 'user',
          explanation:
            'O peão da dama avança duas casas e ataca o peão branco de e4. Em vez de esperar, você disputa o centro (as casas do meio do tabuleiro) já no primeiro lance.',
          hint: 'Responda disputando o centro: ataque o peão branco com o peão que fica na frente da dama.',
          commonMistakes: [
            {
              san: 'f5',
              explanation:
                'O peão de f5 fica atacado pelo peão branco de e4, e você perde um peão logo de cara. Além disso, ele deixa o seu rei mais exposto.',
            },
          ],
          children: [
            {
              san: 'exd5',
              by: 'opponent',
              children: [
                {
                  san: 'Qxd5',
                  by: 'user',
                  explanation:
                    'Você recupera o peão capturando com a dama. Assim você fica com o centro livre e as peças brancas ainda não têm ataque nenhum.',
                  hint: 'Recupere o peão que foi capturado usando a peça mais forte do seu lado.',
                  commonMistakes: [
                    {
                      san: 'Nc6',
                      explanation:
                        'Esse lance desenvolve um cavalo, mas não recupera o peão. As brancas podem proteger o peão de d5 com c4 e ficar com um peão a mais.',
                    },
                  ],
                  children: [
                    {
                      san: 'Nc3',
                      by: 'opponent',
                      children: [
                        {
                          san: 'Qa5',
                          by: 'user',
                          explanation:
                            'O cavalo branco ataca a sua dama. Ela recua para a5, uma casa segura que também fica de olho no cavalo de c3. Perder tempo com a dama é o preço dessa abertura, e aqui ele é pequeno.',
                          hint: 'Tire a dama do ataque levando-a para a lateral do tabuleiro, de onde ela ainda observa o cavalo.',
                          commonMistakes: [
                            {
                              san: 'Qxg2',
                              explanation:
                                'A dama captura um peão, mas ele é protegido pelo bispo de f1. As brancas capturam a sua dama, a peça mais valiosa depois do rei.',
                            },
                          ],
                          children: [
                            {
                              san: 'd4',
                              by: 'opponent',
                              children: [
                                {
                                  san: 'Nf6',
                                  by: 'user',
                                  explanation:
                                    'O cavalo do rei sai para uma casa que controla o centro (as casas d5 e e4) e prepara o seu roque, que é o lance especial que protege o rei.',
                                  hint: 'Desenvolva o cavalo do lado do rei, numa casa que ajude a controlar o centro.',
                                  commonMistakes: [
                                    {
                                      san: 'Qxa2',
                                      explanation:
                                        'A dama captura o peão da borda, mas a torre branca de a1 captura a sua dama. Não vale a pena arriscar a dama por um peão.',
                                    },
                                  ],
                                  children: [
                                    {
                                      san: 'Nf3',
                                      by: 'opponent',
                                      children: [
                                        {
                                          san: 'Bf5',
                                          by: 'user',
                                          explanation:
                                            'O bispo da dama sai pela diagonal que passa por fora dos seus peões. Você o desenvolve agora porque, depois de e6, ele ficaria preso atrás dos peões.',
                                          hint: 'Tire o bispo que ficaria trancado atrás dos peões antes de fechar a posição.',
                                          children: [
                                            {
                                              san: 'Bc4',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'e6',
                                                  by: 'user',
                                                  explanation:
                                                    'Esse peão protege o centro, abre caminho para o bispo do rei e fecha a diagonal do bispo branco de c4, que apontava para a sua posição.',
                                                  hint: 'Com um peão do centro, abra caminho para o bispo do rei e bloqueie a diagonal do bispo branco.',
                                                  children: [
                                                    {
                                                      san: 'Bd2',
                                                      by: 'opponent',
                                                      children: [
                                                        {
                                                          san: 'c6',
                                                          by: 'user',
                                                          explanation:
                                                            'O peão de c6 dá firmeza ao centro e deixa a casa d5 bem protegida. Com a posição sólida, você está pronto para rocar e desenvolver o resto das peças.',
                                                          hint: 'Dê mais firmeza ao seu centro com um peão ao lado do rei, mas na coluna do bispo da dama.',
                                                          commonMistakes: [
                                                            {
                                                              san: 'Bxc2',
                                                              explanation:
                                                                'O bispo captura um peão, mas a dama branca captura o bispo de volta. Você trocaria uma peça por um peão.',
                                                            },
                                                          ],
                                                          children: [
                                                            {
                                                              san: 'Qe2',
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
                                      // Variação 2: as brancas trocam a ordem e jogam Bc4 antes do cavalo.
                                      san: 'Bc4',
                                      by: 'opponent',
                                      variationName: 'Brancas jogam Bc4 antes do cavalo',
                                      children: [
                                        {
                                          san: 'Bf5',
                                          by: 'user',
                                          explanation:
                                            'Seu plano não muda: o bispo da dama sai para fora da cadeia de peões antes de você jogar e6. A ordem dos lances das brancas mudou, mas a ideia é a mesma.',
                                          hint: 'Mesmo com o bispo branco já em c4, tire o seu bispo da dama para fora dos peões.',
                                          children: [
                                            {
                                              san: 'Nf3',
                                              by: 'opponent',
                                              children: [
                                                {
                                                  san: 'e6',
                                                  by: 'user',
                                                  explanation:
                                                    'Agora a posição é a mesma da linha principal: o peão protege o centro, abre caminho para o bispo do rei e bloqueia a diagonal do bispo de c4.',
                                                  hint: 'Com um peão do centro, abra caminho para o bispo do rei e bloqueie a diagonal do bispo branco.',
                                                  children: [
                                                    {
                                                      san: 'Bd2',
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
                    {
                      // Variação 1: as brancas desenvolvem o cavalo do rei em vez do cavalo da dama.
                      san: 'Nf3',
                      by: 'opponent',
                      variationName: 'Brancas jogam Cf3 em vez de Cc3',
                      children: [
                        {
                          san: 'Nf6',
                          by: 'user',
                          explanation:
                            'Dessa vez a sua dama não está sendo atacada, então não há pressa em movê-la. Você desenvolve o cavalo do rei, que controla o centro e prepara o roque.',
                          hint: 'Sua dama está em paz: use o tempo para desenvolver o cavalo do lado do rei.',
                          children: [
                            {
                              san: 'd4',
                              by: 'opponent',
                              children: [
                                {
                                  san: 'Bg4',
                                  by: 'user',
                                  explanation:
                                    'O bispo da dama sai pela diagonal de fora e pressiona o cavalo de f3, que protege o peão branco do centro. Assim você desenvolve uma peça e incomoda as brancas ao mesmo tempo.',
                                  hint: 'Desenvolva o bispo da dama para uma casa de onde ele pressione o cavalo que protege o centro branco.',
                                  children: [
                                    {
                                      san: 'Be2',
                                      by: 'opponent',
                                      children: [
                                        {
                                          san: 'e6',
                                          by: 'user',
                                          explanation:
                                            'O peão protege o centro e abre caminho para o bispo do rei, que vai ajudar a proteger o rei depois do roque.',
                                          hint: 'Abra caminho para o bispo do rei com um peão do centro.',
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
}

export default escandinava
