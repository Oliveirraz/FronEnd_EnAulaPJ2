import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  IconBook2,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import CartaoSecao from '../../components/ui/CartaoSecao.jsx'
import Input from '../../components/ui/Input.jsx'

import {
  listarMaterias,
  cadastrarMateria,
  atualizarMateria,
  excluirMateria,
} from '../../services/api.js'

import './PerfilMateriasPage.css'

const VALORES_INICIAIS = {
  nome: '',
  descricao: '',
}

export default function PerfilMateriasPage() {
  const [materias, setMaterias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [materiaEditando, setMateriaEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const ITENS_POR_PAGINA = 10

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: VALORES_INICIAIS,
  })

  const carregarMaterias = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await listarMaterias()
      setMaterias(Array.isArray(resposta) ? resposta : [])
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível carregar suas matérias. Tente novamente.',
      )
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarMaterias()
  }, [carregarMaterias])

  async function aoEnviar({ nome, descricao }) {
    setErro('')
    setSucesso('')

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim(),
    }

    try {
      if (materiaEditando) {
        await atualizarMateria(materiaEditando.id, dados)
        setSucesso('Matéria atualizada com sucesso.')
      } else {
        await cadastrarMateria(dados)
        setSucesso('Matéria cadastrada com sucesso.')
      }

      reset(VALORES_INICIAIS)
      setMateriaEditando(null)
      await carregarMaterias()
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a matéria.')
    }
  }

  function editarMateria(materia) {
    setMateriaEditando(materia)

    reset({
      nome: materia.nome ?? '',
      descricao: materia.descricao ?? '',
    })

    setErro('')
    setSucesso('')
  }

  function cancelarEdicao() {
    setMateriaEditando(null)
    reset(VALORES_INICIAIS)
    setErro('')
    setSucesso('')
  }

  async function aoExcluir(materia) {
    const confirmou = window.confirm(
      `Deseja realmente excluir a matéria "${materia.nome}"?`,
    )

    if (!confirmou) return

    setErro('')
    setSucesso('')
    setExcluindo(materia.id)

    try {
      await excluirMateria(materia.id)

      if (materiaEditando?.id === materia.id) {
        cancelarEdicao()
      }

      setSucesso('Matéria excluída com sucesso.')
      await carregarMaterias()
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a matéria.')
    } finally {
      setExcluindo(null)
    }
  }

  const materiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    return materias.filter((materia) =>
      !termo || `${materia.nome ?? ''} ${materia.descricao ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo)
    ).sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '', 'pt-BR'))
  }, [materias, busca])
  const totalPaginas = Math.max(1, Math.ceil(materiasFiltradas.length / ITENS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const materiasDaPagina = materiasFiltradas.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA)

  return (
    <>
      <title>Matérias | EnAula</title>

      <CartaoSecao titulo="Matérias">
        <div className="materias">
          <p className="materias__descricao">
            Cadastre e organize as matérias que você leciona e os assuntos
            abordados em cada uma.
          </p>

          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

          <section className="materias__formulario">
            <h3>
              {materiaEditando ? 'Editar matéria' : 'Cadastrar matéria'}
            </h3>

            <form
              className="formulario"
              onSubmit={handleSubmit(aoEnviar)}
              noValidate
            >
              <div className="formulario__campos">
                <Input
                  rotulo="Nome da matéria"
                  placeholder="Ex.: Matemática"
                  maxLength={120}
                  erro={errors.nome?.message}
                  {...register('nome', {
                    required: 'Informe o nome da matéria.',
                    maxLength: {
                      value: 120,
                      message: 'O nome deve ter no máximo 120 caracteres.',
                    },
                    validate: (valor) =>
                      valor.trim().length > 0 ||
                      'Informe o nome da matéria.',
                  })}
                />

                <div className="campo campo--largo">
                  <label className="campo__rotulo" htmlFor="materia-descricao">
                    Descrição e assuntos
                  </label>

                  <textarea
                    id="materia-descricao"
                    className="campo__controle materias__textarea"
                    placeholder="Ex.: Equações, geometria, funções..."
                    rows={4}
                    maxLength={2000}
                    aria-invalid={errors.descricao ? 'true' : undefined}
                    {...register('descricao', {
                      required: 'Informe a descrição da matéria.',
                      maxLength: {
                        value: 2000,
                        message: 'A descrição deve ter no máximo 2000 caracteres.',
                      },
                      validate: (valor) =>
                        valor.trim().length > 0 ||
                        'Informe a descrição da matéria.',
                    })}
                  />

                  {errors.descricao && (
                    <p className="campo__erro" role="alert">
                      {errors.descricao.message}
                    </p>
                  )}

                  <p className="campo__ajuda">
                    Descreva os conteúdos que você pode ensinar nessa matéria.
                  </p>
                </div>
              </div>

              <div className="materias__botoes">
                <Button type="submit" carregando={isSubmitting}>
                  {materiaEditando ? 'Salvar alterações' : 'Cadastrar matéria'}
                </Button>

                {materiaEditando && (
                  <Button
                    type="button"
                    variante="contorno-claro"
                    className="materias__botao-cancelar"
                    onClick={cancelarEdicao}
                    disabled={isSubmitting}
                  >
                    <IconX size="1.15rem" aria-hidden="true" />
                    Cancelar edição
                  </Button>
                )}
              </div>
            </form>
          </section>

          <section className="materias__listagem">
            <div className="materias__cabecalho-lista">
              <h3>Minhas matérias</h3>
              {!carregando && (
                <span className="materias__quantidade">
                  {materias.length}{' '}
                  {materias.length === 1 ? 'matéria' : 'matérias'}
                </span>
              )}
            </div>

            {!carregando && materias.length > 0 && (
              <div className="materias__busca">
                <label htmlFor="busca-materias">Buscar matéria</label>
                <input
                  id="busca-materias"
                  type="search"
                  value={busca}
                  onChange={(evento) => { setBusca(evento.target.value); setPagina(1) }}
                  placeholder="Digite o nome ou conteúdo da matéria"
                />
                <small>{materiasFiltradas.length} resultado(s)</small>
              </div>
            )}

            {carregando && (
              <p role="status">Carregando suas matérias...</p>
            )}

            {!carregando && materias.length === 0 && (
              <div className="materias__vazio">
                <IconBook2 size="2rem" aria-hidden="true" />
                <p>Você ainda não cadastrou nenhuma matéria.</p>
              </div>
            )}

            {!carregando && materias.length > 0 && materiasFiltradas.length === 0 && (
              <div className="materias__vazio"><p>Nenhuma matéria corresponde à busca.</p></div>
            )}

            {!carregando && materiasFiltradas.length > 0 && (
              <>
              <ul className="materias__lista">
                {materiasDaPagina.map((materia) => (
                  <li className="materias__item" key={materia.id}>
                    <div className="materias__informacoes">
                      <h4>{materia.nome}</h4>
                      <p>{materia.descricao}</p>
                    </div>

                    <div className="materias__acoes">
                      <button
                        type="button"
                        className="materias__acao"
                        onClick={() => editarMateria(materia)}
                        aria-label={`Editar ${materia.nome}`}
                      >
                        <IconEdit size="1.15rem" aria-hidden="true" />
                        Editar
                      </button>

                      <button
                        type="button"
                        className="materias__acao materias__acao--excluir"
                        onClick={() => aoExcluir(materia)}
                        disabled={excluindo === materia.id}
                        aria-label={`Excluir ${materia.nome}`}
                      >
                        <IconTrash size="1.15rem" aria-hidden="true" />
                        {excluindo === materia.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <nav className="materias__paginacao" aria-label="Paginação de matérias">
                <span>Exibindo {(paginaAtual - 1) * ITENS_POR_PAGINA + 1}–{Math.min(paginaAtual * ITENS_POR_PAGINA, materiasFiltradas.length)} de {materiasFiltradas.length}</span>
                <div>
                  <button type="button" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaAtual <= 1}>Anterior</button>
                  <span>Página {paginaAtual} de {totalPaginas}</span>
                  <button type="button" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaAtual >= totalPaginas}>Próxima</button>
                </div>
              </nav>
              </>
            )}
          </section>
        </div>
      </CartaoSecao>
    </>
  )
}