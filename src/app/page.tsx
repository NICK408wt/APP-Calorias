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
  const [tipo, setTipo] = useState<'desayuno' | 'almuerzo' | 'cena' | 'snack'>('desayuno');

  const agregarAlimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !calorias) return;

    const nuevoAlimento: Alimento = {
      id: Date.now(),
      nombre,
      calorias: Number(calorias),
      tipo,
    };

    setAlimentos([...alimentos, nuevoAlimento]);
    setNombre('');
    setCalorias('');
  };

  const eliminarAlimento = (id: number) => {
    setAlimentos(alimentos.filter((item) => item.id !== id));
  };

  const totalCalorias = alimentos.reduce((acc, item) => acc + item.calorias, 0);
  const porcentaje = Math.min((totalCalorias / metaCalorias) * 100, 100);

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#111827' }}>Contador de Calorías</h1>

      {/* Resumen y Barra de Progreso */}
      <div style={{ background: '#F3F4F6', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#374151' }}>
          Total: {totalCalorias} / {metaCalorias} kcal
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

      {/* Formulario de Entrada */}
      <form onSubmit={agregarAlimento} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre del alimento (ej. Manzana)"
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
            background: '#2563EB',
            color: '#FFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Agregar Alimento
        </button>
      </form>

      {/* Lista de Registro */}
      <h3 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>Registro del Día</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {alimentos.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center' }}>No has agregado alimentos aún.</p>
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
                <span style={{ marginRight: '12px', fontWeight: '500' }}>{item.calorias} kcal</span>
                <button
                  onClick={() => eliminarAlimento(item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
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
