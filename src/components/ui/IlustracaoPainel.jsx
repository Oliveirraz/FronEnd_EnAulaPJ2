import IlustracaoAluno from './IlustracaoAluno.jsx'
import IlustracaoLogin from './IlustracaoLogin.jsx'
import IlustracaoLousa from './IlustracaoLousa.jsx'
import IlustracaoProfessor from './IlustracaoProfessor.jsx'
import './IlustracaoPainel.css'

const ILUSTRACOES = {
  aluno: IlustracaoAluno,
  professor: IlustracaoProfessor,
  login: IlustracaoLogin,
  lousa: IlustracaoLousa,
}

// Escolhe a ilustração do painel conforme o contexto. Todas são decorativas.
export default function IlustracaoPainel({ tipo = 'lousa' }) {
  const Ilustracao = ILUSTRACOES[tipo] ?? IlustracaoLousa

  return (
    <svg className="ilustracao" viewBox="0 0 240 160" aria-hidden="true" focusable="false">
      <Ilustracao />
    </svg>
  )
}