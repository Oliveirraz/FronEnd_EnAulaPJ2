
import { useMemo, useState } from 'react'
import {
  IconMapPin,
  IconDeviceFloppy,
  IconCurrentLocation,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { lerSessao } from '../../services/sessao.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function lerErro(resposta) {
  const texto = await resposta.text().catch(() => '')

  if (!texto) {
    return 'Não foi possível salvar a localização.'
  }

  try {
    const dados = JSON.parse(texto)
    return dados.message || dados.mensagem || dados.erro || texto
  } catch {
    return texto
  }
}

export default function LocalizacaoAluno({ aoSalvar }) {
  const [numeroEndereco, setNumeroEndereco] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [localizando, setLocalizando] = useState(false)

  const coordenadasValidas =
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180

  const mapaUrl = useMemo(() => {
    if (!coordenadasValidas) {
      return ''
    }

    const lat = Number(latitude)
    const lon = Number(longitude)
    const margem = 0.005

    const parametros = new URLSearchParams({
      bbox: `${lon - margem},${lat - margem},${lon + margem},${lat + margem}`,
      layer: 'mapnik',
      marker: `${lat},${lon}`,
    })

    return `https://www.openstreetmap.org/export/embed.html?${parametros.toString()}`
  }, [coordenadasValidas, latitude, longitude])

  function obterLocalizacaoAtual() {
    setErro('')

    if (!navigator.geolocation) {
      setErro(
        'Seu navegador não oferece suporte à localização automática. Digite as coordenadas manualmente.'
      )
      return
    }

    setLocalizando(true)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(String(coords.latitude))
        setLongitude(String(coords.longitude))
        setLocalizando(false)
      },
      () => {
        setErro(
          'Não foi possível obter sua localização. Permita o acesso no navegador ou digite latitude e longitude manualmente.'
        )
        setLocalizando(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    )
  }

  async function salvar(evento) {
    evento.preventDefault()
    setErro('')

    if (!numeroEndereco.trim()) {
      setErro('Informe o número do endereço para confirmar a localização.')
      return
    }

    if (!coordenadasValidas) {
      setErro(
        'Informe uma latitude entre -90 e 90 e uma longitude entre -180 e 180.'
      )
      return
    }

    const token = lerSessao()?.token

    if (!token) {
      setErro(
        'Sua sessão expirou. Entre novamente para cadastrar a localização.'
      )
      return
    }

    setSalvando(true)

    try {
      const resposta = await fetch(
        `${API_URL}/api/alunos/minha-localizacao`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: Number(latitude),
            longitude: Number(longitude),
          }),
        }
      )

      if (!resposta.ok) {
        throw new Error(await lerErro(resposta))
      }

      await aoSalvar?.()
    } catch (error) {
      setErro(
        error.message || 'Não foi possível salvar sua localização.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section
      className="localizacao-aluno"
      aria-labelledby="titulo-localizacao"
    >
      <div className="localizacao-aluno__titulo">
        <IconMapPin size="1.35rem" aria-hidden="true" />
        <h2 id="titulo-localizacao">Cadastre sua localização</h2>
      </div>

      <p>
        Confira o número do seu endereço no mapa e informe a latitude e a
        longitude correspondentes. Esses dados serão usados para calcular
        a distância das aulas.
      </p>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      <form
        className="localizacao-aluno__formulario"
        onSubmit={salvar}
      >
        <Input
          rotulo="Número do endereço"
          value={numeroEndereco}
          onChange={(evento) => setNumeroEndereco(evento.target.value)}
          placeholder="Ex.: 123"
          maxLength={20}
          required
        />

        <Input
          rotulo="Latitude"
          type="number"
          step="any"
          min="-90"
          max="90"
          value={latitude}
          onChange={(evento) => setLatitude(evento.target.value)}
          placeholder="Ex.: -7.2307"
          required
        />

        <Input
          rotulo="Longitude"
          type="number"
          step="any"
          min="-180"
          max="180"
          value={longitude}
          onChange={(evento) => setLongitude(evento.target.value)}
          placeholder="Ex.: -35.8811"
          required
        />

        <div className="localizacao-aluno__acoes">
          <Button
            type="button"
            onClick={obterLocalizacaoAtual}
            carregando={localizando}
          >
            <IconCurrentLocation size="1.1rem" aria-hidden="true" />
            Usar minha localização
          </Button>

          <Button
            type="submit"
            carregando={salvando}
          >
            <IconDeviceFloppy size="1.1rem" aria-hidden="true" />
            Salvar localização
          </Button>
        </div>
      </form>

      {mapaUrl ? (
        <iframe
          className="localizacao-aluno__mapa"
          title="Mapa para conferir a localização informada"
          src={mapaUrl}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="localizacao-aluno__mapa-vazio">
          Informe latitude e longitude para visualizar o ponto no mapa.
        </div>
      )}

      <small className="localizacao-aluno__observacao">
        O número do endereço serve para conferência. O backend atual
        armazena latitude e longitude.
      </small>
    </section>
  )
}
