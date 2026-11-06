import { IconLogin } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import Aviso from '../../components/ui/Aviso.jsx'
import CabecalhoTela from '../../components/ui/CabecalhoTela.jsx'
import CartaoTela from '../../components/ui/CartaoTela.jsx'
import LoginForm from './LoginForm.jsx'
import './LoginPage.css'

export default function LoginPage() {
  const { state } = useLocation()

  return (
    <>
      <title>Login | EnAula</title>
      <CartaoTela>
        {state?.sessaoExpirada && (
          <div className="login__aviso">
            <Aviso tipo="info">Sua sessão expirou. Entre novamente para continuar.</Aviso>
          </div>
        )}

        {state?.cadastroConcluido && (
          <div className="login__aviso">
            <Aviso tipo="sucesso">Cadastro concluído! Agora você já pode entrar.</Aviso>
          </div>
        )}

        <CabecalhoTela
          Icone={IconLogin}
          titulo="Entrar"
          subtitulo="Acesse sua conta para continuar."
        />
        <LoginForm />

        <p className="login__cadastro">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </CartaoTela>
    </>
  )
}