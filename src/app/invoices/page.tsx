'use client'

import { useState, useMemo, useEffect } from "react"
import { Box, Container, Flex, Heading, Button, Grid, Text, IconButton } from "@chakra-ui/react"
import { Divider } from "@chakra-ui/layout"
import { Plus, RotateCcw, FileText, Send, ChevronLeft, ChevronRight, X, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvoiceStatsCards } from "@/app/invoices/components/InvoiceStatsCards"
import { InvoiceFilters } from "@/app/invoices/components/InvoiceFilters"
import { InvoiceTable } from "@/app/invoices/components/InvoiceTable"
import { mockInvoices, calculateInvoiceStats, filterInvoices } from "@/data/MockingInVoices"
import { combineInvoices } from "@/utils/invoiceStorage"
import { InvoiceStatus, IInvoice } from "@/types/invoice.types"

const ITEMS_PER_PAGE = 10;

export default function InvoicesPage() {
    const router = useRouter()

    const [clientSearch, setClientSearch] = useState('')
    const [invoiceSearch, setInvoiceSearch] = useState('')
    const [statusValue, setStatusValue] = useState<InvoiceStatus | ''>('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const [allInvoices, setAllInvoices] = useState<IInvoice[]>([])
    const [currentPage, setCurrentPage] = useState(1)

    // Estados para funcionalidades
    const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc'>('desc')

    // Estados Menu Reportes
    const [showReports, setShowReports] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        const combined = combineInvoices(mockInvoices)
        setAllInvoices(combined)
        setIsLoading(false)
    }, [])

    const handleRefresh = () => {
        setIsLoading(true)
        const combined = combineInvoices(mockInvoices)
        setAllInvoices(combined)
        setCurrentPage(1)
        setTimeout(() => setIsLoading(false), 500)
    }

    const filteredInvoices = useMemo(() => {
        let data = allInvoices.filter(invoice => {
            const customerName = invoice.customer?.name || "";
            const currentInvoiceNumber = invoice.invoiceNumber || "";
            const matchesClient = clientSearch ? customerName.toLowerCase().includes(clientSearch.toLowerCase()) : true;
            const matchesInvoiceNumber = invoiceSearch ? currentInvoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) : true;
            return matchesClient && matchesInvoiceNumber;
        });

        // 1. Filtrar primero
        data = filterInvoices(data, {
            search: '',
            status: statusValue || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        })

        // 2. Aplicar ordenamiento por fecha
        data = data.sort((a, b) => {
            const dateA = new Date(a.issueDate).getTime();
            const dateB = new Date(b.issueDate).getTime();
            return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setCurrentPage(1)
        return data;
    }, [allInvoices, clientSearch, invoiceSearch, statusValue, startDate, endDate, dateSortOrder])

    const stats = useMemo(() => {
        return calculateInvoiceStats(filteredInvoices)
    }, [filteredInvoices])

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)

    const currentInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        return filteredInvoices.slice(startIndex, endIndex)
    }, [filteredInvoices, currentPage])

    // --- DATOS PARA LA GRÁFICA DE REPORTES ---
    const maxChartValue = Math.max(stats.paid || 0, stats.pending || 0, stats.sent || 0, stats.problem || 0, 1);

    return (
        <Box minH="200vh" bg="purple.100" py={8}>
            <Container maxW="container.xl" position="relative">

                {/* === MODAL DE REPORTES (Gráfica de Barras) === */}
                {showReports && (
                    <Box position="absolute" top="100px" right="0" left="0" margin="auto" w="500px" bg="white" borderRadius="xl" boxShadow="2xl" zIndex={100} p={6} border="1px solid" borderColor="purple.200" animation="fade-in 0.2s">
                        <Flex justify="space-between" align="center" mb={6}>
                            <Flex align="center" gap={2} color="purple.600">
                                <BarChart2 size={24} />
                                <Heading size="md">Reporte de Facturación</Heading>
                            </Flex>
                            <IconButton aria-label="Cerrar" size="sm" variant="ghost" onClick={() => setShowReports(false)}><X size={18} /></IconButton>
                        </Flex>

                        <Text fontSize="sm" color="gray.500" mb={6}>
                            Distribución de estado según las {filteredInvoices.length} facturas en el rango de fechas seleccionado.
                        </Text>

                        {/* Gráfica CSS */}
                        <Flex h="200px" align="flex-end" justify="space-around" borderBottom="2px solid" borderColor="gray.200" pb={2} pt={4}>
                            <ChartBar label="Pagadas" value={stats.paid} max={maxChartValue} color="green.400" />
                            <ChartBar label="Pendientes" value={stats.pending} max={maxChartValue} color="orange.400" />
                            <ChartBar label="Enviadas" value={stats.sent} max={maxChartValue} color="blue.400" />
                            <ChartBar label="Vencidas" value={stats.problem} max={maxChartValue} color="red.400" />
                        </Flex>
                    </Box>
                )}

                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" mb={6}>
                    <Heading size="xl" color="purple.600" mb={1}>Búsqueda de Facturas</Heading>

                    <Grid templateColumns={{ base: "1fr", lg: "7fr 1px 4fr" }} gap={4}>
                        <Box>
                            <InvoiceFilters
                                clientSearch={clientSearch} onClientSearchChange={setClientSearch}
                                invoiceSearch={invoiceSearch} onInvoiceSearchChange={setInvoiceSearch}
                                statusValue={statusValue} onStatusChange={setStatusValue}
                                startDate={startDate} endDate={endDate}
                                onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end) }}
                            />

                            <Flex gap={3} mt={6} width="full">
                                <Button variant="outline" colorPalette="purple" size="md" flex={1}>
                                    <Send size={16} style={{ marginRight: '8px' }} /> Envío masivo a la DIAN
                                </Button>
                                <Button bg="purple.500" color="white" _hover={{ bg: "purple.600" }} size="md" flex={1} onClick={() => router.push('/invoices/create')}>
                                    <Plus size={18} style={{ marginRight: '8px' }} /> Crear factura
                                </Button>
                            </Flex>
                        </Box>

                        <Divider orientation="vertical" h="100%" borderColor="gray.200" display={{ base: "none", lg: "block" }} />

                        <Flex direction="column">
                            <Flex justify="space-around" color="purple.500" mb={8} mt={8}>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }} onClick={() => setShowReports(true)}><FileText size={18} /><Text fontSize="xs" mt={1}>Reporte</Text></Flex>
                                {/* Botón de Ajustes Eliminado */}
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }} onClick={handleRefresh}><RotateCcw size={18} /><Text fontSize="xs" mt={1}>Actualizar</Text></Flex>
                            </Flex>
                            <Box><InvoiceStatsCards stats={stats} /></Box>
                        </Flex>
                    </Grid>
                </Box>

                <Box bg="purple.200" borderRadius="xl" boxShadow="sm" overflow="hidden">
                    <InvoiceTable
                        invoices={currentInvoices}

                        dateSortOrder={dateSortOrder}
                        onToggleSort={() => setDateSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    />

                    <Flex justify="space-between" align="center" p={4} bg="white" borderTop="1px solid" borderColor="gray.100">
                        <Box fontSize="sm" color="gray.500">
                            Mostrando {currentInvoices.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} de {filteredInvoices.length} facturas
                        </Box>

                        {totalPages > 1 && (
                            <Flex gap={2} align="center">
                                <Button
                                    size="sm" variant="outline" colorPalette="purple"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} /> Anterior
                                </Button>
                                <Text fontSize="sm" fontWeight="500" px={2}>Pág {currentPage} de {totalPages}</Text>
                                <Button
                                    size="sm" variant="outline" colorPalette="purple"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente <ChevronRight size={16} />
                                </Button>
                            </Flex>
                        )}
                    </Flex>
                </Box>

            </Container>
        </Box>
    )
}

function ChartBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
    const heightPercent = max === 0 ? 0 : (value / max) * 100;
    return (
        <Flex direction="column" align="center" justify="flex-end" h="100%" w="50px" gap={2}>
            <Text fontSize="xs" fontWeight="bold" color={color}>{value}</Text>
            <Box w="100%" h={`${heightPercent}%`} minH={value > 0 ? "4px" : "0"} bg={color} borderRadius="t-md" transition="height 0.5s ease-out" />
            <Text fontSize="xs" color="gray.600" mt={1}>{label}</Text>
        </Flex>
    )
}