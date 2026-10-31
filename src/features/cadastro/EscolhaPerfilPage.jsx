import { IconChalkboard, IconSchool } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import './EscolhaPerfilPage.css'

const PERFIS = [
  {
    rota: '/cadastro/aluno',
    titulo: 'Sou aluno',
    descricao: 'Assista às aulas e acesse os materiais.',
    Icone: IconSchool,
  },
  {
    rota: '/cadastro/professor',
    titulo: 'Sou professor',
    descricao: 'Ministre aulas e organize suas matérias.',
    Icone: IconChalkboard,
  },
]

export default function EscolhaPerfilPage() {
  return (
    <>
      <title>Cadastro | EnAula</title>
      <h1 className="escolha__titulo">Como você quer usar o EnAula?</h1>

      <ul className="escolha__lista">
        {PERFIS.map(({ rota, titulo, descricao, Icone }) => (
          <li key={rota}>
            <Link className="escolha__cartao" to={rota}>
              <span className="escolha__icone" aria-hidden="true">
                <Icone size="1.5rem" />
              </span>
              <span className="escolha__texto">
                <span className="escolha__cartao-titulo">{titulo}</span>
                <span className="escolha__cartao-descricao">{descricao}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="escolha__login">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </>
  )
}