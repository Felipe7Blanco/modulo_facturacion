'use client'

import { Box, Table, Badge, Avatar, Flex, Text, IconButton } from "@chakra-ui/react"
import { Download, Eye, Mail, MoreVertical } from "lucide-react"
import { IInvoice, InvoiceStatus } from "@/types/invoice.types"
import { formatCurrency, formatDate } from "@/utils/helpers"
import Link from "next/link"

interface InvoiceTableProps {
  invoices: IInvoice[]
  isLoading?: boolean
}

// Configuración de colores por estado
const statusConfig: Record<InvoiceStatus, { label: string; colorScheme: string; bg: string }> = {
  draft: { label: 'Borrador', colorScheme: 'gray', bg: '#718096' },
  pending: { label: 'Pendiente', colorScheme: 'orange', bg: '#F59E0B' },
  sent: { label: 'Enviado', colorScheme: 'blue', bg: '#3B82F6' },
  paid: { label: 'Pagado', colorScheme: 'green', bg: '#10B981' },
  rejected: { label: 'Rechazado', colorScheme: 'red', bg: '#EF4444' },
  overdue: { label: 'Vencido', colorScheme: 'red', bg: '#DC2626' },
}

export function InvoiceTable({ invoices, isLoading = false }: InvoiceTableProps) {
  
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (invoices.length === 0) {
    return (
      <Box
        bg="white"
        p={12}
        borderRadius="lg"
        textAlign="center"
        color="gray.500"
      >
        <Text fontSize="lg">No se encontraron facturas</Text>
        <Text fontSize="sm" mt={2}>
          Intenta ajustar los filtros de búsqueda
        </Text>
      </Box>
    )
  }

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table.Root variant="line" size="sm">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase">
                Fecha
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase">
                Número
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase">
                Cliente
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase">
                Estado
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" textAlign="right">
                Total
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" textAlign="center">
                Acciones
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {invoices.map((invoice) => (
              <Table.Row
                key={invoice._id}
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
              >
                {/* Fecha */}
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(invoice.issueDate)}
                  </Text>
                </Table.Cell>

                {/* Número de factura */}
                <Table.Cell>
                  <Link href={`/invoices/${invoice._id}`}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="brand.500"
                      _hover={{ textDecoration: 'underline' }}
                      cursor="pointer"
                    >
                      {invoice.invoiceNumber}
                    </Text>
                  </Link>
                </Table.Cell>

                {/* Cliente con avatar */}
                <Table.Cell>
                  <Flex align="center" gap={3}>
                    {/*<Avatar
                      size="sm"
                      name={invoice.customer.name}
                      src={invoice.customer.avatar?.url}
                    /> */}
                    <Box>
                      <Text fontSize="sm" fontWeight="500" color="gray.700">
                        {invoice.customer.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {invoice.customer.email}
                      </Text>
                    </Box>
                  </Flex>
                </Table.Cell>

                {/* Estado */}
                <Table.Cell>
                  <Badge
                    colorScheme={statusConfig[invoice.status].colorScheme}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="capitalize"
                  >
                    {statusConfig[invoice.status].label}
                  </Badge>
                </Table.Cell>

                {/* Total */}
                <Table.Cell textAlign="right">
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </Text>
                </Table.Cell>

                {/* Acciones */}
                <Table.Cell>
                  <Flex gap={2} justify="center">
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      aria-label="Ver factura"
                      onClick={() => window.open(`/invoices/${invoice._id}`, '_blank')}
                    >
                      <Eye size={16} />
                    </IconButton>

                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      aria-label="Descargar factura"
                      onClick={() => console.log('Descargar', invoice._id)}
                    >
                      <Download size={16} />
                    </IconButton>

                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
                      aria-label="Enviar por correo"
                      onClick={() => console.log('Enviar email', invoice._id)}
                    >
                      <Mail size={16} />
                    </IconButton>

                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="gray"
                      aria-label="Más opciones"
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  )
}

// Componente de Loading Skeleton
function LoadingSkeleton() {
  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={4}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Flex key={i} gap={4} py={3} borderBottom="1px solid" borderColor="gray.100">
          <Box className="skeleton" h="40px" w="100px" borderRadius="md" />
          <Box className="skeleton" h="40px" w="120px" borderRadius="md" />
          <Box className="skeleton" h="40px" flex="1" borderRadius="md" />
          <Box className="skeleton" h="40px" w="100px" borderRadius="md" />
          <Box className="skeleton" h="40px" w="120px" borderRadius="md" />
        </Flex>
      ))}
    </Box>
  )
}