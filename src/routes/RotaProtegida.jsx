import { Navigate, Outlet } from 'react-router-dom'
import { lerSessao, limparSessao, sessaoExpirada } from '../services/sessao.js'

// Protege rotas privadas:
// - sem sessão, volta ao login;
// - com o token vencido, limpa a sessão e volta ao login avisando;
// - com a propriedade `tipo`, só esse tipo de conta entra (os outros vão para /inicio).
export default function RotaProtegida({ tipo }) {
  const sessao = lerSessao()

  if (!sessao) return <Navigate to="/login" replace />

  if (sessaoExpirada(sessao)) {
    limparSessao()
    return <Navigate to="/login" replace state={{ sessaoExpirada: true }} />
  }

  if (tipo && sessao.tipo !== tipo) return <Navigate to="/inicio" replace />

  return <Outlet />
}