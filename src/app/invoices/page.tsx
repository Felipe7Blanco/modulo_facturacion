'use client'

import { useState, useMemo, useEffect } from "react"
import { Box, Container, Flex, Heading, Button, Grid, Text } from "@chakra-ui/react"
import { Divider } from "@chakra-ui/layout"
import { Plus, RotateCcw, FileText, Settings, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvoiceStatsCards } from "@/app/invoices/components/InvoiceStatsCards"
import { InvoiceFilters } from "@/app/invoices/components/InvoiceFilters"
import { InvoiceTable } from "@/app/invoices/components/InvoiceTable"
import { mockInvoices, calculateInvoiceStats, filterInvoices } from "@/data/MockingInVoices"
// IMPORTAR UTILITY PARA COMBINAR
import { combineInvoices } from "@/utils/invoiceStorage"
import { InvoiceStatus, IInvoice } from "@/types/invoice.types"

export default function InvoicesPage() {
    const router = useRouter()

    // Estados
    const [clientSearch, setClientSearch] = useState('')
    const [invoiceSearch, setInvoiceSearch] = useState('')
    const [statusValue, setStatusValue] = useState<InvoiceStatus | ''>('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading, setIsLoading] = useState(true) // Empezar cargando
    
    // Estado para TODAS las facturas (Mock + Locales)
    const [allInvoices, setAllInvoices] = useState<IInvoice[]>([])

    // Cargar facturas al montar componente
    useEffect(() => {
        setIsLoading(true)
        // Combinamos las facturas guardadas en localStorage con los Mocks
        const combined = combineInvoices(mockInvoices)
        setAllInvoices(combined)
        setIsLoading(false)
    }, [])

    // Función para refrescar
    const handleRefresh = () => {
        setIsLoading(true)
        const combined = combineInvoices(mockInvoices)
        setAllInvoices(combined)
        setTimeout(() => setIsLoading(false), 500)
    }

    // Lógica de filtrado (Ahora usa allInvoices en lugar de mockInvoices)
    const filteredInvoices = useMemo(() => {
        let data = allInvoices.filter(invoice => {
            const customerName = invoice.customer?.name || "";
            const currentInvoiceNumber = invoice.invoiceNumber || "";

            const matchesClient = clientSearch
                ? customerName.toLowerCase().includes(clientSearch.toLowerCase())
                : true;

            const matchesInvoiceNumber = invoiceSearch
                ? currentInvoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase())
                : true;

            return matchesClient && matchesInvoiceNumber;
        });

        return filterInvoices(data, {
            search: '',
            status: statusValue || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        })
    }, [allInvoices, clientSearch, invoiceSearch, statusValue, startDate, endDate]) // Dependencia: allInvoices

    const stats = useMemo(() => {
        return calculateInvoiceStats(filteredInvoices)
    }, [filteredInvoices])

    return (
        <Box minH="200vh" bg="purple.100" py={8}>
            <Container maxW="container.xl">

                {/* === PANEL DE CONTROL UNIFICADO === */}
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
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}><FileText size={18} /><Text fontSize="xs" mt={1}>Reporte</Text></Flex>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}><Settings size={18} /><Text fontSize="xs" mt={1}>Ajustes</Text></Flex>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }} onClick={handleRefresh}><RotateCcw size={18} /><Text fontSize="xs" mt={1}>Actualizar</Text></Flex>
                            </Flex>
                            <Box><InvoiceStatsCards stats={stats} /></Box>
                        </Flex>
                    </Grid>
                </Box>

                {/* Tabla de Resultados */}
                <Box bg="purple.200" borderRadius="xl" boxShadow="sm" overflow="hidden">
                    <InvoiceTable invoices={filteredInvoices} isLoading={isLoading} />
                    <Flex justify="space-between" align="center" p={4} borderTop="1px solid" borderColor="gray.100">
                        <Box fontSize="sm" color="gray.500">
                            Mostrando {filteredInvoices.length} de {allInvoices.length} facturas
                        </Box>
                    </Flex>
                </Box>

            </Container>
        </Box>
    )
}