
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, entrar } from '../services/api.js'
import { salvarSessao } from '../services/sessao.js'

const MSG_CREDENCIAIS =
  'E-mail ou senha incorretos. Confira também se escolheu o tipo de conta certo.'
const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
const MSG_SEM_ARMAZENAMENTO =
  'Não foi possível guardar sua sessão. Verifique se o navegador permite armazenamento.'

function mensagemDeErro(erro) {
  if (!(erro instanceof ApiError)) return MSG_SEM_CONEXAO

  if ([400, 401, 403].includes(erro.status)) return MSG_CREDENCIAIS
  if (erro.status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.'

  return 'Não foi possível entrar. Tente novamente.'
}

export default function useLogin() {
  const navigate = useNavigate()
  const [erroServidor, setErroServidor] = useState('')

  async function enviar(dados) {
    setErroServidor('')

    try {
      const resposta = await entrar(dados)

      if (!salvarSessao(resposta)) {
        setErroServidor(MSG_SEM_ARMAZENAMENTO)
        return
      }

      // Direciona cada tipo de conta para sua respectiva tela.
      if (dados.tipo === 'PROFESSOR') {
        navigate('/perfil', { replace: true })
      } else {
        navigate('/inicio', { replace: true })
      }
    } catch (erro) {
      setErroServidor(mensagemDeErro(erro))
    }
  }

  return { enviar, erroServidor }
}
