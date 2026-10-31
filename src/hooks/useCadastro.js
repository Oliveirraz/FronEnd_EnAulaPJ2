import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api.js'

const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão.'

function mensagemPadrao(status) {
  if (status === 400) return 'Os dados enviados são inválidos. Confira os campos e tente novamente.'
  if (status >= 500) return 'O servidor teve um problema. Tente novamente em instantes.'
  return 'Não foi possível concluir o cadastro. Tente novamente.'
}

// Envia o cadastro, trata os erros do servidor e, no sucesso, vai para o login.
// O estado de "enviando" vem do próprio React Hook Form (isSubmitting).
export default function useCadastro(servico, setError) {
  const navigate = useNavigate()
  const [erroServidor, setErroServidor] = useState('')

  async function enviar(dados, foto) {
    setErroServidor('')

    try {
      await servico(dados, foto)
      navigate('/login', { state: { cadastroConcluido: true } })
    } catch (erro) {
      if (!(erro instanceof ApiError)) {
        setErroServidor(MSG_SEM_CONEXAO)
      } else if (erro.message.toLowerCase().includes('email já cadastrado')) {
        setError(
          'email',
          { type: 'server', message: 'Este e-mail já está cadastrado.' },
          { shouldFocus: true },
        )
      } else {
        setErroServidor(
          erro.status === 400 && erro.message ? erro.message : mensagemPadrao(erro.status),
        )
      }
    }
  }

  return { enviar, erroServidor }
}