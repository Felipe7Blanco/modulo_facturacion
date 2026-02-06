'use client'

import { Box, Input, Text, Grid } from "@chakra-ui/react"
import { InvoiceStatus } from "@/types/invoice.types"

interface InvoiceFiltersProps {
  // AGREGA ESTO:
  clientSearch: string
  onClientSearchChange: (value: string) => void
  invoiceSearch: string
  onInvoiceSearchChange: (value: string) => void

  // MANTÉN EL RESTO IGUAL:
  onStatusChange: (value: InvoiceStatus | '') => void
  onDateRangeChange: (start: string, end: string) => void
  statusValue: InvoiceStatus | ''
  startDate: string
  endDate: string
}

export function InvoiceFilters({
  clientSearch,
  invoiceSearch,
  onInvoiceSearchChange,
  onStatusChange,
  onDateRangeChange,
  onClientSearchChange,
  statusValue,
  startDate,
  endDate,
}: InvoiceFiltersProps) {

  // === LÓGICA COMBO BOX ===
  const statusOptions: Array<{ value: InvoiceStatus | '', label: string }> = [

    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'sent', label: 'Enviado' },
    { value: 'paid', label: 'Pagado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'overdue', label: 'Vencido' },
  ]

  return (
    <Box width="100%">

      {/* Fila 1: Búsquedas de texto */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={4}>
        <Box>
          <Text fontSize="xs" color="black.50" mb={1}>Búsqueda por nombre de cliente</Text>
          {/* Input de CLIENTE */}
          <Input
            placeholder="Ejemplo: Juan"
            value={clientSearch}  // <-- CAMBIO AQUÍ
            onChange={(e) => onClientSearchChange(e.target.value)} // <-- CAMBIO AQUÍ
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
        <Box>
          <Text fontSize="xs" color="black.50" mb={1}>Búsqueda por factura</Text>
          {/* Input de FACTURA */}
           <Input
            placeholder="Ejemplo: TW0001"
            value={invoiceSearch} // <-- CAMBIO AQUÍ
            onChange={(e) => onInvoiceSearchChange(e.target.value)} // <-- CAMBIO AQUÍ
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
      </Grid>

      {/* Fila 2: Fechas */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={4}>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Fecha inicial</Text>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onDateRangeChange(e.target.value, endDate)}
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Fecha final</Text>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onDateRangeChange(startDate, e.target.value)}
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
      </Grid>

      {/* Fila 3: Selectores (Cliente y Estado) */}
      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Cliente</Text>
          <select
            
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem',
              backgroundColor: '#f7fafc',
              borderRadius: '0.375rem',
              borderColor: '#cbd5e0',
              borderWidth: '1px',
              width: '100%'
            }}
          >
            <option value="">Buscar por cliente</option>
          </select>
        </Box>

        {/* === SELECT DE ESTADO CORREGIDO === */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Estado</Text>
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value as InvoiceStatus | '')}
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem',
              backgroundColor: '#f7fafc',
              borderRadius: '0.375rem',
              borderColor: '#cbd5e0',
              borderWidth: '1px',
              width: '100%'
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Box>
      </Grid>
    </Box>
  )
}