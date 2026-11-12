import { useOutletContext } from 'react-router-dom'
import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import ListaDados from '../../components/ui/ListaDados.jsx'
import './PerfilPage.css'

// Mostra os dados do aluno, buscados pelo layout (useAluno) e entregues pelo Outlet.
export default function PerfilAlunoDadosPage() {
  const { aluno, carregando, erro, tentarDeNovo } = useOutletContext()

  return (
    <>
      <title>Dados do perfil | EnAula</title>
      <CartaoSecao titulo="Dados pessoais">
        {carregando && <p role="status">Carregando os seus dados...</p>}

        {erro && (
          <>
            <Aviso tipo="erro">{erro}</Aviso>
            <div className="perfil__acoes">
              <Button onClick={tentarDeNovo}>Tentar de novo</Button>
            </div>
          </>
        )}

        {aluno && (
          <ListaDados
            itens={[
              { rotulo: 'Nome completo', valor: aluno.nome },
              { rotulo: 'E-mail', valor: aluno.email },
            ]}
          />
        )}
      </CartaoSecao>
    </>
  )
}