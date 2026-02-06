'use client'

import { Box, Flex, Text } from "@chakra-ui/react"
import { Info } from "lucide-react"
import { InvoiceStats } from "@/types/invoice.types"

interface InvoiceStatsCardsProps {
  stats: InvoiceStats
}

export function InvoiceStatsCards({ stats }: InvoiceStatsCardsProps) {
  const statItems = [
    { label: "Sin enviar", count: stats.pending },
    { label: "Problema de envío", count: stats.problem },
    { label: "Rechazados", count: stats.rejected },
  ]

  return (
    <Box>
      <Text fontSize="md" fontWeight="600" color="gray.700" mb={4}>
        Tareas pendientes
      </Text>

      <Flex justify="space-between" align="center" gap={2}>
        {statItems.map((item, index) => (
          <Box key={index} textAlign="center" px={2}>
            {/* Número grande y fino */}
            <Text fontSize="3xl" fontWeight="300" color="gray.700" lineHeight="1.2">
              {item.count}
            </Text>
            
            {/* Texto pequeño con icono */}
            <Flex align="center" justify="center" gap={1} color="gray.500">
              <Text fontSize="xs" whiteSpace="nowrap">{item.label}</Text>
              <Info size={12} />
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}