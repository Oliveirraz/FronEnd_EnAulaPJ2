
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  IconRefresh,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconBook2,
  IconCalendarEvent,
  IconAlertTriangle,
  IconX,
  IconBan,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'

import {
  listarMinhasMatriculas,
  cancelarMatricula,
} from '../../services/api.js'

import './PerfilMatriculasAlunoPage.css'

// Deve acompanhar enaula.cancelamento.horas-antecedencia
// configurado no application.properties do BackEnd.
const HORAS_ANTECEDENCIA = 24

function normalizarLista(resultado) {
  if (Array.isArray(resultado)) return resultado
  if (Array.isArray(resultado?.content)) return resultado.content
  if (Array.isArray(resultado?.data)) return resultado.data
  if (Array.isArray(resultado?.matriculas)) return resultado.matriculas
  if (Array.isArray(resultado?.resultados)) return resultado.resultados

  return []
}

function statusNormalizado(status) {
  const valor = String(status || '').toUpperCase()

  if (['ACEITA', 'APROVADA', 'APROVADO', 'CONFIRMADA'].includes(valor)) {
    return 'ACEITA'
  }

  if (['RECUSADA', 'REJEITADA', 'REJEITADO'].includes(valor)) {
    return 'RECUSADA'
  }

  if (['CANCELADA', 'CANCELADO'].includes(valor)) {
    return 'CANCELADA'
  }

  return 'PENDENTE'
}

function rotuloStatus(status) {
  return {
    PENDENTE: 'Pendente',
    ACEITA: 'Matrícula aceita',
    RECUSADA: 'Matrícula recusada',
    CANCELADA: 'Cancelada',
  }[status] || 'Pendente'
}

function formatarData(valor) {
  if (!valor) return 'Data não informada'

  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(data.getTime())) return String(valor)

  return data.toLocaleDateString('pt-BR')
}

function dadosAula(matricula) {
  const aula = matricula.aula || matricula.dadosAula || {}

  return {
    materia:
      matricula.materiaNome ||
      (typeof matricula.materia === 'string'
        ? matricula.materia
        : matricula.materia?.nome) ||
      aula.materiaNome ||
      (typeof aula.materia === 'string'
        ? aula.materia
        : aula.materia?.nome) ||
      'Matéria não informada',

    professor:
      matricula.nomeProfessor ||
      matricula.professorNome ||
      aula.nomeProfessor ||
      aula.professor?.nome ||
      'Professor não informado',

    data: matricula.dataAula || matricula.data || aula.data,

    horario: matricula.horario || aula.horario,

    modalidade: matricula.modalidade || aula.modalidade,

    valor:
      matricula.valorAula ??
      matricula.valorHoraAula ??
      matricula.valor ??
      aula.valorAula ??
      aula.valorHoraAula ??
      aula.valor,
  }
}

function formatarValor(valor) {
  if (valor == null || valor === '') {
    return 'Valor não informado'
  }

  const numero = Number(valor)

  return Number.isNaN(numero)
    ? String(valor)
    : numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
}

function dataSolicitacao(matricula) {
  return (
    matricula.dataSolicitacao ||
    matricula.createdAt ||
    matricula.dataCriacao
  )
}

// Calcula a data e o horário de início da aula.
function obterInicioAula(aula) {
  if (!aula.data || !aula.horario) return null

  const data = String(aula.data).slice(0, 10)
  const horario = String(aula.horario).slice(0, 8)

  const inicio = new Date(`${data}T${horario}`)

  return Number.isNaN(inicio.getTime()) ? null : inicio
}

// Verifica as condições de cancelamento.
// O BackEnd continua sendo responsável pela decisão definitiva.
function verificarPrazo(aula) {
  const inicio = obterInicioAula(aula)

  if (!inicio) {
    return {
      permitido: false,
      calculado: false,
      reembolso: false,
      mensagem: 'Não foi possível identificar a data e o horário da aula.',
    }
  }

  const agora = new Date()

  if (agora >= inicio) {
    return {
      permitido: false,
      calculado: true,
      reembolso: false,
      mensagem: 'A aula já começou. Não é mais possível cancelar a matrícula.',
    }
  }

  const limite = new Date(
    inicio.getTime() - HORAS_ANTECEDENCIA * 60 * 60 * 1000
  )

  const dentroDoPrazo = agora <= limite

  return {
    permitido: true,
    calculado: true,
    reembolso: dentroDoPrazo,
    inicio,
    limite,
    mensagem: dentroDoPrazo
      ? `O cancelamento está dentro do prazo de ${HORAS_ANTECEDENCIA} horas previsto para reembolso.`
      : `O cancelamento está fora do prazo de ${HORAS_ANTECEDENCIA} horas. Não haverá reembolso.`,
  }
}

