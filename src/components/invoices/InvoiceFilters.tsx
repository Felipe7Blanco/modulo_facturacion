'use client'

import { Box, Flex, Input, Stack } from "@chakra-ui/react"
import { Search, Calendar, Filter } from "lucide-react"
import { InvoiceStatus } from "@/types/invoice.types"

interface InvoiceFiltersProps {
  onSearchChange: (value: string) => void
  onStatusChange: (value: InvoiceStatus | '') => void
  onDateRangeChange: (start: string, end: string) => void
  searchValue: string
  statusValue: InvoiceStatus | ''
  startDate: string
  endDate: string
}

export function InvoiceFilters({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  searchValue,
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
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      mb={6}
    >
      <Stack gap={4}>
        {/* Primera fila: Búsqueda y Estado */}
        <Flex
          gap={4}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
        >
          {/* Búsqueda por cliente o número */}
          <Box flex="1" position="relative">
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
            >
              <Search size={20} />
            </Box>
            <Input
              placeholder="Buscar por cliente o número de factura..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              pl="40px"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _focus={{
                bg: "white",
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--tw-primary)",
              }}
              fontSize="sm"
            />
          </Box>

          {/* Filtro por estado */}
          <Box minW={{ base: "100%", md: "200px" }}>
            <select
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value as InvoiceStatus | '')}
              style={{
                width: "100%",
                padding: "8px 12px",
                paddingLeft: "36px",
                fontSize: "14px",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                backgroundColor: "#F7FAFC",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
              display={{ base: "none", md: "block" }}
            >
              <Filter size={16} />
            </Box>
          </Box>
        </Flex>

        {/* Segunda fila: Filtro de fechas */}
        <Flex
          gap={4}
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
        >
          {/* Fecha inicial */}
          <Box flex="1" position="relative">
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
              zIndex={1}
            >
              <Calendar size={16} />
            </Box>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onDateRangeChange(e.target.value, endDate)}
              pl="40px"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _focus={{
                bg: "white",
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--tw-primary)",
              }}
              fontSize="sm"
            />
          </Box>

          {/* Fecha final */}
          <Box flex="1" position="relative">
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              pointerEvents="none"
              zIndex={1}
            >
              <Calendar size={16} />
            </Box>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onDateRangeChange(startDate, e.target.value)}
              pl="40px"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _focus={{
                bg: "white",
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--tw-primary)",
              }}
              fontSize="sm"
            />
          </Box>
        </Flex>
      </Stack>
    </Box>
  )
}