const FORMATO_MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// 90 vira "R$ 90,00". Valor vazio (null ou undefined) vira texto vazio.
export function formatarMoeda(valor) {
  return valor === null || valor === undefined ? '' : FORMATO_MOEDA.format(valor)
}