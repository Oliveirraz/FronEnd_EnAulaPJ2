
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconBook2,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDeviceFloppy,
  IconMapPin,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import {
  buscarAulas,
  solicitarMatricula,
} from '../../services/api.js'
import { formatarMoeda } from '../../utils/formatadores.js'

import './SelecionarAulasPage.css'

const FILTROS_INICIAIS = {
  materiaId: '',
  professorId: '',
  valorMinimo: '',
  valorMaximo: '',
  modalidade: '',
}

function formatarData(data) {
  if (!data) return 'Data não informada'

  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHorario(horario) {
  return horario ? horario.slice(0, 5) : 'Horário não informado'
}

export default function SelecionarAulasPage() {
  const [aulas, setAulas] = useState([])
  const [selecionadas, setSelecionadas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarAulas = useCallback(async () => {
    setCarregando(true)
    setErro('')
    setMensagem('')

    try {
      const resposta = await buscarAulas(FILTROS_INICIAIS)

      const lista = Array.isArray(resposta?.resultados)
        ? resposta.resultados
        : []

      setAulas(lista)
    } catch (error) {
      setAulas([])

      const mensagemErro = error.message || ''

      if (
        mensagemErro.toLowerCase().includes('localização') ||
        mensagemErro.toLowerCase().includes('localizacao')
      ) {
        setErro(
          'Para visualizar as aulas disponíveis, primeiro cadastre sua localização.'
        )
      } else {
        setErro(
          mensagemErro ||
            'Não foi possível carregar as aulas. Tente novamente.'
        )
      }
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarAulas()
  }, [carregarAulas])

  function alternarSelecao(aulaId) {
    setSelecionadas((atuais) => {
      if (atuais.includes(aulaId)) {
        return atuais.filter((id) => id !== aulaId)
      }

      return [...atuais, aulaId]
    })

    setMensagem('')
    setErro('')
  }

  async function salvarSelecao() {
    if (selecionadas.length === 0) {
      setErro('Selecione pelo menos uma aula antes de salvar.')
      return
    }

    setSalvando(true)
    setErro('')
    setMensagem('')

    const aulasSelecionadas = aulas.filter((aula) =>
      selecionadas.includes(aula.aulaId)
    )

    const resultados = await Promise.allSettled(
      aulasSelecionadas.map((aula) =>
        solicitarMatricula(aula.aulaId)
      )
    )

    const quantidadeSucesso = resultados.filter(
      (resultado) => resultado.status === 'fulfilled'
    ).length

    const quantidadeFalha = resultados.length - quantidadeSucesso

    const idsComFalha = aulasSelecionadas
      .filter((aula, indice) =>
        resultados[indice].status === 'rejected'
      )
      .map((aula) => aula.aulaId)

    setSelecionadas(idsComFalha)

    if (quantidadeSucesso > 0) {
      setMensagem(
        `${quantidadeSucesso} solicitação(ões) de matrícula enviada(s) com sucesso! Aguarde a confirmação do professor.`
      )
    }

    if (quantidadeFalha > 0) {
      setErro(
        `${quantidadeFalha} aula(s) não puderam ser cadastradas. Verifique se já existe uma solicitação de matrícula para alguma delas.`
      )
    }

    if (quantidadeSucesso === 0 && quantidadeFalha === 0) {
      setErro('Nenhuma solicitação foi enviada.')
    }

    setSalvando(false)
  }

  return (
    <>
      <title>Selecionar aulas | EnAula</title>

      <main className="selecionar-aulas">
        <CartaoSecao titulo="Seleção de aulas">
          <div className="selecionar-aulas__conteudo">

            <div className="selecionar-aulas__apresentacao">
              <div className="selecionar-aulas__icone">
                <IconBook2 size="2rem" aria-hidden="true" />
              </div>

              <div>
                <h2>Escolha suas aulas</h2>

                <p>
                  Selecione as aulas em que deseja se matricular.
                  Inicialmente, o catálogo é voltado à preparação para o ENEM.
                </p>
              </div>
            </div>

            <div className="selecionar-aulas__informacao">
              <strong>Como funciona?</strong>

              <p>
                Marque as aulas desejadas e clique em
                <strong> Salvar alterações</strong>. Sua solicitação será
                enviada ao professor responsável. A matrícula ficará
                pendente até que ele aceite ou recuse.
              </p>
            </div>

            {erro && (
              <Aviso tipo="erro">
                {erro}
              </Aviso>
            )}

            {mensagem && (
              <Aviso tipo="sucesso">
                {mensagem}
              </Aviso>
            )}

            {erro.includes('localização') && (
              <Link
                className="selecionar-aulas__link-localizacao"
                to="/aluno/perfil/buscar-aulas"
              >
                <IconMapPin size="1.1rem" />
                Cadastrar minha localização
              </Link>
            )}

            {carregando && (
              <p className="selecionar-aulas__estado" role="status">
                Carregando aulas disponíveis...
              </p>
            )}

            {!carregando && aulas.length === 0 && !erro && (
              <Aviso tipo="info">
                Não existem aulas disponíveis no momento.
                Volte mais tarde para consultar novas opções.
              </Aviso>
            )}

            {!carregando && aulas.length > 0 && (
              <>
                <div className="selecionar-aulas__cabecalho-lista">
                  <div>
                    <h3>Aulas disponíveis</h3>
                    <p>
                      Marque as aulas que deseja solicitar.
                    </p>
                  </div>

                  <span className="selecionar-aulas__contador">
                    {selecionadas.length} selecionada(s)
                  </span>
                </div>

                <div className="selecionar-aulas__lista">
                  {aulas.map((aula) => {
                    const marcada = selecionadas.includes(aula.aulaId)

                    return (
                      <label
                        className={[
                          'selecionar-aulas__card',
                          marcada
                            ? 'selecionar-aulas__card--selecionada'
                            : '',
                        ].filter(Boolean).join(' ')}
                        key={aula.aulaId}
                      >
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={() => alternarSelecao(aula.aulaId)}
                          disabled={salvando}
                        />

                        <div className="selecionar-aulas__card-conteudo">
                          <div className="selecionar-aulas__card-topo">
                            <div>
                              <span className="selecionar-aulas__materia">
                                {aula.materia}
                              </span>

                              <p className="selecionar-aulas__professor">
                                Professor: {aula.nomeProfessor}
                              </p>
                            </div>

                            <strong className="selecionar-aulas__preco">
                              {formatarMoeda(aula.valorHoraAula)}
                              <small>por hora</small>
                            </strong>
                          </div>

                          <div className="selecionar-aulas__detalhes">
                            <span>
                              <IconCalendar size="1rem" />
                              {formatarData(aula.data)}
                            </span>

                            <span>
                              <IconClock size="1rem" />
                              {formatarHorario(aula.horario)}
                            </span>

                            <span>
                              {aula.modalidade === 'PRESENCIAL'
                                ? 'Presencial'
                                : 'Online'}
                            </span>

                            <span>
                              Duração: {aula.duracao}{' '}
                              {aula.duracao === 1 ? 'hora' : 'horas'}
                            </span>
                          </div>
                        </div>

                        {marcada && (
                          <IconCheck
                            className="selecionar-aulas__check"
                            size="1.4rem"
                            aria-label="Aula selecionada"
                          />
                        )}
                      </label>
                    )
                  })}
                </div>

                <div className="selecionar-aulas__rodape">
                  <span>
                    {selecionadas.length === 0
                      ? 'Nenhuma aula selecionada.'
                      : `${selecionadas.length} aula(s) pronta(s) para envio.`}
                  </span>

                  <Button
                    type="button"
                    carregando={salvando}
                    disabled={selecionadas.length === 0 || salvando}
                    onClick={salvarSelecao}
                  >
                    <IconDeviceFloppy size="1.2rem" />
                    {salvando
                      ? 'Salvando...'
                      : 'Salvar alterações'}
                  </Button>
                </div>
              </>
            )}

            <button
              type="button"
              className="selecionar-aulas__atualizar"
              onClick={carregarAulas}
              disabled={carregando || salvando}
            >
              Atualizar aulas disponíveis
            </button>
          </div>
        </CartaoSecao>
      </main>
    </>
  )
}
