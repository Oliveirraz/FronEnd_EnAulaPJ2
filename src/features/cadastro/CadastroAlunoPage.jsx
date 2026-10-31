import { IconSchool } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import CabecalhoTela from '../../components/ui/CabecalhoTela.jsx'
import CartaoTela from '../../components/ui/CartaoTela.jsx'
import AlunoForm from './AlunoForm.jsx'
import './CadastroPage.css'

export default function CadastroAlunoPage() {
  return (
    <>
      <title>Cadastro de aluno | EnAula</title>
      <CartaoTela>
        <Link className="cadastro__voltar" to="/cadastro">
          <span aria-hidden="true">←</span> Voltar
        </Link>
        <CabecalhoTela
          Icone={IconSchool}
          titulo="Cadastro de aluno"
          subtitulo="Preencha seus dados para assistir às aulas e acessar os materiais."
        />
        <AlunoForm />
      </CartaoTela>
    </>
  )
}