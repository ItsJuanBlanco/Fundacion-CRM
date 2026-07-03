import { useState } from 'react'
import { supabase } from '../supabaseClient'

const AMOUNTS = [4000, 8000, 20000]

export default function RegistroDonante() {
  const [tipoDonante, setTipoDonante] = useState('natural')
  const [frecuencia, setFrecuencia] = useState('mensual')
  const [montoSeleccionado, setMontoSeleccionado] = useState(4000)
  const [montoOtro, setMontoOtro] = useState('')
  const [usarOtroMonto, setUsarOtroMonto] = useState(false)

  const [form, setForm] = useState({
    nombre_completo: '',
    identificacion: '',
    celular: '',
    email: '',
    ciudad: '',
  })

  const [aceptoTratamiento, setAceptoTratamiento] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function seleccionarMonto(monto) {
    setUsarOtroMonto(false)
    setMontoSeleccionado(monto)
  }

  function seleccionarOtroMonto() {
    setUsarOtroMonto(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.nombre_completo || !form.identificacion || !form.celular) {
      setError('Por favor completa los campos obligatorios: nombre, identificación y celular.')
      return
    }

    if (!aceptoTratamiento) {
      setError('Debes aceptar el tratamiento de datos personales para continuar.')
      return
    }

    const montoFinal = usarOtroMonto ? parseInt(montoOtro, 10) : montoSeleccionado

    if (!montoFinal || montoFinal <= 0) {
      setError('Por favor ingresa un monto válido.')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('donantes').insert([
      {
        tipo_donante: tipoDonante,
        nombre_completo: form.nombre_completo.trim(),
        identificacion: form.identificacion.trim(),
        celular: form.celular.trim(),
        email: form.email.trim() || null,
        ciudad: form.ciudad.trim() || null,
        frecuencia,
        monto_comprometido: montoFinal,
        origen: 'formulario_web',
        acepto_tratamiento_datos: true,
      },
    ])

    setLoading(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Ya existe un registro con ese número de identificación. Si crees que es un error, contáctanos.')
      } else {
        setError('Ocurrió un error al registrar tus datos. Intenta de nuevo en un momento.')
      }
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="container">
        <div className="card success-box">
          <div className="icon">✅</div>
          <h2>¡Gracias por unirte!</h2>
          <p>
            Registramos tu compromiso de donación. Muy pronto alguien de nuestro
            equipo se pondrá en contacto contigo para confirmar los detalles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo">❤</div>
        <h1>Únete como donante</h1>
        <p>Tu aporte ayuda directamente a familias en Colombia que más lo necesitan.</p>
      </div>

      <div className="card">
        <div className="impact-banner">
          🇨🇴 <span>Con $4.000 al mes puedes ayudar a llevar comida, salud y educación a familias vulnerables en todo el país.</span>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={tipoDonante === 'natural' ? 'active' : ''}
              onClick={() => setTipoDonante('natural')}
            >
              Persona natural
            </button>
            <button
              type="button"
              className={tipoDonante === 'empresa' ? 'active' : ''}
              onClick={() => setTipoDonante('empresa')}
            >
              Empresa
            </button>
          </div>

          <div className="section-title">Tus datos</div>

          <div className="field">
            <label>{tipoDonante === 'empresa' ? 'Nombre de la empresa' : 'Nombre completo'} <span className="req">*</span></label>
            <input
              type="text"
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              placeholder={tipoDonante === 'empresa' ? 'Ej: Distribuidora XYZ S.A.S' : 'Ej: Juan Pérez Gómez'}
            />
          </div>

          <div className="field">
            <label>{tipoDonante === 'empresa' ? 'NIT' : 'Cédula'} <span className="req">*</span></label>
            <input
              type="text"
              name="identificacion"
              value={form.identificacion}
              onChange={handleChange}
              placeholder={tipoDonante === 'empresa' ? 'Ej: 900123456-7' : 'Ej: 1017123456'}
            />
          </div>

          <div className="field">
            <label>Celular (WhatsApp) <span className="req">*</span></label>
            <input
              type="tel"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              placeholder="Ej: 300 123 4567"
            />
          </div>

          <div className="field">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="field">
            <label>Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              placeholder="Ej: Medellín"
            />
          </div>

          <div className="section-title">Tu aporte</div>

          <div className="field">
            <label>¿Cada cuánto quieres donar? <span className="req">*</span></label>
            <div className="radio-group">
              {[
                { value: 'mensual', label: 'Mensual' },
                { value: 'semanal', label: 'Semanal' },
                { value: 'libre', label: 'Cuando quiera' },
              ].map((opt) => (
                <div
                  key={opt.value}
                  className={`radio-option ${frecuencia === opt.value ? 'selected' : ''}`}
                  onClick={() => setFrecuencia(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Monto (COP) <span className="req">*</span></label>
            <div className="amount-grid">
              {AMOUNTS.map((monto, i) => (
                <div
                  key={monto}
                  className={`amount-option ${!usarOtroMonto && montoSeleccionado === monto ? 'selected' : ''}`}
                  onClick={() => seleccionarMonto(monto)}
                >
                  ${monto.toLocaleString('es-CO')}
                  {i === 0 && <span className="sub">recomendado</span>}
                </div>
              ))}
              <div
                className={`amount-option ${usarOtroMonto ? 'selected' : ''}`}
                onClick={seleccionarOtroMonto}
              >
                Otro monto
              </div>
            </div>
            {usarOtroMonto && (
              <input
                type="number"
                min="1000"
                step="1000"
                value={montoOtro}
                onChange={(e) => setMontoOtro(e.target.value)}
                placeholder="Ingresa el monto en pesos"
              />
            )}
          </div>

          <div className="field checkbox-field">
            <input
              type="checkbox"
              checked={aceptoTratamiento}
              onChange={(e) => setAceptoTratamiento(e.target.checked)}
            />
            <span>
              Acepto la política de tratamiento de datos personales (Ley 1581 de 2012).
            </span>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Registrarme como donante →'}
          </button>

          <p className="disclaimer">
            No se hará ningún cobro hasta que confirmemos tu registro.
          </p>
        </form>
      </div>
    </div>
  )
}
