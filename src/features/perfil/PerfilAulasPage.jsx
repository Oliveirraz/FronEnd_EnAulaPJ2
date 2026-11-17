
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { IconCalendarEvent, IconClock, IconSchool } from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { cadastrarAula, listarAulas, listarMaterias } from '../../services/api.js'
import { formatarMoeda } from '../../utils/formatadores.js'

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

function formatarData(data) {
  if (!data) return 'Data não informada'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarHorario(horario) {
  return horario ? horario.slice(0, 5) : 'Horário não informado'
}

export default function PerfilAulasPage() {
  const [materias, setMaterias] = useState([])
  const [aulas, setAulas] = useState([])
  const [carregandoDados, setCarregandoDados] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

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
      await cadastrarAula(aula)

      reset(VALORES_INICIAIS)

      setSucesso(
        'Aula criada com sucesso. Ela já está disponível na sua área de aulas.'
      )

      await carregarDados()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível criar a aula. Verifique os dados e tente novamente.'
      )
    }
  }

  return (
    <>
      <title>Aulas | EnAula</title>

      <CartaoSecao titulo="Aulas">
        <div className="perfil-aulas">
          <p className="perfil-aulas__descricao">
            Crie aulas para disponibilizá-las aos alunos e acompanhe aqui as
            aulas cadastradas.
          </p>

          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

          <section
            className="perfil-aulas__formulario"
            aria-labelledby="titulo-criar-aula"
          >
            <h3 id="titulo-criar-aula">Criar aula</h3>

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
                  Confirmar criação da aula
                </Button>
              </div>
            </form>
          </section>

          <section
            className="perfil-aulas__listagem"
            aria-labelledby="titulo-minhas-aulas"
          >
            <div className="perfil-aulas__cabecalho-lista">
              <h3 id="titulo-minhas-aulas">Minhas aulas</h3>

              {!carregandoDados && (
                <span className="perfil-aulas__quantidade">
                  {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}
                </span>
              )}
            </div>

            {carregandoDados && (
              <p role="status">Carregando suas aulas...</p>
            )}

            {!carregandoDados && aulas.length === 0 && (
              <div className="perfil-aulas__vazio">
                <IconSchool size="2rem" aria-hidden="true" />
                <p>Você ainda não criou nenhuma aula.</p>
              </div>
            )}

            {!carregandoDados && aulas.length > 0 && (
              <ul className="perfil-aulas__lista">
                {aulas.map((aula) => (
                  <li className="perfil-aulas__item" key={aula.id}>
                    <div className="perfil-aulas__informacoes">
                      <h4>
                        {aula.materiaNome ||
                          'Aula sem matéria identificada'}
                      </h4>

                      <p>
                        <IconCalendarEvent
                          size="1rem"
                          aria-hidden="true"
                        />
                        {formatarData(aula.data)}

                        <IconClock size="1rem" aria-hidden="true" />
                        {formatarHorario(aula.horario)} · {aula.duracao}{' '}
                        {aula.duracao === 1 ? 'hora' : 'horas'}
                      </p>

                      <p>
                        {aula.modalidade === 'ONLINE'
                          ? 'Online'
                          : 'Presencial'}{' '}
                        ·{' '}
                        {aula.formato === 'GRUPO'
                          ? 'Em grupo'
                          : 'Individual'}{' '}
                        · {formatarMoeda(aula.valorAula)} por hora-aula
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </CartaoSecao>
    </>
  )
}
