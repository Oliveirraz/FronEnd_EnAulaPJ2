import { useState } from 'react'

import {
  IconMapPin,
  IconDeviceFloppy,
  IconCurrentLocation,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import LocalizadorEndereco from '../../components/ui/LocalizadorEndereco.jsx'

import { lerSessao } from '../../services/sessao.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function lerErro(resposta) {
  const texto = await resposta.text().catch(() => '')

  if (!texto) {
    return 'Não foi possível salvar a localização.'
  }

  try {
    const dados = JSON.parse(texto)

    return (
      dados.message ||
      dados.mensagem ||
      dados.erro ||
      texto
    )
  } catch {
    return texto
  }
}

export default function LocalizacaoAluno({ aoSalvar }) {
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

  function atualizarCoordenadas(coordenadas) {
    setLatitude(coordenadas.latitude)
    setLongitude(coordenadas.longitude)
    setErro('')
  }

  function obterLocalizacaoAtual() {
    setErro('')

    if (!navigator.geolocation) {
      setErro(
        'Seu navegador não oferece suporte à localização automática. Pesquise o endereço no mapa.'
      )
      return
    }

    setLocalizando(true)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        atualizarCoordenadas({
          latitude: coords.latitude.toFixed(7),
          longitude: coords.longitude.toFixed(7),
        })

        setLocalizando(false)
      },

      () => {
        setErro(
          'Não foi possível obter sua localização. Permita o acesso no navegador ou pesquise seu endereço.'
        )

        setLocalizando(false)
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  async function salvar(evento) {
    evento.preventDefault()
    setErro('')

    if (!coordenadasValidas) {
      setErro(
        'Pesquise e selecione seu endereço no mapa ou informe coordenadas válidas.'
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
        <IconMapPin
          size="1.35rem"
          aria-hidden="true"
        />

        <h2 id="titulo-localizacao">
          Cadastre sua localização
        </h2>
      </div>

      <p>
        Digite seu endereço completo e selecione o resultado
        correto no mapa. A localização será usada para
        calcular a distância das aulas.
      </p>

      {erro && (
        <Aviso tipo="erro">
          {erro}
        </Aviso>
      )}

      <form
        className="localizacao-aluno__formulario"
        onSubmit={salvar}
      >
        <LocalizadorEndereco
          latitude={latitude}
          longitude={longitude}
          onCoordinatesChange={atualizarCoordenadas}
        />

        <div className="localizacao-aluno__coordenadas">
          <Input
            rotulo="Latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={latitude}
            onChange={(evento) =>
              setLatitude(evento.target.value)
            }
            placeholder="Preenchida ao selecionar o endereço"
            required
          />

          <Input
            rotulo="Longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={longitude}
            onChange={(evento) =>
              setLongitude(evento.target.value)
            }
            placeholder="Preenchida ao selecionar o endereço"
            required
          />
        </div>

        <div className="localizacao-aluno__acoes">
          <Button
            type="button"
            onClick={obterLocalizacaoAtual}
            carregando={localizando}
          >
            <IconCurrentLocation
              size="1.1rem"
              aria-hidden="true"
            />

            Usar minha localização
          </Button>

          <Button
            type="submit"
            carregando={salvando}
          >
            <IconDeviceFloppy
              size="1.1rem"
              aria-hidden="true"
            />

            Salvar localização
          </Button>
        </div>
      </form>

      <small className="localizacao-aluno__observacao">
        O endereço é usado para encontrar o ponto no mapa.
        O backend atual armazena latitude e longitude.
      </small>
    </section>
  )
}