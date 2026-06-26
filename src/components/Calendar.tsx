'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/context/ThemeContext'

interface CalendarProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onTimeSelect?: (time: { hour: number; minute: number }) => void
  selectedTime?: { hour: number; minute: number } | null
  availableDates?: Date[]
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
}

interface TimeSlot {
  hour: number
  minute: number
  available: boolean
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  onTimeSelect,
  selectedTime: externalSelectedTime,
  availableDates = [],
  disabledDates = [],
  minDate = new Date(),
  maxDate
}: CalendarProps) {
  const { currentTheme } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [internalSelectedTime, setInternalSelectedTime] = useState<TimeSlot | null>(null)
  
  // Usar tiempo externo si se proporciona, sino usar el interno
  const selectedTime = externalSelectedTime ? {
    hour: externalSelectedTime.hour,
    minute: externalSelectedTime.minute,
    available: true
  } : internalSelectedTime

  // Generar horarios disponibles (9 AM - 6 PM)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break // Terminar a las 6:00 PM
        slots.push({
          hour,
          minute,
          available: Math.random() > 0.3 // Simular disponibilidad (70% disponible)
        })
      }
    }
    return slots
  }

  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots())

  // Obtener días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({ date: day, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }

    // Días del siguiente mes para completar la última semana
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }

    return days
  }

  const days = getDaysInMonth(currentMonth)

  const isDateDisabled = (date: Date) => {
    // Verificar si la fecha está en el pasado
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true

    // Verificar fechas deshabilitadas
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    )
  }

  const isDateAvailable = (date: Date) => {
    // Si no hay fechas disponibles específicas, usar lógica por defecto
    if (availableDates.length === 0) {
      return !isDateDisabled(date) && date.getDay() !== 0 && date.getDay() !== 6 // No domingos ni sábados
    }
    
    return availableDates.some(availableDate => 
      date.toDateString() === availableDate.toDateString()
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const formatTime = (hour: number, minute: number) => {
    const time = new Date()
    time.setHours(hour, minute)
    return time.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handleDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return
    onDateSelect(date)
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="rounded-lg shadow-sm border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentTheme.colors.borderColor }}>
        <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded-full hover:opacity-75 transition-opacity"
            style={{ backgroundColor: `${currentTheme.colors.accent}10` }}
          >
            <ChevronLeftIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-full hover:opacity-75 transition-opacity"
            style={{ backgroundColor: `${currentTheme.colors.accent}10` }}
          >
            <ChevronRightIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: currentTheme.colors.borderColor }}>
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {days.map(({ date, isCurrentMonth }, index) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString()
          const isAvailable = isCurrentMonth && isDateAvailable(date)
          const isDisabled = !isCurrentMonth || isDateDisabled(date)

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled || !isAvailable}
              className={`
                relative p-3 text-sm transition-all duration-200
                ${isDisabled || !isAvailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:scale-105'}
              `}
              style={{
                color: isSelected 
                  ? 'white' 
                  : isCurrentMonth 
                    ? currentTheme.colors.text 
                    : currentTheme.colors.textSecondary,
                backgroundColor: isSelected 
                  ? currentTheme.colors.accent
                  : isAvailable && !isSelected && isCurrentMonth
                    ? `${currentTheme.colors.accent}05`
                    : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = `${currentTheme.colors.accent}15`
                }
              }}
              onMouseLeave={(e) => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.backgroundColor = `${currentTheme.colors.accent}05`
                }
              }}
            >
              {date.getDate()}
              {isAvailable && !isDisabled && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentTheme.colors.accentSecondary }}></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Horarios disponibles */}
      {selectedDate && (
        <div className="border-t p-4" style={{ borderColor: currentTheme.colors.borderColor }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: currentTheme.colors.text }}>
            Horarios disponibles para {selectedDate.toLocaleDateString('es-CO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {timeSlots.map(({ hour, minute, available }, index) => {
              const isSelected = selectedTime?.hour === hour && selectedTime?.minute === minute
              return (
                <button
                  key={index}
                  onClick={() => {
                    const timeSlot = { hour, minute, available }
                    setInternalSelectedTime(timeSlot)
                    if (onTimeSelect) {
                      onTimeSelect({ hour, minute })
                    }
                  }}
                  disabled={!available}
                  className="p-2 text-xs rounded-md border transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: isSelected 
                      ? currentTheme.colors.accent 
                      : available 
                        ? currentTheme.colors.borderColor 
                        : `${currentTheme.colors.borderColor}50`,
                    backgroundColor: isSelected 
                      ? currentTheme.colors.accent 
                      : available 
                        ? 'transparent' 
                        : `${currentTheme.colors.borderColor}20`,
                    color: isSelected 
                      ? 'white' 
                      : available 
                        ? currentTheme.colors.text 
                        : currentTheme.colors.textSecondary,
                    cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (available && !isSelected) {
                      e.currentTarget.style.borderColor = currentTheme.colors.accent
                      e.currentTarget.style.backgroundColor = `${currentTheme.colors.accent}10`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (available && !isSelected) {
                      e.currentTarget.style.borderColor = currentTheme.colors.borderColor
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {formatTime(hour, minute)}
                </button>
              )
            })}
          </div>
          
          {selectedTime && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}15` }}>
              <p className="text-sm" style={{ color: currentTheme.colors.text }}>
                <strong>Horario seleccionado:</strong> {formatTime(selectedTime.hour, selectedTime.minute)} del {selectedDate.toLocaleDateString('es-CO')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}