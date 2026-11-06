// Valores iguais aos do enum TitulacaoProfessor do back end.
export const TITULACOES = [
  { valor: 'GRADUACAO', texto: 'Graduação' },
  { valor: 'ESPECIALIZACAO', texto: 'Especialização' },
  { valor: 'MESTRADO', texto: 'Mestrado' },
  { valor: 'DOUTORADO', texto: 'Doutorado' },
]

// Texto para mostrar na tela (ex.: "DOUTORADO" vira "Doutorado").
export function rotuloDaTitulacao(valor) {
  return TITULACOES.find((titulacao) => titulacao.valor === valor)?.texto ?? ''
}