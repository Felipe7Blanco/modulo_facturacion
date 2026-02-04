'use client'

import { Box, Card, Flex, Text } from "@chakra-ui/react"
import { FileX, AlertCircle, XCircle } from "lucide-react"
import { InvoiceStats } from "@/types/invoice.types"

interface InvoiceStatsCardsProps {
  stats: InvoiceStats
}

export function InvoiceStatsCards({ stats }: InvoiceStatsCardsProps) {
  const cards = [
    {
      label: "Sin enviar",
      count: stats.pending,
      icon: FileX,
      color: "#718096", // Gris
    },
    {
      label: "Problema de envío",
      count: stats.problem,
      icon: AlertCircle,
      color: "#F59E0B", // Naranja/Amarillo
    },
    {
      label: "Rechazados",
      count: stats.rejected,
      icon: XCircle,
      color: "#EF4444", // Rojo
    },
  ]

  return (
    <Box mb={6}>
      {/* Título */}
      <Text fontSize="lg" fontWeight="600" color="gray.700" mb={3}>
        Tareas pendientes
      </Text>

      {/* Grid de tarjetas */}
      <Flex gap={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
        {cards.map((card) => (
          <Card.Root
            key={card.label}
            flex="1"
            minW={{ base: "100%", sm: "150px", md: "200px" }}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            _hover={{
              boxShadow: "md",
              transform: "translateY(-2px)",
              transition: "all 0.2s",
            }}
            cursor="pointer"
          >
            <Card.Body p={4}>
              <Flex align="center" justify="space-between">
                {/* Número grande */}
                <Box>
                  <Text
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="700"
                    color={card.color}
                    lineHeight="1"
                  >
                    {card.count}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    mt={1}
                    fontWeight="500"
                  >
                    {card.label}
                  </Text>
                </Box>

                {/* Ícono */}
                <Box
                  bg={`${card.color}15`}
                  p={3}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <card.icon size={24} color={card.color} strokeWidth={2} />
                </Box>
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Flex>
    </Box>
  )
}