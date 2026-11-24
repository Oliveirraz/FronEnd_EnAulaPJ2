
import { useState } from 'react'
import {
  IconMapPin,
  IconCurrentLocation,
  IconDeviceFloppy,
} from '@tabler/icons-react'

import Aviso from '../../components/ui/Aviso.jsx'
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

  function usarLocalizacaoAtual() {
    setErro('')
    setSucesso('')

    if (!navigator.geolocation) {
      setErro('Seu navegador não oferece suporte à localização.')
      return
    }

    setLocalizando(true)

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLatitude(posicao.coords.latitude.toFixed(7))
        setLongitude(posicao.coords.longitude.toFixed(7))
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
      setErro('Informe uma latitude e longitude válidas.')
      return
    }

    setCarregando(true)

    try {
      await atualizarMinhaLocalizacaoProfessor({
        latitude: lat,
        longitude: lon,
      })

      setSucesso('Sua localização foi salva com sucesso.')
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar sua localização.')
    } finally {
      setCarregando(false)
    }
  }

  const coordenadasValidas =
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180

  const mapaUrl = coordenadasValidas
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.005}%2C${Number(latitude) - 0.005}%2C${Number(longitude) + 0.005}%2C${Number(latitude) + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : ''

  return (
    <section className="localizacao-professor">
      <div className="localizacao-professor__cabecalho">
        <IconMapPin size="1.5rem" />

        <div>
          <h3>Minha localização</h3>
          <p>
            Cadastre sua localização para que os alunos encontrem suas aulas
            presenciais.
          </p>
        </div>
      </div>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {sucesso && <Aviso tipo="sucesso">{sucesso}</Aviso>}

      <form onSubmit={salvarLocalizacao}>
        <div className="localizacao-professor__campos">
          <label>
            <span>Latitude</span>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(evento) => setLatitude(evento.target.value)}
              placeholder="-7.2307000"
              required
            />
          </label>

          <label>
            <span>Longitude</span>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(evento) => setLongitude(evento.target.value)}
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
            {localizando ? 'Localizando...' : 'Usar minha localização'}
          </button>

          <button
            type="submit"
            disabled={localizando || carregando}
          >
            <IconDeviceFloppy size="1.1rem" />
            {carregando ? 'Salvando...' : 'Salvar localização'}
          </button>
        </div>
      </form>

      {coordenadasValidas && (
        <div className="localizacao-professor__mapa">
          <iframe
            title="Mapa da localização do professor"
            src={mapaUrl}
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir mapa completo
          </a>
        </div>
      )}
    </section>
  )
}
