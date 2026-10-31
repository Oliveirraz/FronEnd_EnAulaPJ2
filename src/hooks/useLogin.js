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
  // O back end responde 400 com "Email ou senha inválidos" para credenciais erradas.
  if ([400, 401, 403].includes(erro.status)) return MSG_CREDENCIAIS
  if (erro.status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.'
  return 'Não foi possível entrar. Tente novamente.'
}

// Faz o login, guarda a sessão e leva para a tela inicial.
// O estado de "enviando" vem do próprio React Hook Form (isSubmitting).
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
      // replace: o botão "voltar" não retorna à tela de login.
      navigate('/inicio', { replace: true })
    } catch (erro) {
      setErroServidor(mensagemDeErro(erro))
    }
  }

  return { enviar, erroServidor }
}