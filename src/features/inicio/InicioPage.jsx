
import { Link, Navigate, useNavigate } from 'react-router-dom'

import Button from '../../components/ui/Button.jsx'
import { lerSessao, limparSessao } from '../../services/sessao.js'

import './InicioPage.css'

// Página inicial com acesso às funcionalidades conforme o perfil.
export default function InicioPage() {
  const navigate = useNavigate()
  const sessao = lerSessao()

  if (!sessao) {
    return <Navigate to="/login" replace />
  }

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <main className="inicio-provisorio">
      <title>Início | EnAula</title>

      <h1>Olá, {sessao.nome}!</h1>

      <p>
        Você entrou como{' '}
        {sessao.tipo === 'PROFESSOR' ? 'professor' : 'aluno'}.
      </p>

      {/* Opções do professor */}
      {sessao.tipo === 'PROFESSOR' && (
        <Link to="/perfil">
          Meu perfil
        </Link>
      )}

      {/* Opções do aluno */}
      {sessao.tipo === 'ALUNO' && (
        <>
          <Link to="/aluno/buscar-aulas">
            Buscar aulas
          </Link>

          <Link to="/aluno/perfil">
            Meu perfil
          </Link>
        </>
      )}

      <Button onClick={sair}>
        Sair
      </Button>
    </main>
  )
}
