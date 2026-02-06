'use client'

import { Box, Input, Text, Grid } from "@chakra-ui/react"
import { InvoiceStatus } from "@/types/invoice.types"

interface InvoiceFiltersProps {
  clientSearch: string
  onClientSearchChange: (value: string) => void
  invoiceSearch: string
  onInvoiceSearchChange: (value: string) => void
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
    <Box width="100%" mb={4}> {/* Margen inferior extra para separar del botón crear */}

      {/* Fila 1: Búsquedas de texto (Cliente y Factura) */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={4}>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Búsqueda por nombre de cliente</Text>
          <Input
            placeholder="Ejemplo: Juan"
            value={clientSearch}
            onChange={(e) => onClientSearchChange(e.target.value)}
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Búsqueda por factura</Text>
          <Input
            placeholder="Ejemplo: TW0001"
            value={invoiceSearch}
            onChange={(e) => onInvoiceSearchChange(e.target.value)}
            size="sm"
            borderRadius="md"
            bg="gray.50"
            borderColor="gray.200"
          />
        </Box>
      </Grid>

      {/* Fila 2: Fechas Y Estado (Ahora todo en una línea de 3 columnas) */}
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
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
        
        {/* El estado ahora vive aquí, lejos del botón de abajo */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1}>Estado</Text>
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value as InvoiceStatus | '')}
            style={{
              fontSize: '0.875rem',
              padding: '0.35rem', // Ajustado para coincidir visualmente con inputs sm
              backgroundColor: '#f7fafc',
              borderRadius: '0.375rem',
              borderColor: '#e2e8f0',
              borderWidth: '1px',
              width: '100%',
              height: '32px' // Altura forzada para igualar a los inputs sm
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