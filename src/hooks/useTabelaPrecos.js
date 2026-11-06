import { useEffect, useState } from 'react'
import { buscarTabelaPrecos } from '../services/api.js'

// Busca o valor mínimo da hora-aula de cada titulação.
// Devolve { minimos, carregando, erro }, com minimos no formato { DOUTORADO: 70, ... }.
export default function useTabelaPrecos() {
  const [estado, setEstado] = useState({ minimos: {}, carregando: true, erro: false })

  useEffect(() => {
    let cancelado = false

    buscarTabelaPrecos()
      .then((lista) => {
        if (cancelado) return
        const minimos = Object.fromEntries(
          lista.map(({ titulacao, valorMinimo }) => [titulacao, Number(valorMinimo)]),
        )
        setEstado({ minimos, carregando: false, erro: false })
      })
      .catch(() => {
        if (!cancelado) setEstado({ minimos: {}, carregando: false, erro: true })
      })

    return () => {
      cancelado = true
    }
  }, [])

  return estado
}