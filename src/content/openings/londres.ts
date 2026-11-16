// Sistema Londres: brancas, nível 1, SISTEMA (a ordem de alguns lances é flexível).
//
// Linha principal: 1.d4 d5 2.Nf3 Nf6 3.Bf4 c5 4.e3 Nc6 5.Nbd2 e6 6.c3 Bd6 7.Bg3 O-O 8.Bd3 b6
// (em português: 1.d4 d5 2.Cf3 Cf6 3.Bf4 c5 4.e3 Cc6 5.Cbd2 e6 6.c3 Bd6 7.Bg3 O-O 8.Bd3 b6)
// Os lances ficam em SAN (notação inglesa interna); a tradução para o português é só para exibir.
// Em cada nó, o PRIMEIRO filho é a linha principal e os outros filhos do adversário são variações.
//
// Por ser um sistema, este arquivo tem uma ALTERNATIVA DE ORDEM aceita, escrita à mão (SPEC, seção 5):
// depois de 4...Nc6 a pessoa pode jogar 5.c3 antes de 5.Nbd2, porque as duas ordens chegam à mesma
// posição depois de 6...e6. Essa alternativa é mais um galho do lance da pessoa, com a justificativa
// na própria explicação. A base do Lichess tem a entrada "Queen's Pawn Game: London System"
// (1.d4 d5 2.Nf3 Nf6 3.Bf4 c5 4.e3 Nc6 5.Nbd2 e6 6.c3), e toda linha abaixo começa com ela
// ou com "…London System, with e6" (1.d4 d5 2.Nf3 e6 3.Bf4), ambas com o mesmo nome base.
import type { OpeningNode, Opening } from '../../chess/openingTree'

/**
 * A continuação depois que a estrutura está montada (peões em d4, e3 e c3; cavalos em f3 e d2):
 * 6...Bd6 7.Bg3 O-O 8.Bd3 b6. As duas ordens da linha principal terminam aqui.
 * É uma função (e não um valor) para cada galho receber os seus próprios nós.
 */
function buildStructureEnd(): OpeningNode[] {
  return [
    {
      san: 'Bd6',
      by: 'opponent',
      children: [
        {
          san: 'Bg3',
          by: 'user',
          explanation:
            'O bispo preto ataca o seu bispo de f4. Você o recua para g3, onde ele continua na mesma diagonal e fica protegido pelo peão de h2. Assim você não perde o bispo e, se as pretas o trocarem, você recaptura com o peão e ganha uma coluna aberta para a torre.',
          hint: 'Seu bispo da dama está sendo atacado: recue-o um passo, mantendo-o na mesma diagonal e protegido pelos peões.',
          children: [
            {
              san: 'O-O',
              by: 'opponent',
              children: [
                {
                  san: 'Bd3',
                  by: 'user',
                  explanation:
                    'O bispo do rei sai para d3 e aponta para o lado do rei preto. Com os dois bispos, o cavalo e os peões bem colocados, a sua estrutura está completa. Agora falta só rocar (o lance especial que protege o rei) e escolher um plano.',
                  hint: 'Desenvolva o bispo do rei para uma casa da diagonal que aponta para o lado do rei adversário.',
                  children: [{ san: 'b6', by: 'opponent', children: [] }],
                },
              ],
            },
          ],
        },
      ],
    },
  ]
}

