import { useState } from 'react'

import {
  IconMapPin,
  IconCurrentLocation,
  IconDeviceFloppy,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
import LocalizadorEndereco from '../../components/ui/LocalizadorEndereco.jsx'

import {
  atualizarMinhaLocalizacaoProfessor,
} from '../../services/api.js'

export default function LocalizacaoProfessor() {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [localizando, setLocalizando] = useState(false)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function atualizarCoordenadas(coordenadas) {
    setLatitude(coordenadas.latitude)
    setLongitude(coordenadas.longitude)

    setErro('')
    setSucesso('')
  }

  function usarLocalizacaoAtual() {
    setErro('')
    setSucesso('')

    if (!navigator.geolocation) {
      setErro(
        'Seu navegador não oferece suporte à localização.'
      )
      return
    }

    setLocalizando(true)

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        atualizarCoordenadas({
          latitude: posicao.coords.latitude.toFixed(7),
          longitude: posicao.coords.longitude.toFixed(7),
        })

        setLocalizando(false)
      },

      () => {
        setErro(
          'Não foi possível obter sua localização. Verifique a permissão do navegador.'
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

  async function salvarLocalizacao(evento) {
    evento.preventDefault()

    setErro('')
    setSucesso('')

    const lat = Number(latitude)
    const lon = Number(longitude)

    if (
      latitude.trim() === '' ||
      longitude.trim() === '' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setErro(
        'Pesquise seu endereço ou informe uma latitude e longitude válidas.'
      )
      return
    }

    setCarregando(true)

    try {
      await atualizarMinhaLocalizacaoProfessor({
        latitude: lat,
        longitude: lon,
      })

      setSucesso(
        'Sua localização foi salva com sucesso.'
      )
    } catch (error) {
      setErro(
        error.message || 'Não foi possível salvar sua localização.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="localizacao-professor">
      <div className="localizacao-professor__cabecalho">
        <IconMapPin size="1.5rem" />

        <div>
          <h3>Minha localização</h3>

          <p>
            Pesquise seu endereço no mapa para que os alunos
            encontrem suas aulas presenciais.
          </p>
        </div>
      </div>

      {erro && (
        <Aviso tipo="erro">
          {erro}
        </Aviso>
      )}

      {sucesso && (
        <Aviso tipo="sucesso">
          {sucesso}
        </Aviso>
      )}

      <form onSubmit={salvarLocalizacao}>
        <LocalizadorEndereco
          latitude={latitude}
          longitude={longitude}
          onCoordinatesChange={atualizarCoordenadas}
        />

        <div className="localizacao-professor__campos">
          <label>
            <span>Latitude</span>

            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={latitude}
              onChange={(evento) =>
                setLatitude(evento.target.value)
              }
              placeholder="-7.2307000"
              required
            />
          </label>

          <label>
            <span>Longitude</span>

            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={longitude}
              onChange={(evento) =>
                setLongitude(evento.target.value)
              }
              placeholder="-35.8811000"
              required
            />
          </label>
        </div>

        <div className="localizacao-professor__acoes">
          <button
            type="button"
            onClick={usarLocalizacaoAtual}
            disabled={localizando || carregando}
          >
            <IconCurrentLocation size="1.1rem" />

            {localizando
              ? 'Localizando...'
              : 'Usar minha localização'}
          </button>

          <button
            type="submit"
            disabled={localizando || carregando}
          >
            <IconDeviceFloppy size="1.1rem" />

            {carregando
              ? 'Salvando...'
              : 'Salvar localização'}
          </button>
        </div>
      </form>
    </section>
  )
}