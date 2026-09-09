'use client';

import React, { useState } from 'react';

interface Alimento {
  id: number;
  nombre: string;
  calorias: number;
  tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
}

export default function Home() {
  const metaCalorias = 2000;
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [nombre, setNombre] = useState('');
  const [calorias, setCalorias] = useState('');
  const [tipo, setTipo] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');

  // Convertir la imagen a Base64
  const convertirImagenBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Escanear foto usando la API Key guardada en Vercel
  const procesarFotoConOpenAI = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      setErrorIA('No se encontró la API Key guardada en Vercel. Revisa la configuración de Environment Variables.');
      return;
    }

    setErrorIA('');
    setCargandoIA(true);

    try {
      const base64Image = await convertirImagenBase64(archivo);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analiza esta foto de comida. Identifica el plato y calcula las calorías aproximadas. Responde ÚNICAMENTE un objeto JSON válido con este formato exacto: {"nombre": "Nombre del plato", "calorias": 450}. No agregues texto ni markdown adicional.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image,
                  },
                },
              ],
            },
          ],
          max_tokens: 150,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message || 'Error en la API de OpenAI');
      }

      const respuestaTexto = data.choices[0].message.content.trim();
      const jsonLimpio = respuestaTexto.replace(/```json|```/g, '').trim();
      const resultado = JSON.parse(jsonLimpio);

      // Autocompletar el formulario
      setNombre(resultado.nombre || 'Plato detectado');
      setCalorias(String(resultado.calorias || 300));
    } catch (err: any) {
      console.error(err);
      setErrorIA('Error al analizar la foto. Revisa que tu API Key en Vercel tenga crédito activo.');
    } finally {
      setCargandoIA(false);
    }
  };

  const agregarAlimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !calorias) return;

    const nuevo: Alimento = {
      id: Date.now(),
      nombre,
      calorias: Number(calorias),
      tipo,
    };

    setAlimentos([...alimentos, nuevo]);
    setNombre('');
    setCalorias('');
  };

  const eliminarAlimento = (id: number) => {
    setAlimentos(alimentos.filter((item) => item.id !== id));
  };

  const totalCalorias = alimentos.reduce((acc, item) => acc + item.calorias, 0);
  const porcentaje = Math.min((totalCalorias / metaCalorias) * 100, 100);

  return (
    <main style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#111827', marginBottom: '20px' }}>Contador de Calorías IA 📸</h1>

      {/* Resumen del día */}
      <div style={{ background: '#F3F4F6', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#374151' }}>
          Consumo diario: {totalCalorias} / {metaCalorias} kcal
        </h2>
        <div style={{ background: '#E5E7EB', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${porcentaje}%`,
              background: porcentaje >= 100 ? '#EF4444' : '#10B981',
              height: '100%',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Escáner de Foto */}
      <div style={{ marginBottom: '20px', textAlign: 'center', border: '2px dashed #9333EA', padding: '20px', borderRadius: '12px', background: '#FAF5FF' }}>
        <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#9333EA', display: 'block' }}>
          {cargandoIA ? '⏳ OpenAI está analizando tu plato...' : '📸 Sacar Foto a la Comida / Subir Imagen'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={procesarFotoConOpenAI}
            disabled={cargandoIA}
            style={{ display: 'none' }}
          />
        </label>
        {errorIA && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{errorIA}</p>}
      </div>

      {/* Formulario */}
      <form onSubmit={agregarAlimento} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre del alimento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            placeholder="Calorías (kcal)"
            value={calorias}
            onChange={(e) => setCalorias(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Alimento['tipo'])}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
          >
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '12px',
            background: '#9333EA',
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Guardar en Registro del Día
        </button>
      </form>

      {/* Registro del Día */}
      <h3 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>Registro del Día</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {alimentos.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center' }}>No has registrado comidas hoy.</p>
        ) : (
          alimentos.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div>
                <strong>{item.nombre}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '8px', textTransform: 'capitalize' }}>
                  ({item.tipo})
                </span>
              </div>
              <div>
                <span style={{ marginRight: '12px', fontWeight: 'bold', color: '#1F2937' }}>{item.calorias} kcal</span>
                <button
                  onClick={() => eliminarAlimento(item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  X
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