const londres: Opening = {
  id: 'londres',
  name: 'Sistema Londres',
  lichessName: "Queen's Pawn Game: London System",
  color: 'white',
  level: 1,
  kind: 'system',
  assumedFirstMove: null,
  idea: 'Você monta quase sempre o mesmo esquema de peças, sem precisar decorar muita teoria: peões em d4, e3 e c3, o bispo da dama fora da corrente de peões e os cavalos em f3 e d2. Como o esquema serve contra várias respostas, é uma boa abertura para quem está começando.',
  keyIdeas: [
    'O bispo da dama sai para f4 antes de você jogar e3. Se o peão vier primeiro, o bispo fica preso atrás dele.',
    'Os peões de d4, e3 e c3 formam uma estrutura firme que protege o centro e quase nunca precisa mudar.',
    'Em um sistema, a ordem de alguns lances é flexível: o importante é chegar à mesma posição.',
  ],
  tree: [
    {
      san: 'd4',
      by: 'user',
      explanation:
        'O peão da dama avança duas casas e ocupa o centro (as casas do meio do tabuleiro). Ele libera o bispo da dama e a dama para entrarem em jogo.',
      hint: 'Ocupe o centro avançando o peão que fica na frente da dama.',
      commonMistakes: [
        {
          san: 'h3',
          explanation:
            'Esse peão da borda não ocupa o centro nem libera nenhuma peça. É um lance lento no momento em que as pretas estão tomando espaço.',
        },
      ],
      children: [
        {
          san: 'd5',
          by: 'opponent',
          children: [
            {
              san: 'Nf3',
              by: 'user',
              explanation:
                'O cavalo do rei sai para uma casa que protege o peão de d4 e prepara o roque. Cavalos costumam ser desenvolvidos antes dos bispos.',
              hint: 'Desenvolva o cavalo do lado do rei, numa casa que ajude a proteger o seu peão do centro.',
              commonMistakes: [
                {
                  san: 'Qd3',
                  explanation:
                    'A dama sai cedo demais e ainda tampa a casa do bispo do rei. Peças menores podem atacá-la e você perde tempo tendo que movê-la de novo.',
                },
              ],
              children: [
                {
                  san: 'Nf6',
                  by: 'opponent',
                  children: [
                    {
                      san: 'Bf4',
                      by: 'user',
                      explanation:
                        'Este é o lance que dá nome ao sistema. O bispo da dama sai para f4, fora da corrente de peões, e fica de olho na diagonal que vai até o lado da dama preta. Ele precisa sair agora, antes do peão de e3.',
                      hint: 'Tire o bispo da dama para fora da corrente de peões, antes de fechar a diagonal dele.',
                      commonMistakes: [
                        {
                          san: 'e3',
                          explanation:
                            'O peão de e3 fecha a diagonal do bispo da dama, que fica preso atrás dele. No sistema Londres o bispo precisa sair primeiro e o peão vem depois.',
                        },
                      ],
                      children: [
                        {
                          san: 'c5',
                          by: 'opponent',
                          children: [
                            {
                              san: 'e3',
                              by: 'user',
                              explanation:
                                'Agora o peão de e3 pode vir, porque o bispo já está fora. Ele protege o bispo de f4 e abre a diagonal do bispo do rei.',
                              hint: 'Agora que o bispo da dama está fora, use um peão central para protegê-lo e abrir caminho para o bispo do rei.',
                              commonMistakes: [
                                {
                                  san: 'g4',
                                  explanation:
                                    'O peão avança, mas fica sem proteção e pode ser capturado pelo cavalo ou pelo bispo preto. Além disso, ele enfraquece as casas em volta do seu rei.',
                                },
                              ],
                              children: [
                                {
                                  san: 'Nc6',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'Nbd2',
                                      by: 'user',
                                      explanation:
                                        'O cavalo da dama sai para d2. Ele ajuda a controlar o centro (a casa e4) e deixa o peão de c livre para avançar até c3.',
                                      hint: 'Desenvolva o cavalo da dama para uma casa que não atrapalhe os peões nem o bispo.',
                                      children: [
                                        {
                                          san: 'e6',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'c3',
                                              by: 'user',
                                              explanation:
                                                'O peão de c3 protege o peão de d4 e completa a estrutura do sistema. Com ele, o centro das brancas fica firme contra os ataques das pretas.',
                                              hint: 'Complete a estrutura de peões protegendo o peão de d4 com o peão da coluna do bispo da dama.',
                                              children: buildStructureEnd(),
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      // ALTERNATIVA DE ORDEM aceita: c3 antes de Nbd2.
                                      san: 'c3',
                                      by: 'user',
                                      explanation:
                                        'Esta ordem também vale: você joga o peão de c3 agora e o cavalo de d2 no lance seguinte. Os dois lances são necessários nos dois jeitos, e depois de 5...e6 6.Cbd2 você chega exatamente à mesma posição da linha principal.',
                                      hint: 'Você pode completar a estrutura de peões antes de desenvolver o cavalo da dama.',
                                      children: [
                                        {
                                          san: 'e6',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'Nbd2',
                                              by: 'user',
                                              explanation:
                                                'Agora o cavalo da dama sai para d2, e a posição fica igual à da linha principal. Só a ordem dos lances foi diferente.',
                                              hint: 'Falta desenvolver o cavalo da dama para completar o esquema.',
                                              children: buildStructureEnd(),
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  // Variação 2: as pretas jogam e6 antes do cavalo de c6. Acaba na mesma posição da linha principal.
                                  san: 'e6',
                                  by: 'opponent',
                                  variationName: 'Pretas jogam e6 antes de Cc6',
                                  children: [
                                    {
                                      san: 'Nbd2',
                                      by: 'user',
                                      explanation:
                                        'Você continua o mesmo plano: o cavalo da dama sai para d2. A ordem dos lances das pretas mudou (e6 antes de Cc6), mas o seu esquema não muda.',
                                      hint: 'Desenvolva o cavalo da dama para uma casa que não atrapalhe os peões nem o bispo.',
                                      children: [
                                        {
                                          san: 'Nc6',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'c3',
                                              by: 'user',
                                              explanation:
                                                'Agora a posição é a mesma da linha principal: o peão de c3 protege o peão de d4 e completa a estrutura do sistema.',
                                              hint: 'Complete a estrutura de peões protegendo o peão de d4 com o peão da coluna do bispo da dama.',
                                              children: buildStructureEnd(),
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
                          // Variação 1: as pretas jogam e6 em vez de c5 e levam o bispo do rei para d6.
                          san: 'e6',
                          by: 'opponent',
                          variationName: 'Pretas jogam e6 em vez de c5',
                          children: [
                            {
                              san: 'e3',
                              by: 'user',
                              explanation:
                                'A estrutura é a mesma: o peão de e3 protege o bispo e abre a diagonal do bispo do rei. Não importa se as pretas jogaram c5 ou e6, você monta o mesmo esquema.',
                              hint: 'Monte a mesma estrutura de sempre, com o peão que protege o bispo da dama e abre caminho para o bispo do rei.',
                              children: [
                                {
                                  san: 'Bd6',
                                  by: 'opponent',
                                  children: [
                                    {
                                      san: 'Bg3',
                                      by: 'user',
                                      explanation:
                                        'O bispo preto ataca o seu bispo de f4. Você o recua para g3, onde ele fica protegido e continua na mesma diagonal, em vez de aceitar uma troca que não precisa.',
                                      hint: 'Seu bispo da dama está sendo atacado: recue-o um passo, mantendo-o na mesma diagonal.',
                                      children: [
                                        {
                                          san: 'O-O',
                                          by: 'opponent',
                                          children: [
                                            {
                                              san: 'Bd3',
                                              by: 'user',
                                              explanation:
                                                'O bispo do rei sai para d3, apontando para o lado do rei preto. Os seus dois bispos agora trabalham juntos na mesma direção.',
                                              hint: 'Desenvolva o bispo do rei para a diagonal que aponta para o lado do rei adversário.',
                                              children: [{ san: 'c5', by: 'opponent', children: [] }],
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

export default londres
