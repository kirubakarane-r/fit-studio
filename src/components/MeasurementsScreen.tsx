import React, { createElement, useState, useEffect, Fragment } from 'react';
import { Ruler, Scale, Calendar, Plus, X, Trash2, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import { useMeasurements } from '../context/MeasurementsContext';
import { useAuth } from '../context/AuthContext';
import { formatDateFull } from '../utils/formatters';

export default function MeasurementsScreen() {
  const { measurements, loading, handleSaveMeasurement, handleDeleteMeasurement } = useMeasurements();
  const { profile } = useAuth();

  // Form states
  const [date, setDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arm, setArm] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync inputs with selected date or pre-fill from latest measurement
  useEffect(() => {
    const existing = measurements.find(m => m.date === date);
    if (existing) {
      setWeight(existing.weight.toString());
      setWaist(existing.waist.toString());
      setChest(existing.chest.toString());
      setArm(existing.arm.toString());
    } else {
      // Pre-fill from latest if logging a new entry to save manual typing
      const latest = measurements[0];
      if (latest) {
        setWeight(latest.weight.toString());
        setWaist(latest.waist.toString());
        setChest(latest.chest.toString());
        setArm(latest.arm.toString());
      } else {
        setWeight('');
        setWaist('');
        setChest('');
        setArm('');
      }
    }
  }, [date, measurements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const wNum = parseFloat(weight);
    const waNum = parseFloat(waist);
    const cNum = parseFloat(chest);
    const aNum = parseFloat(arm);

    if (isNaN(wNum) || isNaN(waNum) || isNaN(cNum) || isNaN(aNum)) {
      setError('Please fill in all measurements with valid numbers.');
      return;
    }

    try {
      await handleSaveMeasurement(date, wNum, waNum, cNum, aNum);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save measurement. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement entry?')) {
      await handleDeleteMeasurement(id);
    }
  };

  // --------------------------------------------------
  // WEEKLY COMPARISON LOGIC
  // --------------------------------------------------
  const today = new Date();
  
  // Calculate current week's Sunday
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());
  currentSunday.setHours(0, 0, 0, 0);

  // Calculate last week's Sunday
  const lastSunday = new Date(currentSunday);
  lastSunday.setDate(lastSunday.getDate() - 7);

  // Next week's Sunday (for bounds checking)
  const nextSunday = new Date(currentSunday);
  nextSunday.setDate(nextSunday.getDate() + 7);

  const getLocalDateString = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const currentSundayStr = getLocalDateString(currentSunday);
  const nextSundayStr = getLocalDateString(nextSunday);
  const lastSundayStr = getLocalDateString(lastSunday);

  // Find latest entry for current calendar week and last calendar week
  const currentWeekEntry = measurements.find(m => m.date >= currentSundayStr && m.date < nextSundayStr);
  const lastWeekEntry = measurements.find(m => m.date >= lastSundayStr && m.date < currentSundayStr);

  const formatDateRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(start)} - ${format(end)}`;
  };

  const getTrendData = (metric: 'weight' | 'waist' | 'chest' | 'arm', current: number, past: number) => {
    const diff = current - past;
    if (past === 0) return { text: 'New', color: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20', icon: Plus };
    if (Math.abs(diff) < 0.01) return { text: '0.0', color: 'text-neutral-500 bg-neutral-800 border border-neutral-700/30', icon: Minus };

    const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
    let isGood = false;

    if (metric === 'weight') {
      const isMuscle = profile?.goal === 'Muscle Gain' || profile?.goal === 'Strength Training';
      isGood = isMuscle ? diff > 0 : diff < 0;
    } else if (metric === 'waist') {
      isGood = diff < 0;
    } else { // chest, arm
      isGood = diff > 0;
    }

    return {
      text: diffStr,
      color: isGood ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-red-400 bg-red-400/10 border border-red-500/20',
      icon: diff > 0 ? TrendingUp : TrendingDown
    };
  };

  const renderComparisonCard = (
    title: string,
    metric: 'weight' | 'waist' | 'chest' | 'arm',
    Icon: any,
    unit: string
  ) => {
    const currentVal = currentWeekEntry ? currentWeekEntry[metric] : null;
    const pastVal = lastWeekEntry ? lastWeekEntry[metric] : null;

    let valueDisplay = '-';
    let pastDisplay = 'No entry';
    let trendTag = null;

    if (currentVal !== null) {
      valueDisplay = `${currentVal.toFixed(1)} ${unit}`;
      if (pastVal !== null) {
        pastDisplay = `${pastVal.toFixed(1)} ${unit}`;
        const trend = getTrendData(metric, currentVal, pastVal);
        trendTag = createElement(
          'div',
          { className: `flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${trend.color}` },
          createElement(trend.icon, { className: 'w-3 h-3' }),
          createElement('span', null, trend.text)
        );
      } else {
        trendTag = createElement(
          'div',
          { className: 'text-[9px] font-bold text-neutral-500 bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-lg' },
          'No comparison'
        );
      }
    } else {
      // If current week is missing, check if we can display the latest entry ever as a fallback
      const latestEntry = measurements[0];
      if (latestEntry) {
        valueDisplay = `${latestEntry[metric].toFixed(1)} ${unit}`;
        pastDisplay = `Logged ${formatDateShort(latestEntry.date)}`;
      }
    }

    return createElement(
      'div',
      { className: 'bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-colors' },
      createElement(
        'div',
        { className: 'flex justify-between items-start w-full' },
        createElement(
          'span',
          { className: 'text-[11px] font-semibold text-neutral-400 uppercase tracking-wider' },
          title
        ),
        createElement(Icon, { className: 'w-4 h-4 text-emerald-400' })
      ),
      createElement(
        'div',
        { className: 'mt-4 flex items-baseline gap-1' },
        createElement('span', { className: 'text-2xl font-extrabold text-neutral-100 tracking-tight' }, valueDisplay)
      ),
      createElement(
        'div',
        { className: 'mt-2 flex justify-between items-center w-full border-t border-neutral-900 pt-2' },
        createElement(
          'div',
          { className: 'flex flex-col' },
          createElement('span', { className: 'text-[9px] text-neutral-500 uppercase font-semibold' }, 'Last Week'),
          createElement('span', { className: 'text-xs text-neutral-300 font-bold mt-0.5' }, pastDisplay)
        ),
        trendTag
      )
    );
  };

  const formatDateShort = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return createElement(
      'div',
      { className: 'flex flex-col items-center justify-center pt-24 space-y-4' },
      createElement('div', { className: 'w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' }),
      createElement('p', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider' }, 'Retrieving body vault...')
    );
  }

  // --------------------------------------------------
  // RENDER INTERFACE
  // --------------------------------------------------
  return createElement(
    'div',
    { className: 'space-y-6 pb-20' },
    
    // Header
    createElement(
      'div',
      { className: 'flex justify-between items-center' },
      createElement(
        'div',
        null,
        createElement('h2', { className: 'text-base font-extrabold text-neutral-200 uppercase tracking-wider' }, 'Body Measurements'),
        createElement('p', { className: 'text-xs text-neutral-500 mt-1' }, 'Track and analyze weight, waist, chest, and arms weekly.')
      ),
      createElement(
        'button',
        {
          onClick: () => setShowForm(prev => !prev),
          className: `px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
            showForm 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
          }`
        },
        showForm ? createElement(X, { className: 'w-3.5 h-3.5' }) : createElement(Plus, { className: 'w-3.5 h-3.5' }),
        createElement('span', null, showForm ? 'Cancel' : 'Log Entry')
      )
    ),

    // Log Form collapsible
    showForm && createElement(
      'div',
      { className: 'bg-[#121212] border border-neutral-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200' },
      createElement('h3', { className: 'text-sm font-bold text-neutral-200 uppercase tracking-wider mb-4' }, 'Record Weekly Stats'),
      
      error && createElement('div', { className: 'p-3 mb-4 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 text-center' }, error),
      
      createElement(
        'form',
        { onSubmit: handleSubmit, className: 'space-y-4' },
        createElement(
          'div',
          null,
          createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5' }, 'Date (Usually Sundays)'),
          createElement(
            'div',
            { className: 'flex items-center gap-2 bg-neutral-950/50 border border-neutral-900 px-3 py-2.5 rounded-xl' },
            createElement(Calendar, { className: 'w-4 h-4 text-neutral-500' }),
            createElement('input', {
              type: 'date',
              required: true,
              value: date,
              onChange: (e: any) => setDate(e.target.value),
              className: 'w-full bg-transparent border-none text-sm text-neutral-200 focus:outline-none'
            })
          )
        ),

        createElement(
          'div',
          { className: 'grid grid-cols-2 gap-4' },
          createElement(
            'div',
            null,
            createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5' }, 'Weight (kg)'),
            createElement('input', {
              type: 'number',
              step: '0.1',
              required: true,
              min: '0',
              placeholder: 'e.g. 78.5',
              value: weight,
              onChange: (e: any) => setWeight(e.target.value),
              className: 'w-full bg-neutral-950/50 border border-neutral-900 focus:border-emerald-500 text-sm rounded-xl px-3 py-2.5 text-neutral-200 focus:outline-none'
            })
          ),
          createElement(
            'div',
            null,
            createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5' }, 'Waist (cm)'),
            createElement('input', {
              type: 'number',
              step: '0.1',
              required: true,
              min: '0',
              placeholder: 'e.g. 82.0',
              value: waist,
              onChange: (e: any) => setWaist(e.target.value),
              className: 'w-full bg-neutral-950/50 border border-neutral-900 focus:border-emerald-500 text-sm rounded-xl px-3 py-2.5 text-neutral-200 focus:outline-none'
            })
          ),
          createElement(
            'div',
            null,
            createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5' }, 'Chest (cm)'),
            createElement('input', {
              type: 'number',
              step: '0.1',
              required: true,
              min: '0',
              placeholder: 'e.g. 102.5',
              value: chest,
              onChange: (e: any) => setChest(e.target.value),
              className: 'w-full bg-neutral-950/50 border border-neutral-900 focus:border-emerald-500 text-sm rounded-xl px-3 py-2.5 text-neutral-200 focus:outline-none'
            })
          ),
          createElement(
            'div',
            null,
            createElement('label', { className: 'text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5' }, 'Arm (cm)'),
            createElement('input', {
              type: 'number',
              step: '0.1',
              required: true,
              min: '0',
              placeholder: 'e.g. 36.5',
              value: arm,
              onChange: (e: any) => setArm(e.target.value),
              className: 'w-full bg-neutral-950/50 border border-neutral-900 focus:border-emerald-500 text-sm rounded-xl px-3 py-2.5 text-neutral-200 focus:outline-none'
            })
          )
        ),

        createElement(
          'button',
          {
            type: 'submit',
            className: 'w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer transition-colors mt-2'
          },
          'Save Measurement'
        )
      )
    ),

    // Weekly Summary Label Card
    createElement(
      'div',
      { className: 'bg-[#121212]/80 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center shadow-lg gap-2' },
      createElement(
        'div',
        { className: 'flex flex-col' },
        createElement('span', { className: 'text-[9px] text-neutral-500 uppercase tracking-widest font-black' }, 'Current Week Schedule'),
        createElement('span', { className: 'text-sm font-bold text-neutral-200 mt-0.5' }, formatDateRange(currentSunday))
      ),
      createElement(
        'div',
        { className: 'text-xs text-neutral-400 font-medium' },
        currentWeekEntry 
          ? createElement('span', { className: 'text-emerald-400 font-bold flex items-center gap-1' }, createElement(Check, { className: 'w-4 h-4' }), 'Weekly measurement logged')
          : '⚠️ Measurement pending for this Sunday'
      )
    ),

    // Comparison Grid
    createElement(
      'div',
      { className: 'grid grid-cols-2 gap-3.5' },
      renderComparisonCard('Body Weight', 'weight', Scale, 'kg'),
      renderComparisonCard('Waist Size', 'waist', Ruler, 'cm'),
      renderComparisonCard('Chest Size', 'chest', Ruler, 'cm'),
      renderComparisonCard('Arm Size', 'arm', Ruler, 'cm')
    ),

    // History Log
    createElement(
      'div',
      { className: 'space-y-3' },
      createElement('h3', { className: 'text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1' }, 'Measurement History'),
      
      measurements.length === 0
        ? createElement(
            'div',
            { className: 'text-center py-10 border border-dashed border-neutral-850 bg-neutral-900/10 rounded-2xl text-neutral-500 text-xs font-medium' },
            'No physical measurements saved yet.'
          )
        : createElement(
            'div',
            { className: 'space-y-2' },
            measurements.map(m =>
              createElement(
                'div',
                { key: m.id, className: 'bg-[#121212] border border-neutral-800/80 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-neutral-700 transition-colors' },
                createElement(
                  'div',
                  { className: 'space-y-1' },
                  createElement('h4', { className: 'text-xs font-bold text-neutral-300' }, formatDateFull(m.date)),
                  createElement(
                    'div',
                    { className: 'flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400 font-mono font-medium' },
                    createElement('span', null, `Wt: ${m.weight.toFixed(1)}kg`),
                    createElement('span', null, `Wst: ${m.waist.toFixed(1)}cm`),
                    createElement('span', null, `Cst: ${m.chest.toFixed(1)}cm`),
                    createElement('span', null, `Arm: ${m.arm.toFixed(1)}cm`)
                  )
                ),
                createElement(
                  'button',
                  {
                    onClick: () => handleDelete(m.id),
                    className: 'p-2 text-neutral-500 hover:text-red-400 rounded-lg cursor-pointer hover:bg-neutral-900 transition-colors'
                  },
                  createElement(Trash2, { className: 'w-4 h-4' })
                )
              )
            )
          )
    )
  );
}
