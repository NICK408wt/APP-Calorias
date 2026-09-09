'use client';

import React, { useState } from 'react';

interface Alimento {
  id: number;
  nombre: string;
  calorias: number;
  proteinas: number;
  carbs: number;
  grasas: number;
  tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  hora: string;
}

export default function Home() {
  const metaCalorias = 2200;
  const metaProteinas = 140;
  const metaCarbs = 220;
  const metaGrasas = 60;

  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [nombre, setNombre] = useState('');
  const [calorias, setCalorias] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carbs, setCarbs] = useState('');
  const [grasas, setGrasas] = useState('');
  const [tipo, setTipo] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('almuerzo');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');
  const [vasosAgua, setVasosAgua] = useState(0);

  const convertirBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const analizarFotoComida = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCargandoIA(true);
    setErrorIA('');

    try {
      const base64 = await convertirBase64(file);
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con la IA');
      }

      setNombre(data.nombre || 'Plato Detectado');
      setCalorias(String(data.calorias || 0));
      setProteinas(String(data.proteinas || 0));
      setCarbs(String(data.carbs || 0));
      setGrasas(String(data.grasas || 0));
    } catch (err: any) {
      setErrorIA(err.message || 'Error procesando la imagen');
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
      proteinas: Number(proteinas) || 0,
      carbs: Number(carbs) || 0,
      grasas: Number(grasas) || 0,
      tipo,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAlimentos([nuevo, ...alimentos]);
    setNombre('');
    setCalorias('');
    setProteinas('');
    setCarbs('');
    setGrasas('');
  };

  const eliminarAlimento = (id: number) => {
    setAlimentos(alimentos.filter((item) => item.id !== id));
  };

  const totalCalorias = alimentos.reduce((acc, i) => acc + i.calorias, 0);
  const totalProteinas = alimentos.reduce((acc, i) => acc + i.proteinas, 0);
  const totalCarbs = alimentos.reduce((acc, i) => acc + i.carbs, 0);
  const totalGrasas = alimentos.reduce((acc, i) => acc + i.grasas, 0);

  const pctCalorias = Math.min((totalCalorias / metaCalorias) * 100, 100);

  return (
    <div style={{ backgroundColor: '#0B0F17', color: '#F3F4F6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Header App */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#10B981', letterSpacing: '-0.5px' }}>FITIA <span style={{ color: '#FFF', fontSize: '14px', fontWeight: '400' }}>AI</span></h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>Control Nutricional Inteligente</p>
          </div>
          <div style={{ background: '#1F2937', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#10B981', fontWeight: 'bold', border: '1px solid #374151' }}>
            PRO
          </div>
        </header>

        {/* Tarjeta de Resumen Calórico */}
        <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)', padding: '20px', borderRadius: '20px', border: '1px solid #374151', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '1px', fontWeight: 'bold' }}>Consumo Diario</span>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#FFF' }}>
                {totalCalorias} <span style={{ fontSize: '16px', color: '#9CA3AF', fontWeight: '400' }}>/ {metaCalorias} kcal</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: pctCalorias >= 100 ? '#EF4444' : '#10B981' }}>
              {Math.round(pctCalorias)}%
            </div>
          </div>

          {/* Barra Progreso */}
          <div style={{ background: '#374151', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ width: `${pctCalorias}%`, background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)', height: '100%', transition: 'width 0.4s ease' }} />
          </div>

          {/* Desglose de Macros */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: '#0B0F17', padding: '10px', borderRadius: '12px', border: '1px solid #1F2937' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>PROT</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#3B82F6', marginTop: '2px' }}>{totalProteinas}g</div>
              <div style={{ fontSize: '10px', color: '#4B5563' }}>obj: {metaProteinas}g</div>
            </div>
            <div style={{ background: '#0B0F17', padding: '10px', borderRadius: '12px', border: '1px solid #1F2937' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>CARBS</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#F59E0B', marginTop: '2px' }}>{totalCarbs}g</div>
              <div style={{ fontSize: '10px', color: '#4B5563' }}>obj: {metaCarbs}g</div>
            </div>
            <div style={{ background: '#0B0F17', padding: '10px', borderRadius: '12px', border: '1px solid #1F2937' }}>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>GRASAS</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#EC4899', marginTop: '2px' }}>{totalGrasas}g</div>
              <div style={{ fontSize: '10px', color: '#4B5563' }}>obj: {metaGrasas}g</div>
            </div>
          </div>
        </div>

        {/* Escáner de Foto AI */}
        <div style={{ background: '#111827', borderRadius: '20px', padding: '20px', border: '2px dashed #10B981', textAlign: 'center', marginBottom: '24px' }}>
          <label style={{ cursor: 'pointer', display: 'block' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10B981' }}>
              {cargandoIA ? 'Analizando tu plato con IA...' : 'Escanear Foto de Comida'}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Saca una foto o sube un archivo para calcular calorías y macros automáticamente
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={analizarFotoComida}
              disabled={cargandoIA}
              style={{ display: 'none' }}
            />
          </label>
          {errorIA && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>{errorIA}</p>}
        </div>

        {/* Formulario */}
        <form onSubmit={agregarAlimento} style={{ background: '#111827', padding: '16px', borderRadius: '20px', border: '1px solid #1F2937', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#D1D5DB' }}>Detalles del Registro</div>
          
          <input
            type="text"
            placeholder="Nombre de la comida (ej. Pechuga con Arroz)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0B0F17', border: '1px solid #374151', color: '#FFF', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input
              type="number"
              placeholder="Calorías (kcal)"
              value={calorias}
              onChange={(e) => setCalorias(e.target.value)}
              style={{ padding: '10px', borderRadius: '10px', background: '#0B0F17', border: '1px solid #374151', color: '#FFF' }}
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Alimento['tipo'])}
              style={{ padding: '10px', borderRadius: '10px', background: '#0B0F17', border: '1px solid #374151', color: '#FFF' }}
            >
              <option value="desayuno">Desayuno</option>
              <option value="almuerzo">Almuerzo</option>
              <option value="cena">Cena</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <input
              type="number"
              placeholder="Prot (g)"
              value={proteinas}
              onChange={(e) => setProteinas(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', background: '#0B0F17', border: '1px solid #374151', color: '#3B82F6', fontSize: '12px' }}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', background: '#0B0F17', border: '1px solid #374151', color: '#F59E0B', fontSize: '12px' }}
            />
            <input
              type="number"
              placeholder="Grasas (g)"
              value={grasas}
              onChange={(e) => setGrasas(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', background: '#0B0F17', border: '1px solid #374151', color: '#EC4899', fontSize: '12px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#10B981',
              color: '#0B0F17',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            + Registrar en el Diario
          </button>
        </form>

        {/* Registro de Agua */}
        <div style={{ background: '#111827', padding: '16px', borderRadius: '20px', border: '1px solid #1F2937', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>💧 Registro de Agua</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{vasosAgua * 250} ml / 2000 ml ({vasosAgua} vasos)</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setVasosAgua(Math.max(0, vasosAgua - 1))}
              style={{ background: '#1F2937', color: '#FFF', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              -
            </button>
            <button
              onClick={() => setVasosAgua(vasosAgua + 1)}
              style={{ background: '#3B82F6', color: '#FFF', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Diario de Hoy */}
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#E5E7EB' }}>Diario de Hoy</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alimentos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280', background: '#111827', borderRadius: '16px', border: '1px solid #1F2937' }}>
              Aún no has registrado ninguna comida hoy.
            </div>
          ) : (
            alimentos.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#111827',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1px solid #1F2937',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#FFF' }}>{item.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'capitalize', marginTop: '2px' }}>
                    {item.tipo} • {item.hora}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    P: {item.proteinas}g | C: {item.carbs}g | G: {item.grasas}g
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#10B981', fontSize: '15px' }}>{item.calorias} kcal</div>
                  <button
                    onClick={() => eliminarAlimento(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
