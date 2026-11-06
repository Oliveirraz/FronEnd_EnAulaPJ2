import { useOutletContext } from 'react-router-dom'
import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import ListaDados from '../../components/ui/ListaDados.jsx'
import { rotuloDaTitulacao } from '../../constants/titulacoes.js'
import { formatarMoeda } from '../../utils/formatadores.js'
import './PerfilPage.css'

// Mostra os dados do professor, buscados pelo layout (useProfessor) e entregues pelo Outlet.
export default function PerfilDadosPage() {
  const { professor, carregando, erro, tentarDeNovo } = useOutletContext()

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

        {professor && (
          <ListaDados
            itens={[
              { rotulo: 'Nome completo', valor: professor.nome },
              { rotulo: 'E-mail', valor: professor.email },
              { rotulo: 'Titulação', valor: rotuloDaTitulacao(professor.titulacao) },
              { rotulo: 'Valor da hora-aula', valor: formatarMoeda(professor.valorHoraAula) },
            ]}
          />
        )}
      </CartaoSecao>
    </>
  )
}