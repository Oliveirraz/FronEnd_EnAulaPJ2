import { IconChalkboard } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import CabecalhoTela from '../../components/ui/CabecalhoTela.jsx'
import CartaoTela from '../../components/ui/CartaoTela.jsx'
import ProfessorForm from './ProfessorForm.jsx'
import './CadastroPage.css'

export default function CadastroProfessorPage() {
  return (
    <>
      <title>Cadastro de professor | EnAula</title>
      <CartaoTela>
        <Link className="cadastro__voltar" to="/cadastro">
          <span aria-hidden="true">←</span> Voltar
        </Link>
        <CabecalhoTela
          Icone={IconChalkboard}
          titulo="Cadastro de professor"
          subtitulo="Preencha seus dados para ministrar aulas e organizar suas matérias."
        />
        <ProfessorForm />
      </CartaoTela>
    </>
  )
}