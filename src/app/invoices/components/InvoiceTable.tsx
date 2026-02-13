'use client'

import { 
  Box, Table, Badge, Avatar, Flex, Text, Button, 
  Drawer, useDisclosure 
} from "@chakra-ui/react"
import { Download, Eye, Mail, FileText, ArrowUp, ArrowDown } from "lucide-react"
import { IInvoice, InvoiceStatus } from "@/types/invoice.types"
import { formatCurrency, formatDate } from "@/utils/helpers"
import Link from "next/link"
import { useState } from "react"
import * as XLSX from 'xlsx'

interface InvoiceTableProps {
  invoices: IInvoice[]
  isLoading?: boolean
  dateSortOrder?: 'asc' | 'desc'
  onToggleSort?: () => void
}

const statusConfig: Record<InvoiceStatus, { label: string; colorPalette: string }> = {
  draft: { label: 'Borrador', colorPalette: 'gray' },
  pending: { label: 'Pendiente', colorPalette: 'orange' },
  sent: { label: 'Enviado', colorPalette: 'blue' },
  paid: { label: 'Pagado', colorPalette: 'green' },
  rejected: { label: 'Rechazado', colorPalette: 'red' },
  overdue: { label: 'Vencido', colorPalette: 'red' },
}

export function InvoiceTable({ invoices, isLoading = false, dateSortOrder = 'desc', onToggleSort }: InvoiceTableProps) {
  const { open, onOpen, onClose } = useDisclosure()
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null)

  const handleDownloadExcel = (invoice: IInvoice) => {
    const dataToExport = [{
      Fecha: formatDate(invoice.issueDate),
      Número: invoice.invoiceNumber,
      Cliente: invoice.customer.name,
      Email: invoice.customer.email,
      Estado: statusConfig[invoice.status].label,
      Total: invoice.total
    }]

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factura")
    XLSX.writeFile(workbook, `Factura_${invoice.invoiceNumber}.xlsx`)
  }

  const handleSendMail = (email: string, invoiceNum: string, total: number) => {
    const subject = `Factura ${invoiceNum} pendiente de revisión`
    const body = `Hola,\n\nAdjunto los detalles de la factura ${invoiceNum} por un valor de $${total}.\n\nSaludos.`
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleViewDetail = (invoice: IInvoice) => {
    setSelectedInvoice(invoice)
    onOpen()
  }

  const SafeDivider = () => <Box h="1px" bg="gray.200" w="full" my={4} />

  if (isLoading) return <Box p={4} bg="white">Cargando facturas...</Box>

  if (invoices.length === 0) {
    return (
      <Box bg="white" p={12} textAlign="center" color="gray.500">
        <Text fontSize="lg" fontWeight="500">No se encontraron facturas</Text>
        <Text fontSize="sm" mt={2}>Intenta ajustar los filtros de búsqueda</Text>
      </Box>
    )
  }

  return (
    <>
      <Box bg="white" overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="md" interactive>
            <Table.Header bg="gray.50">
              <Table.Row>
                
                {/* === COLUMNA FECHA CON BOTÓN DE ORDENAMIENTO === */}
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                  <Flex 
                    align="center" 
                    gap={2} 
                    cursor="pointer" 
                    onClick={onToggleSort} 
                    _hover={{ color: "purple.600" }}
                    transition="color 0.2s"
                    display="inline-flex"
                    userSelect="none"
                  >
                    FECHA
                    <Flex direction="column" gap="1px" ml={1}>
                        <ArrowUp 
                            size={12} 
                            color={dateSortOrder === 'asc' ? '#38A169' : '#A0AEC0'} 
                            strokeWidth={dateSortOrder === 'asc' ? 3 : 2} 
                            style={{ opacity: dateSortOrder === 'asc' ? 1 : 0.4 }}
                        />
                        <ArrowDown 
                            size={12} 
                            color={dateSortOrder === 'desc' ? '#E53E3E' : '#A0AEC0'} 
                            strokeWidth={dateSortOrder === 'desc' ? 3 : 2} 
                            style={{ opacity: dateSortOrder === 'desc' ? 1 : 0.4, marginTop: '-4px' }}
                        />
                    </Flex>
                  </Flex>
                </Table.ColumnHeader>
                
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Número</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Cliente</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Estado</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="end">Total</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {invoices.map((invoice) => (
                <Table.Row key={invoice._id} _hover={{ bg: 'purple.50' }} transition="all 0.2s">
                  <Table.Cell fontSize="sm" color="gray.600" whiteSpace="nowrap">
                    {formatDate(invoice.issueDate)}
                  </Table.Cell>

                  <Table.Cell>
                    <Link href={`/invoices/${invoice._id}`}>
                      <Flex align="center" gap={1} color="purple.600" fontWeight="600" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        <FileText size={14} />
                        {invoice.invoiceNumber}
                      </Flex>
                    </Link>
                  </Table.Cell>

                  <Table.Cell>
                    <Flex align="center" gap={3}>
                      <Avatar.Root size="xs" bg="purple.100">
                        <Avatar.Image src={invoice.customer.avatar?.url} />
                        <Avatar.Fallback color="purple.600">
                             {invoice.customer.name.charAt(0)}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Box>
                        <Text fontSize="sm" fontWeight="600" color="gray.700">{invoice.customer.name}</Text>
                        <Text fontSize="xs" color="gray.500">{invoice.customer.email}</Text>
                      </Box>
                    </Flex>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge colorPalette={statusConfig[invoice.status].colorPalette} variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600" textTransform="capitalize">
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </Table.Cell>

                  <Table.Cell textAlign="end">
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </Text>
                  </Table.Cell>

                  <Table.Cell>
                    <Flex gap={1} justify="center">
                      <Button size="sm" variant="ghost" colorPalette="gray" title="Ver detalle" onClick={() => handleViewDetail(invoice)}><Eye size={18} /></Button>
                      <Button size="sm" variant="ghost" colorPalette="green" title="Descargar Excel" onClick={() => handleDownloadExcel(invoice)}><Download size={18} /></Button>
                      <Button size="sm" variant="ghost" colorPalette="blue" title="Enviar correo" onClick={() => handleSendMail(invoice.customer.email, invoice.invoiceNumber, invoice.total)}><Mail size={18} /></Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>

      <Drawer.Root open={open} onOpenChange={(e) => e.open ? onOpen() : onClose()} size="md">
        <Drawer.Backdrop />
        <Drawer.Positioner>
            <Drawer.Content>
            <Drawer.Header borderBottomWidth="1px" bg="gray.50">
                <Drawer.Title>Resumen de Factura</Drawer.Title>
                <Drawer.CloseTrigger />
            </Drawer.Header>

            <Drawer.Body py={6} bg="white">
                {selectedInvoice && (
                <Flex direction="column" gap={6}>
                    <Box textAlign="center" py={4} bg="purple.50" borderRadius="lg" border="1px dashed" borderColor="purple.200">
                        <Text fontSize="sm" color="purple.600" fontWeight="600">Total a Pagar</Text>
                        <Text fontSize="3xl" fontWeight="800" color="purple.700">{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</Text>
                        <Badge mt={2} colorPalette={statusConfig[selectedInvoice.status].colorPalette}>{statusConfig[selectedInvoice.status].label}</Badge>
                    </Box>

                    <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3} textTransform="uppercase" letterSpacing="wider">Cliente</Text>
                        <Flex align="center" gap={3} p={3} border="1px solid" borderColor="gray.100" borderRadius="md">
                            <Avatar.Root>
                                <Avatar.Fallback>{selectedInvoice.customer.name.charAt(0)}</Avatar.Fallback>
                                <Avatar.Image src={selectedInvoice.customer.avatar?.url} />
                            </Avatar.Root>
                            <Box>
                                <Text fontWeight="600" color="gray.800">{selectedInvoice.customer.name}</Text>
                                <Text fontSize="sm" color="gray.500">{selectedInvoice.customer.email}</Text>
                            </Box>
                        </Flex>
                    </Box>

                    <Flex justify="space-between" gap={4}>
                        <Box flex={1}><Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase">Emisión</Text><Text fontSize="sm" fontWeight="500">{formatDate(selectedInvoice.issueDate)}</Text></Box>
                        <Box flex={1}><Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} textTransform="uppercase">N° Factura</Text><Text fontSize="sm" fontWeight="500">{selectedInvoice.invoiceNumber}</Text></Box>
                    </Flex>

                    <SafeDivider />

                    <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3} textTransform="uppercase" letterSpacing="wider">Productos / Servicios</Text>
                        <Box bg="gray.50" borderRadius="md" p={2}>
                            {selectedInvoice.invoiceItems.map((item, idx) => (
                                <Flex key={idx} justify="space-between" py={2} borderBottom={idx !== selectedInvoice.invoiceItems.length - 1 ? "1px dashed #E2E8F0" : "none"}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700">{item.name}</Text>
                                        <Text fontSize="xs" color="gray.500">Cant: {item.quantity} x {formatCurrency(item.price, selectedInvoice.currency)}</Text>
                                    </Box>
                                    <Text fontSize="sm" fontWeight="bold" color="gray.700">{formatCurrency(item.total, selectedInvoice.currency)}</Text>
                                </Flex>
                            ))}
                        </Box>
                    </Box>

                    <Flex direction="column" gap={2} mt="auto">
                        <Flex justify="space-between" fontSize="sm"><Text color="gray.500">Subtotal</Text><Text fontWeight="600">{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</Text></Flex>
                        <Flex justify="space-between" fontSize="sm"><Text color="gray.500">Impuestos</Text><Text fontWeight="600">{formatCurrency(selectedInvoice.totalTax, selectedInvoice.currency)}</Text></Flex>
                        <SafeDivider />
                        <Flex justify="space-between" fontSize="lg" fontWeight="bold" color="purple.600"><Text>Total</Text><Text>{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</Text></Flex>
                    </Flex>
                </Flex>
                )}
            </Drawer.Body>
            </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}