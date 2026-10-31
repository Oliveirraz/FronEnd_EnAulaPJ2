import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { lerSessao, limparSessao } from '../../services/sessao.js'
import './InicioPage.css'

// Página provisória: confirma que o login funcionou e permite sair.
// A tela inicial de verdade será criada em outra etapa.
export default function InicioPage() {
  const navigate = useNavigate()
  const sessao = lerSessao()

  if (!sessao) return <Navigate to="/login" replace />

  function sair() {
    limparSessao()
    navigate('/login', { replace: true })
  }

  return (
    <main className="inicio-provisorio">
      <title>Início | EnAula</title>
      <h1>Olá, {sessao.nome}!</h1>
      <p>Você entrou como {sessao.tipo === 'PROFESSOR' ? 'professor' : 'aluno'}.</p>
      <Button onClick={sair}>Sair</Button>
    </main>
  )
}