export default function PerfilMatriculasAlunoPage() {
  const [matriculas, setMatriculas] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)

  const [erro, setErro] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  // Matrícula selecionada para cancelamento.
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null)

  // Estado de carregamento do cancelamento.
  const [cancelando, setCancelando] = useState(false)

  const [erroCancelamento, setErroCancelamento] = useState('')

  // =========================================
  // CARREGAR MATRÍCULAS
  // =========================================

  const carregarMatriculas = useCallback(async (silencioso = false) => {
    if (silencioso) {
      setAtualizando(true)
    } else {
      setCarregando(true)
    }

    setErro('')

    try {
      const resposta = await listarMinhasMatriculas()

      const lista = normalizarLista(resposta).map((item) => ({
        ...item,
        statusExibicao: statusNormalizado(item.status),
      }))

      lista.sort((a, b) => {
        const dataA = new Date(dataSolicitacao(a) || 0).getTime()
        const dataB = new Date(dataSolicitacao(b) || 0).getTime()

        return dataB - dataA
      })

      setMatriculas(lista)
    } catch (error) {
      setErro(
        error.message ||
        'Não foi possível consultar suas matrículas.'
      )
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    carregarMatriculas()

    const intervalo = window.setInterval(() => {
      carregarMatriculas(true)
    }, 30000)

    return () => window.clearInterval(intervalo)
  }, [carregarMatriculas])

  // =========================================
  // RESUMO DAS MATRÍCULAS
  // =========================================

  const resumo = useMemo(() => {
    return matriculas.reduce((total, item) => {
      total[item.statusExibicao] =
        (total[item.statusExibicao] || 0) + 1

      return total
    }, {})
  }, [matriculas])

  // =========================================
  // ABRIR TELA DE CONFIRMAÇÃO
  // =========================================

  function abrirConfirmacao(matricula) {
    setMatriculaSelecionada(matricula)
    setErroCancelamento('')
    setMensagemSucesso('')
  }

  // =========================================
  // FECHAR TELA DE CONFIRMAÇÃO
  // =========================================

  function fecharConfirmacao() {
    if (cancelando) return

    setMatriculaSelecionada(null)
    setErroCancelamento('')
  }

  // =========================================
  // CONFIRMAR CANCELAMENTO
  // =========================================

  async function confirmarCancelamento() {
    if (!matriculaSelecionada || cancelando) return

    const status = statusNormalizado(matriculaSelecionada.status)

    if (!['PENDENTE', 'ACEITA'].includes(status)) {
      setErroCancelamento(
        'Esta matrícula não permite mais cancelamento.'
      )
      return
    }

    const aula = dadosAula(matriculaSelecionada)
    const condicao = verificarPrazo(aula)

    if (!condicao.permitido) {
      setErroCancelamento(condicao.mensagem)
      return
    }

    setCancelando(true)
    setErroCancelamento('')

    try {
      const resposta = await cancelarMatricula(
        matriculaSelecionada.id
      )

      // Atualiza o status imediatamente na interface.
      setMatriculas((listaAtual) =>
        listaAtual.map((item) =>
          item.id === matriculaSelecionada.id
            ? {
                ...item,
                status: 'CANCELADA',
                statusExibicao: 'CANCELADA',
                dataDecisao: new Date().toISOString(),
              }
            : item
        )
      )

      setMensagemSucesso(
        resposta || 'Sua matrícula foi cancelada com sucesso.'
      )

      setMatriculaSelecionada(null)

    } catch (error) {
      setErroCancelamento(
        error.message ||
        'Não foi possível cancelar sua matrícula.'
      )
    } finally {
      setCancelando(false)
    }
  }

  return (
    <>
      <title>Minhas matrículas | EnAula</title>

      <main className="matriculas-aluno">

        <CartaoSecao titulo="Minhas matrículas">

          <div className="matriculas-aluno__conteudo">

            <p className="matriculas-aluno__descricao">
              Acompanhe suas solicitações, consulte os detalhes
              das aulas e gerencie seus cancelamentos.
            </p>

            {erro && (
              <Aviso tipo="erro">{erro}</Aviso>
            )}

            {mensagemSucesso && (
              <div
                className="matriculas-aluno__sucesso"
                role="status"
              >
                <IconCircleCheck size="1.3rem" />
                <span>{mensagemSucesso}</span>
                <button
                  type="button"
                  aria-label="Fechar mensagem"
                  onClick={() => setMensagemSucesso('')}
                >
                  <IconX size="1rem" />
                </button>
              </div>
            )}

            <div className="matriculas-aluno__cabecalho">

              <div
                className="matriculas-aluno__resumo"
                aria-live="polite"
              >
                <span>
                  <strong>{matriculas.length}</strong> solicitações
                </span>

                <span>
                  <strong>{resumo.PENDENTE || 0}</strong> pendentes
                </span>

                <span>
                  <strong>{resumo.ACEITA || 0}</strong> aceitas
                </span>

                <span>
                  <strong>{resumo.RECUSADA || 0}</strong> recusadas
                </span>

                <span>
                  <strong>{resumo.CANCELADA || 0}</strong> canceladas
                </span>
              </div>

              <Button
                variante="contorno"
                onClick={() => carregarMatriculas(true)}
                disabled={carregando || atualizando}
                carregando={atualizando}
              >
                <IconRefresh size="1.1rem" />
                Atualizar status
              </Button>

            </div>

            {carregando ? (

              <p role="status">
                Carregando suas solicitações...
              </p>

            ) : matriculas.length === 0 ? (

              <div className="matriculas-aluno__vazio">

                <IconBook2 size="2.5rem" />

                <strong>
                  Você ainda não solicitou matrícula.
                </strong>

                <p>
                  Quando solicitar participação em uma aula,
                  ela aparecerá aqui.
                </p>

                <Link to="/aluno/perfil/buscar-aulas">
                  Buscar aulas disponíveis
                </Link>

              </div>

            ) : (

              <div className="matriculas-aluno__lista">

                {matriculas.map((matricula) => {

                  const aula = dadosAula(matricula)
                  const status = matricula.statusExibicao

                  const StatusIcone =
                    status === 'ACEITA'
                      ? IconCircleCheck
                      : status === 'RECUSADA'
                        ? IconCircleX
                        : status === 'CANCELADA'
                          ? IconBan
                          : IconClock

                  const motivo =
                    matricula.motivoRecusa ||
                    matricula.motivo ||
                    matricula.justificativaRecusa

                  const podeCancelar =
                    status === 'PENDENTE' || status === 'ACEITA'

                  return (

                    <article
                      className="matriculas-aluno__item"
                      key={matricula.id}
                    >

                      <div className="matriculas-aluno__topo">

                        <div>
                          <h3>{aula.materia}</h3>

                          <p>
                            Professor: {aula.professor}
                          </p>
                        </div>

                        <span
                          className={`matriculas-aluno__status matriculas-aluno__status--${status.toLowerCase()}`}
                        >
                          <StatusIcone size="1.1rem" />
                          {rotuloStatus(status)}
                        </span>

                      </div>

                      <div className="matriculas-aluno__detalhes">

                        <span>
                          <strong>Data:</strong>{' '}
                          {formatarData(aula.data)}
                        </span>

                        <span>
                          <strong>Horário:</strong>{' '}
                          {aula.horario
                            ? String(aula.horario).slice(0, 5)
                            : 'Não informado'}
                        </span>

                        <span>
                          <strong>Modalidade:</strong>{' '}
                          {aula.modalidade === 'ONLINE'
                            ? 'Online'
                            : aula.modalidade === 'PRESENCIAL'
                              ? 'Presencial'
                              : 'Não informada'}
                        </span>

                        <span>
                          <strong>Valor:</strong>{' '}
                          {formatarValor(aula.valor)}
                        </span>

                        <span>
                          <strong>Solicitada em:</strong>{' '}
                          {dataSolicitacao(matricula)
                            ? new Date(
                                dataSolicitacao(matricula)
                              ).toLocaleString('pt-BR')
                            : 'Data não informada'}
                        </span>

                      </div>

                      {status === 'PENDENTE' && (
                        <p className="matriculas-aluno__mensagem matriculas-aluno__mensagem--pendente">
                          Sua solicitação foi enviada e está
                          aguardando a análise do professor.
                        </p>
                      )}

                      {status === 'ACEITA' && (
                        <p className="matriculas-aluno__mensagem matriculas-aluno__mensagem--aceita">
                          O professor aceitou sua matrícula.
                          Você já pode se preparar para a aula.
                        </p>
                      )}

                      {status === 'RECUSADA' && (
                        <div className="matriculas-aluno__mensagem matriculas-aluno__mensagem--recusada">

                          <strong>
                            O professor recusou sua solicitação.
                          </strong>

                          {motivo && (
                            <p>Motivo: {motivo}</p>
                          )}

                        </div>
                      )}

                      {status === 'CANCELADA' && (
                        <p className="matriculas-aluno__mensagem matriculas-aluno__mensagem--cancelada">
                          Esta matrícula foi cancelada.
                        </p>
                      )}

                      {podeCancelar && (

                        <div className="matriculas-aluno__acoes">

                          <Button
                            variante="contorno"
                            className="matriculas-aluno__botao-cancelar"
                            onClick={() => abrirConfirmacao(matricula)}
                          >
                            <IconBan size="1.1rem" />
                            Cancelar matrícula
                          </Button>

                        </div>

                      )}

                    </article>
                  )
                })}

              </div>

            )}

          </div>

        </CartaoSecao>

      </main>

      {/* =====================================
          MODAL DE CONFIRMAÇÃO - HU21
      ====================================== */}

      {matriculaSelecionada && (() => {

        const aula = dadosAula(matriculaSelecionada)
        const condicao = verificarPrazo(aula)

        return (

          <div
            className="matricula-cancelamento__fundo"
            onClick={fecharConfirmacao}
          >

            <section
              className="matricula-cancelamento__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-cancelamento"
              onClick={(event) => event.stopPropagation()}
            >

              <div className="matricula-cancelamento__cabecalho">

                <div className="matricula-cancelamento__icone">
                  <IconAlertTriangle size="1.8rem" />
                </div>

                <button
                  type="button"
                  className="matricula-cancelamento__fechar"
                  onClick={fecharConfirmacao}
                  disabled={cancelando}
                  aria-label="Fechar"
                >
                  <IconX size="1.3rem" />
                </button>

              </div>

              <h2 id="titulo-cancelamento">
                Cancelar matrícula?
              </h2>

              <p className="matricula-cancelamento__descricao">
                Você está prestes a cancelar sua participação
                nesta aula. Confira as condições antes de continuar.
              </p>

              <div className="matricula-cancelamento__aula">

                <strong>{aula.materia}</strong>

                <span>
                  Professor: {aula.professor}
                </span>

                <span>
                  <IconCalendarEvent size="1rem" />
                  {formatarData(aula.data)}
                </span>

                <span>
                  <IconClock size="1rem" />
                  {aula.horario
                    ? String(aula.horario).slice(0, 5)
                    : 'Horário não informado'}
                </span>

                <span>
                  Valor da aula: {formatarValor(aula.valor)}
                </span>

              </div>

              <div className="matricula-cancelamento__condicoes">

                <h3>Condições de cancelamento</h3>

                <p>
                  <strong>Prazo:</strong> o cancelamento deve
                  respeitar a antecedência configurada de{' '}
                  {HORAS_ANTECEDENCIA} horas para ter direito
                  ao reembolso previsto na regra.
                </p>

                {!condicao.calculado ? (

                  <div className="matricula-cancelamento__alerta">
                    <IconAlertTriangle size="1.2rem" />
                    <span>{condicao.mensagem}</span>
                  </div>

                ) : !condicao.permitido ? (

                  <div className="matricula-cancelamento__alerta">
                    <IconAlertTriangle size="1.2rem" />
                    <span>{condicao.mensagem}</span>
                  </div>

                ) : condicao.reembolso ? (

                  <div className="matricula-cancelamento__dentro-prazo">
                    <IconCircleCheck size="1.2rem" />
                    <span>{condicao.mensagem}</span>
                  </div>

                ) : (

                  <div className="matricula-cancelamento__alerta">
                    <IconAlertTriangle size="1.2rem" />
                    <span>{condicao.mensagem}</span>
                  </div>

                )}

                <p className="matricula-cancelamento__observacao">
                  O sistema registra o cancelamento e informa
                  a condição de reembolso. O processamento de
                  eventual estorno financeiro não é realizado
                  por este endpoint.
                </p>

              </div>

              {erroCancelamento && (
                <Aviso tipo="erro">
                  {erroCancelamento}
                </Aviso>
              )}

              <div className="matricula-cancelamento__botoes">

                <Button
                  variante="contorno"
                  onClick={fecharConfirmacao}
                  disabled={cancelando}
                >
                  Voltar
                </Button>

                <Button
                  onClick={confirmarCancelamento}
                  disabled={!condicao.permitido || cancelando}
                  carregando={cancelando}
                  className="matricula-aluno__confirmar-cancelamento"
                >
                  Confirmar cancelamento
                </Button>

              </div>

            </section>

          </div>

        )
      })()}

    </>
  )
}
