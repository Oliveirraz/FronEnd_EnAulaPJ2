
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  IconCalendarEvent,
  IconClock,
  IconSchool,
  IconSearch,
  IconEdit,
  IconTrash,
  IconX,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import {
  cadastrarAula,
  listarAulas,
  listarMaterias,
  atualizarAula,
  excluirAula,
} from '../../services/api.js'
import { formatarMoeda } from '../../utils/formatadores.js'
import LocalizacaoProfessor from './LocalizacaoProfessor.jsx'

import './PerfilAulasPage.css'

const VALORES_INICIAIS = {
  materiaId: '',
  data: '',
  horario: '',
  duracao: '1',
  modalidade: '',
  formato: 'INDIVIDUAL',
  valorAula: '',
  quantidadeParticipantes: '1',
}

const OPCOES_MODALIDADE = [
  { valor: 'ONLINE', texto: 'Online' },
  { valor: 'PRESENCIAL', texto: 'Presencial' },
]

const OPCOES_FORMATO = [
  { valor: 'INDIVIDUAL', texto: 'Individual' },
  { valor: 'GRUPO', texto: 'Em grupo' },
]

const ITENS_POR_PAGINA = 8

function formatarData(data) {
  if (!data) return 'Data não informada'

  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHorario(horario) {
  return horario ? String(horario).slice(0, 5) : 'Horário não informado'
}

function obterDataHoraAula(aula) {
  if (!aula.data) return null

  const horario = aula.horario || '00:00:00'
  const dataHora = new Date(`${aula.data}T${horario}`)

  return Number.isNaN(dataHora.getTime()) ? null : dataHora
}

function aulaAindaVaiAcontecer(aula) {
  const dataHora = obterDataHoraAula(aula)

  if (!dataHora) return false

  const fimAula = new Date(
    dataHora.getTime() + (Number(aula.duracao) || 0) * 60 * 60 * 1000
  )

  return fimAula >= new Date()
}

export default function PerfilAulasPage() {
  const [materias, setMaterias] = useState([])
  const [aulas, setAulas] = useState([])
  const [carregandoDados, setCarregandoDados] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [aulaEmEdicao, setAulaEmEdicao] = useState(null)
  const [excluindoId, setExcluindoId] = useState(null)

  const [abaSelecionada, setAbaSelecionada] = useState('PROXIMAS')
  const [pesquisa, setPesquisa] = useState('')
  const [filtroModalidade, setFiltroModalidade] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: VALORES_INICIAIS,
  })

  const formatoSelecionado = useWatch({ control, name: 'formato' })

  const registroFormato = register('formato', {
    required: 'Selecione o formato da aula.',
  })

  const carregarDados = useCallback(async () => {
    setCarregandoDados(true)
    setErro('')

    try {
      const [materiasCarregadas, aulasCarregadas] = await Promise.all([
        listarMaterias(),
        listarAulas(),
      ])

      setMaterias(Array.isArray(materiasCarregadas) ? materiasCarregadas : [])
      setAulas(Array.isArray(aulasCarregadas) ? aulasCarregadas : [])
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar os dados das aulas.')
    } finally {
      setCarregandoDados(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(carregarDados)
  }, [carregarDados])

  function aoAlterarFormato(evento) {
    const formato = evento.target.value

    setValue('formato', formato, { shouldValidate: true })
    setValue('quantidadeParticipantes', formato === 'GRUPO' ? '2' : '1', {
      shouldValidate: true,
    })
  }

  function cancelarEdicao() {
    setAulaEmEdicao(null)
    reset(VALORES_INICIAIS)
    setErro('')
    setSucesso('')
  }

  function iniciarEdicao(aula) {
    setErro('')
    setSucesso('')
    setAulaEmEdicao(aula)

    reset({
      materiaId: String(aula.materiaId ?? ''),
      data: aula.data ?? '',
      horario: String(aula.horario ?? '').slice(0, 5),
      duracao: String(aula.duracao ?? 1),
      modalidade: aula.modalidade ?? '',
      formato: aula.formato ?? 'INDIVIDUAL',
      valorAula: String(aula.valorAula ?? ''),
      quantidadeParticipantes: String(
        aula.quantidadeParticipantes ??
          (aula.formato === 'GRUPO' ? 2 : 1)
      ),
    })

    document
      .getElementById('titulo-formulario-aula')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function aoEnviar(dados) {
    setErro('')
    setSucesso('')

    const aula = {
      materiaId: Number(dados.materiaId),
      data: dados.data,
      horario: dados.horario,
      duracao: Number(dados.duracao),
      modalidade: dados.modalidade,
      formato: dados.formato,
      valorAula: Number(dados.valorAula),
      quantidadeParticipantes: Number(dados.quantidadeParticipantes),
    }

    try {
      if (aulaEmEdicao) {
        await atualizarAula(aulaEmEdicao.id, aula)

        setSucesso('Aula atualizada com sucesso.')
        setAulaEmEdicao(null)
      } else {
        await cadastrarAula(aula)

        setSucesso('Aula criada com sucesso.')
      }

      reset(VALORES_INICIAIS)
      await carregarDados()
    } catch (error) {
      setErro(
        error.message ||
          `Não foi possível ${aulaEmEdicao ? 'atualizar' : 'criar'} a aula.`
      )
    }
  }

  async function aoExcluir(aula) {
    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir a aula de "${aula.materiaNome || 'matéria não identificada'}" do dia ${formatarData(aula.data)}? Esta ação não poderá ser desfeita.`
    )

    if (!confirmado) return

    setErro('')
    setSucesso('')
    setExcluindoId(aula.id)

    try {
      await excluirAula(aula.id)

      if (aulaEmEdicao?.id === aula.id) {
        cancelarEdicao()
      }

      setSucesso('Aula excluída com sucesso.')
      await carregarDados()
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a aula.')
    } finally {
      setExcluindoId(null)
    }
  }

  const aulasOrganizadas = useMemo(() => {
    return [...aulas].sort((a, b) => {
      const dataA = obterDataHoraAula(a)?.getTime() ?? 0
      const dataB = obterDataHoraAula(b)?.getTime() ?? 0

      return dataA - dataB
    })
  }, [aulas])

  const aulasProximas = useMemo(
    () => aulasOrganizadas.filter(aulaAindaVaiAcontecer),
    [aulasOrganizadas]
  )

  const aulasAnteriores = useMemo(
    () => aulasOrganizadas.filter((aula) => !aulaAindaVaiAcontecer(aula)),
    [aulasOrganizadas]
  )

  const aulasDaAba = useMemo(() => {
    if (abaSelecionada === 'PROXIMAS') return aulasProximas
    if (abaSelecionada === 'ANTERIORES') return aulasAnteriores

    return aulasOrganizadas
  }, [abaSelecionada, aulasOrganizadas, aulasProximas, aulasAnteriores])

  const aulasFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase('pt-BR')

    return aulasDaAba.filter((aula) => {
      const nomeMateria = (aula.materiaNome || '').toLocaleLowerCase('pt-BR')

      const correspondePesquisa =
        !termo || nomeMateria.includes(termo)

      const correspondeModalidade =
        !filtroModalidade || aula.modalidade === filtroModalidade

      const correspondeFormato =
        !filtroFormato || aula.formato === filtroFormato

      return (
        correspondePesquisa &&
        correspondeModalidade &&
        correspondeFormato
      )
    })
  }, [aulasDaAba, pesquisa, filtroModalidade, filtroFormato])

  const totalPaginas = Math.max(
    1,
    Math.ceil(aulasFiltradas.length / ITENS_POR_PAGINA)
  )

  const aulasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA

    return aulasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)
  }, [aulasFiltradas, paginaAtual])

  useEffect(() => {
    setPaginaAtual(1)
  }, [abaSelecionada, pesquisa, filtroModalidade, filtroFormato])

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas)
    }
  }, [paginaAtual, totalPaginas])

  function limparFiltros() {
    setPesquisa('')
    setFiltroModalidade('')
    setFiltroFormato('')
    setPaginaAtual(1)
  }

  const existemFiltrosAtivos =
    pesquisa.trim() !== '' ||
    filtroModalidade !== '' ||
    filtroFormato !== ''

  return (
    <>
      <title>Aulas | EnAula</title>

      <CartaoSecao titulo="Aulas">
        <div className="perfil-aulas">
          <p className="perfil-aulas__descricao">
            Crie, atualize, exclua e organize suas aulas em um só lugar.
          </p>

          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

          <LocalizacaoProfessor />

          <section
            className="perfil-aulas__formulario"
            aria-labelledby="titulo-formulario-aula"
          >
            <div className="perfil-aulas__cabecalho-formulario">
              <h3 id="titulo-formulario-aula">
                {aulaEmEdicao ? 'Atualizar aula' : 'Criar aula'}
              </h3>

              {aulaEmEdicao && (
                <button
                  type="button"
                  className="perfil-aulas__cancelar-edicao"
                  onClick={cancelarEdicao}
                >
                  <IconX size="1rem" />
                  Cancelar edição
                </button>
              )}
            </div>

            {materias.length === 0 && !carregandoDados && (
              <Aviso tipo="info">
                Cadastre pelo menos uma matéria na aba Matérias antes de criar
                uma aula.
              </Aviso>
            )}

            <form
              className="perfil-aulas__campos"
              onSubmit={handleSubmit(aoEnviar)}
              noValidate
            >
              <Select
                rotulo="Matéria"
                placeholder="Selecione uma matéria"
                opcoes={materias.map((materia) => ({
                  valor: String(materia.id),
                  texto: materia.nome,
                }))}
                erro={errors.materiaId?.message}
                disabled={
                  carregandoDados || materias.length === 0 || isSubmitting
                }
                {...register('materiaId', {
                  required: 'Selecione uma matéria.',
                })}
              />

              <Input
                rotulo="Data da aula"
                type="date"
                erro={errors.data?.message}
                disabled={isSubmitting}
                {...register('data', {
                  required: 'Informe a data da aula.',
                })}
              />

              <Input
                rotulo="Horário"
                type="time"
                erro={errors.horario?.message}
                disabled={isSubmitting}
                {...register('horario', {
                  required: 'Informe o horário da aula.',
                })}
              />

              <Input
                rotulo="Duração (em horas)"
                type="number"
                min="1"
                step="1"
                erro={errors.duracao?.message}
                ajuda="A duração mínima permitida é de 1 hora."
                disabled={isSubmitting}
                {...register('duracao', {
                  required: 'Informe a duração da aula.',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'A duração mínima da aula é de 1 hora.',
                  },
                  validate: (valor) =>
                    Number.isInteger(valor) ||
                    'Informe a duração em horas inteiras.',
                })}
              />

              <Select
                rotulo="Modalidade"
                opcoes={OPCOES_MODALIDADE}
                placeholder="Selecione a modalidade"
                erro={errors.modalidade?.message}
                disabled={isSubmitting}
                {...register('modalidade', {
                  required: 'Selecione a modalidade da aula.',
                })}
              />

              <Select
                rotulo="Formato da aula"
                opcoes={OPCOES_FORMATO}
                erro={errors.formato?.message}
                disabled={isSubmitting}
                {...registroFormato}
                onChange={(evento) => {
                  registroFormato.onChange(evento)
                  aoAlterarFormato(evento)
                }}
              />

              <Input
                rotulo="Valor da hora-aula (R$)"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 50,00"
                erro={errors.valorAula?.message}
                ajuda="Informe o valor por hora. O sistema validará o mínimo da sua titulação."
                disabled={isSubmitting}
                {...register('valorAula', {
                  required: 'Informe o valor da hora-aula.',
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: 'O valor deve ser maior que zero.',
                  },
                })}
              />

              <Input
                rotulo="Quantidade de participantes"
                type="number"
                min={formatoSelecionado === 'GRUPO' ? '2' : '1'}
                step="1"
                erro={errors.quantidadeParticipantes?.message}
                ajuda={
                  formatoSelecionado === 'GRUPO'
                    ? 'Aula em grupo precisa ter pelo menos 2 participantes.'
                    : 'Aula individual deve ter exatamente 1 participante.'
                }
                readOnly={
                  isSubmitting || formatoSelecionado === 'INDIVIDUAL'
                }
                {...register('quantidadeParticipantes', {
                  required: 'Informe a quantidade de participantes.',
                  valueAsNumber: true,
                  min: {
                    value: formatoSelecionado === 'GRUPO' ? 2 : 1,
                    message:
                      formatoSelecionado === 'GRUPO'
                        ? 'A aula em grupo precisa de pelo menos 2 participantes.'
                        : 'A aula individual deve ter 1 participante.',
                  },
                  validate: (valor) =>
                    Number.isInteger(valor) ||
                    'Informe um número inteiro de participantes.',
                })}
              />

              <div className="perfil-aulas__acoes">
                <Button
                  type="submit"
                  carregando={isSubmitting}
                  disabled={carregandoDados || materias.length === 0}
                >
                  {aulaEmEdicao ? 'Salvar alterações' : 'Confirmar criação da aula'}
                </Button>

                {aulaEmEdicao && (
                  <Button
                    type="button"
                    onClick={cancelarEdicao}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </section>

          <section
            className="perfil-aulas__listagem"
            aria-labelledby="titulo-minhas-aulas"
          >
            <div className="perfil-aulas__cabecalho-lista">
              <div>
                <h3 id="titulo-minhas-aulas">Gerenciar minhas aulas</h3>
                <p className="perfil-aulas__texto-apoio">
                  Pesquise, filtre, edite ou exclua suas aulas.
                </p>
              </div>

              {!carregandoDados && (
                <span className="perfil-aulas__quantidade">
                  {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}
                </span>
              )}
            </div>

            <div className="perfil-aulas__resumo">
              <div className="perfil-aulas__indicador">
                <span className="perfil-aulas__indicador-valor">
                  {aulasProximas.length}
                </span>
                <span className="perfil-aulas__indicador-label">Próximas</span>
              </div>

              <div className="perfil-aulas__indicador">
                <span className="perfil-aulas__indicador-valor">
                  {aulasAnteriores.length}
                </span>
                <span className="perfil-aulas__indicador-label">Anteriores</span>
              </div>

              <div className="perfil-aulas__indicador">
                <span className="perfil-aulas__indicador-valor">
                  {aulas.length}
                </span>
                <span className="perfil-aulas__indicador-label">Total</span>
              </div>
            </div>

            <div className="perfil-aulas__abas" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={abaSelecionada === 'PROXIMAS'}
                className={abaSelecionada === 'PROXIMAS' ? 'ativo' : ''}
                onClick={() => setAbaSelecionada('PROXIMAS')}
              >
                Próximas ({aulasProximas.length})
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={abaSelecionada === 'ANTERIORES'}
                className={abaSelecionada === 'ANTERIORES' ? 'ativo' : ''}
                onClick={() => setAbaSelecionada('ANTERIORES')}
              >
                Anteriores ({aulasAnteriores.length})
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={abaSelecionada === 'TODAS'}
                className={abaSelecionada === 'TODAS' ? 'ativo' : ''}
                onClick={() => setAbaSelecionada('TODAS')}
              >
                Todas ({aulas.length})
              </button>
            </div>

            <div className="perfil-aulas__filtros">
              <label className="perfil-aulas__pesquisa">
                <IconSearch size="1.2rem" aria-hidden="true" />
                <input
                  type="search"
                  value={pesquisa}
                  onChange={(evento) => setPesquisa(evento.target.value)}
                  placeholder="Pesquisar por matéria..."
                  aria-label="Pesquisar aulas por matéria"
                />
              </label>

              <label className="perfil-aulas__filtro">
                <span>Modalidade</span>
                <select
                  value={filtroModalidade}
                  onChange={(evento) => setFiltroModalidade(evento.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="ONLINE">Online</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </label>

              <label className="perfil-aulas__filtro">
                <span>Formato</span>
                <select
                  value={filtroFormato}
                  onChange={(evento) => setFiltroFormato(evento.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GRUPO">Em grupo</option>
                </select>
              </label>

              {existemFiltrosAtivos && (
                <button
                  type="button"
                  className="perfil-aulas__limpar"
                  onClick={limparFiltros}
                >
                  <IconX size="1rem" />
                  Limpar filtros
                </button>
              )}
            </div>

            {carregandoDados && (
              <p role="status">Carregando suas aulas...</p>
            )}

            {!carregandoDados && aulasFiltradas.length === 0 && (
              <div className="perfil-aulas__vazio">
                <IconSchool size="2rem" aria-hidden="true" />
                <p>
                  {aulas.length === 0
                    ? 'Você ainda não criou nenhuma aula.'
                    : 'Nenhuma aula encontrada com esses filtros.'}
                </p>
                {existemFiltrosAtivos && (
                  <button
                    type="button"
                    className="perfil-aulas__limpar"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {!carregandoDados && aulasFiltradas.length > 0 && (
              <>
                <div className="perfil-aulas__resultado">
                  Exibindo{' '}
                  {(paginaAtual - 1) * ITENS_POR_PAGINA + 1} a{' '}
                  {Math.min(
                    paginaAtual * ITENS_POR_PAGINA,
                    aulasFiltradas.length
                  )}{' '}
                  de {aulasFiltradas.length} aulas
                </div>

                <ul className="perfil-aulas__lista">
                  {aulasPaginadas.map((aula) => (
                    <li className="perfil-aulas__item" key={aula.id}>
                      <div className="perfil-aulas__item-cabecalho">
                        <div className="perfil-aulas__informacoes">
                          <h4>
                            {aula.materiaNome ||
                              'Aula sem matéria identificada'}
                          </h4>
                        </div>

                        <span
                          className={`perfil-aulas__status ${
                            aulaAindaVaiAcontecer(aula)
                              ? 'perfil-aulas__status--futura'
                              : 'perfil-aulas__status--anterior'
                          }`}
                        >
                          {aulaAindaVaiAcontecer(aula)
                            ? 'Próxima'
                            : 'Data passada'}
                        </span>
                      </div>

                      <div className="perfil-aulas__detalhes">
                        <p>
                          <IconCalendarEvent size="1rem" aria-hidden="true" />
                          {formatarData(aula.data)}
                        </p>

                        <p>
                          <IconClock size="1rem" aria-hidden="true" />
                          {formatarHorario(aula.horario)} · {aula.duracao}{' '}
                          {aula.duracao === 1 ? 'hora' : 'horas'}
                        </p>
                      </div>

                      <p className="perfil-aulas__modalidade">
                        {aula.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                        {' · '}
                        {aula.formato === 'GRUPO' ? 'Em grupo' : 'Individual'}
                        {' · '}
                        {formatarMoeda(aula.valorAula)} por hora-aula
                      </p>

                      <div className="perfil-aulas__acoes-item">
                        <button
                          type="button"
                          className="perfil-aulas__botao-editar"
                          onClick={() => iniciarEdicao(aula)}
                          disabled={excluindoId === aula.id}
                        >
                          <IconEdit size="1rem" />
                          Editar
                        </button>

                        <button
                          type="button"
                          className="perfil-aulas__botao-excluir"
                          onClick={() => aoExcluir(aula)}
                          disabled={excluindoId === aula.id}
                        >
                          <IconTrash size="1rem" />
                          {excluindoId === aula.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {totalPaginas > 1 && (
                  <nav
                    className="perfil-aulas__paginacao"
                    aria-label="Paginação das aulas"
                  >
                    <button
                      type="button"
                      aria-label="Página anterior"
                      disabled={paginaAtual === 1}
                      onClick={() => setPaginaAtual((pagina) => pagina - 1)}
                    >
                      <IconChevronLeft size="1.1rem" />
                    </button>

                    <span>
                      Página {paginaAtual} de {totalPaginas}
                    </span>

                    <button
                      type="button"
                      aria-label="Próxima página"
                      disabled={paginaAtual === totalPaginas}
                      onClick={() => setPaginaAtual((pagina) => pagina + 1)}
                    >
                      <IconChevronRight size="1.1rem" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </CartaoSecao>
    </>
  )
}
