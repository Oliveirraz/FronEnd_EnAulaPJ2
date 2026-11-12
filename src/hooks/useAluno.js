import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, buscarAluno } from '../services/api.js'
import { lerSessao, limparSessao } from '../services/sessao.js'

const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
const MSG_PADRAO = 'Não foi possível carregar os seus dados. Tente novamente.'

// Busca os dados do aluno logado. Se o token for recusado (401 ou 403), a sessão
// é limpa e a pessoa volta ao login com um aviso. O estado de erro permite tentar de novo.
export default function useAluno() {
  const navigate = useNavigate()
  // A função navigate muda a cada troca de tela; guardá-la numa ref evita buscar os
  // dados de novo toda vez que a pessoa troca de aba.
  const navegarRef = useRef(navigate)
  const [tentativa, setTentativa] = useState(0)
  const [estado, setEstado] = useState({ aluno: null, carregando: true, erro: '' })

  useEffect(() => {
    navegarRef.current = navigate
  })

  useEffect(() => {
    let cancelado = false

    buscarAluno(lerSessao()?.id)
      .then((aluno) => {
        if (!cancelado) setEstado({ aluno, carregando: false, erro: '' })
      })
      .catch((erro) => {
        if (cancelado) return

        if (erro instanceof ApiError && [401, 403].includes(erro.status)) {
          limparSessao()
          navegarRef.current('/login', { replace: true, state: { sessaoExpirada: true } })
          return
        }
        const erroDeRede = !(erro instanceof ApiError)
        setEstado({
          aluno: null,
          carregando: false,
          erro: erroDeRede ? MSG_SEM_CONEXAO : MSG_PADRAO,
        })
      })

    return () => {
      cancelado = true
    }
  }, [tentativa])

  function tentarDeNovo() {
    setEstado({ aluno: null, carregando: true, erro: '' })
    setTentativa((atual) => atual + 1)
  }

  return { ...estado, tentarDeNovo }
}