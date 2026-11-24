
import { lerSessao } from './sessao.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

async function lerMensagemDoServidor(resposta) {
  const texto = await resposta.text().catch(() => '')

  return texto.trimStart().startsWith('{') ? '' : texto.trim()
}

// =====================================================
// CADASTRO DE ALUNO E PROFESSOR
// =====================================================

async function enviarCadastro(rota, nomeDaParte, dados, foto) {
  const formData = new FormData()

  formData.append(
    nomeDaParte,
    new Blob([JSON.stringify(dados)], {
      type: 'application/json',
    })
  )

  if (foto) {
    formData.append('foto', foto)
  }

  const resposta = await fetch(`${API_URL}/api/${rota}`, {
    method: 'POST',
    body: formData,
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

export function cadastrarAluno(dados, foto) {
  return enviarCadastro('alunos', 'aluno', dados, foto)
}

export function cadastrarProfessor(dados, foto) {
  return enviarCadastro('professores', 'professor', dados, foto)
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

export async function entrar({ email, senha, tipo }) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      senha,
      tipo,
    }),
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

// =====================================================
// REQUISIÇÕES AUTENTICADAS
// =====================================================

async function requisicaoAutenticada(caminho, opcoes = {}) {
  const token = lerSessao()?.token

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  if (resposta.status === 204) {
    return null
  }

  const texto = await resposta.text()

  return texto ? JSON.parse(texto) : null
}

// =====================================================
// ALUNOS
// =====================================================

export function buscarAluno(id) {
  return requisicaoAutenticada(`/api/alunos/${id}`)
}

// =====================================================
// PROFESSORES
// =====================================================

export function buscarProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`)
}

export function atualizarProfessor(id, dados) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

export function excluirProfessor(id) {
  return requisicaoAutenticada(`/api/professores/${id}`, {
    method: 'DELETE',
  })
}

// Atualiza a localização do professor autenticado.
export function atualizarMinhaLocalizacaoProfessor(dados) {
  return requisicaoAutenticada('/api/professores/minha-localizacao', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

// =====================================================
// TABELA DE PREÇOS
// =====================================================

export async function buscarTabelaPrecos() {
  const resposta = await fetch(`${API_URL}/api/tabela-precos`)

  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      await lerMensagemDoServidor(resposta)
    )
  }

  return resposta.json()
}

// =====================================================
// MATÉRIAS - HU05
// =====================================================

export function listarMaterias() {
  return requisicaoAutenticada('/api/materias')
}

export function cadastrarMateria(dados) {
  return requisicaoAutenticada('/api/materias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

export function buscarMateria(id) {
  return requisicaoAutenticada(`/api/materias/${id}`)
}

export function atualizarMateria(id, dados) {
  return requisicaoAutenticada(`/api/materias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

export function excluirMateria(id) {
  return requisicaoAutenticada(`/api/materias/${id}`, {
    method: 'DELETE',
  })
}

// =====================================================
// AULAS - CRIAÇÃO, LISTAGEM, ATUALIZAÇÃO E EXCLUSÃO
// =====================================================

export function listarAulas() {
  return requisicaoAutenticada('/api/aulas')
}

export function cadastrarAula(dados) {
  return requisicaoAutenticada('/api/aulas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

// Atualiza uma aula existente.
export function atualizarAula(id, dados) {
  return requisicaoAutenticada(`/api/aulas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
}

// Exclui uma aula.
export function excluirAula(id) {
  return requisicaoAutenticada(`/api/aulas/${id}`, {
    method: 'DELETE',
  })
}

// =====================================================
// MATERIAIS DE APOIO - HU10
// =====================================================

export function listarMateriaisDaAula(aulaId) {
  if (!aulaId) {
    return Promise.reject(
      new Error('Selecione uma aula para listar os materiais.')
    )
  }

  return requisicaoAutenticada(
    `/api/materiais/aula/${encodeURIComponent(aulaId)}`
  )
}

export function enviarMaterialAula(aulaId, arquivo) {
  if (!aulaId || !arquivo) {
    return Promise.reject(
      new Error('Informe a aula e o arquivo para realizar o envio.')
    )
  }

  const formData = new FormData()

  formData.append('arquivo', arquivo)

  return requisicaoAutenticada(
    `/api/materiais/aula/${encodeURIComponent(aulaId)}`,
    {
      method: 'POST',
      body: formData,
    }
  )
}

export function excluirMaterialApoio(materialId) {
  if (!materialId) {
    return Promise.reject(
      new Error('Informe o material que deseja excluir.')
    )
  }

  return requisicaoAutenticada(
    `/api/materiais/${encodeURIComponent(materialId)}`,
    {
      method: 'DELETE',
    }
  )
}

// =====================================================
// BUSCA DE AULAS - HU05
// =====================================================

export function buscarAulas(filtros = {}) {
  const parametros = new URLSearchParams()

  if (filtros.materiaId) {
    parametros.set('materiaId', filtros.materiaId)
  }

  if (filtros.professorId) {
    parametros.set('professorId', filtros.professorId)
  }

  if (filtros.valorMinimo !== '') {
    parametros.set('valorMinimo', filtros.valorMinimo)
  }

  if (filtros.valorMaximo !== '') {
    parametros.set('valorMaximo', filtros.valorMaximo)
  }

  if (filtros.modalidade) {
    parametros.set('modalidade', filtros.modalidade)

    parametros.set(
      'raioKm',
      filtros.modalidade === 'PRESENCIAL' ? '5' : '100'
    )
  }

  const query = parametros.toString()
  const caminho = `/api/aulas/buscar${query ? `?${query}` : ''}`

  return requisicaoAutenticada(caminho)
}

/**
 * HU06 - Solicita matrícula do aluno em uma aula.
 * O backend registra a solicitação com status PENDENTE.
 */
export function solicitarMatricula(aulaId) {
  if (!aulaId) {
    return Promise.reject(
      new Error('Selecione uma aula válida para solicitar matrícula.')
    )
  }

  return requisicaoAutenticada(
    `/api/aulas/${encodeURIComponent(aulaId)}/matriculas`,
    {
      method: 'POST',
    }
  )
}

// =====================================================
// GERENCIAMENTO DE MATRÍCULAS - HU11
// =====================================================

// Professor consulta as solicitações pendentes de uma aula.
export function listarMatriculasPendentes(aulaId) {
  if (!aulaId) {
    return Promise.reject(
      new Error('Selecione uma aula para consultar as matrículas.')
    )
  }

  return requisicaoAutenticada(
    `/api/aulas/${encodeURIComponent(aulaId)}/matriculas/pendentes`
  )
}

// Professor aceita uma solicitação de matrícula.
export function aceitarMatricula(matriculaId) {
  if (!matriculaId) {
    return Promise.reject(
      new Error('Informe a matrícula que deseja aceitar.')
    )
  }

  return requisicaoAutenticada(
    `/api/matriculas/${encodeURIComponent(matriculaId)}/aceitar`,
    {
      method: 'PATCH',
    }
  )
}

// Professor recusa uma solicitação de matrícula.
export function recusarMatricula(matriculaId, motivo) {
  if (!matriculaId) {
    return Promise.reject(
      new Error('Informe a matrícula que deseja recusar.')
    )
  }

  if (!motivo || !motivo.trim()) {
    return Promise.reject(
      new Error('É obrigatório informar o motivo da recusa.')
    )
  }

  if (motivo.trim().length > 500) {
    return Promise.reject(
      new Error('O motivo deve ter no máximo 500 caracteres.')
    )
  }

  return requisicaoAutenticada(
    `/api/matriculas/${encodeURIComponent(matriculaId)}/recusar`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        motivo: motivo.trim(),
      }),
    }
  )
}
// =====================================================
// HU012 - HISTÓRICO COMPLETO DE MATRÍCULAS
// =====================================================

// Professor consulta todas as matrículas da aula,
// incluindo pendentes, aceitas, recusadas e canceladas.
export function listarMatriculasAula(aulaId) {
  if (!aulaId) {
    return Promise.reject(
      new Error('Selecione uma aula para consultar as matrículas.')
    )
  }

  return requisicaoAutenticada(
    `/api/aulas/${encodeURIComponent(aulaId)}/matriculas`
  )
}