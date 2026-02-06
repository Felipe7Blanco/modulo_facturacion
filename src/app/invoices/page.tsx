'use client'

import { useState, useMemo } from "react"
import { Box, Container, Flex, Heading, Button, Grid, Text } from "@chakra-ui/react"
import { Divider } from "@chakra-ui/layout"
import { Plus, RotateCcw, FileText, Settings, Send } from "lucide-react" // Agregué el icono Send
import { useRouter } from "next/navigation"
import { InvoiceStatsCards } from "@/app/invoices/components/InvoiceStatsCards"
import { InvoiceFilters } from "@/app/invoices/components/InvoiceFilters"
import { InvoiceTable } from "@/app/invoices/components/InvoiceTable"
import { mockInvoices, calculateInvoiceStats, filterInvoices } from "@/data/MockingInVoices"
import { InvoiceStatus } from "@/types/invoice.types"

export default function InvoicesPage() {
    const router = useRouter()

    // Estados
    const [clientSearch, setClientSearch] = useState('')
    const [invoiceSearch, setInvoiceSearch] = useState('')
    const [statusValue, setStatusValue] = useState<InvoiceStatus | ''>('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading] = useState(false)

    // Función para refrescar
    const handleRefresh = () => {
        window.location.reload()
    }

    // Lógica de filtrado
    const filteredInvoices = useMemo(() => {
        let data = mockInvoices.filter(invoice => {
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
    }, [clientSearch, invoiceSearch, statusValue, startDate, endDate])

    const stats = useMemo(() => {
        return calculateInvoiceStats(filteredInvoices)
    }, [filteredInvoices])

    return (
        <Box minH="200vh" bg="purple.100" py={8}>
            <Container maxW="container.xl">

                {/* === PANEL DE CONTROL UNIFICADO === */}
                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" mb={6}>

                    <Heading size="xl" color="purple.600" mb={1}>
                        Búsqueda de Facturas
                    </Heading>

                    {/* Layout dividido: 7 partes Filtros | separador | 4 partes Stats */}
                    <Grid templateColumns={{ base: "1fr", lg: "7fr 1px 4fr" }} gap={4}>

                        {/* === COLUMNA IZQUIERDA: Filtros y Botones de Acción === */}
                        <Box>
                            <InvoiceFilters
                                clientSearch={clientSearch}
                                onClientSearchChange={setClientSearch}
                                invoiceSearch={invoiceSearch}
                                onInvoiceSearchChange={setInvoiceSearch}
                                statusValue={statusValue}
                                startDate={startDate}
                                endDate={endDate}
                                onStatusChange={setStatusValue}
                                onDateRangeChange={(start, end) => {
                                    setStartDate(start)
                                    setEndDate(end)
                                }}
                            />
                            
                            
                            {/* BOTONES EXPANDIDOS (Llenan el espacio restante) */}
                            <Flex gap={3} mt={6} width="full">
                                <Button
                                    variant="outline"
                                    colorPalette="purple" // Ajustado a V3
                                    size="md"
                                    flex={1} // <--- ESTA ES LA CLAVE: Hace que ocupe el 50%
                                >
                                    <Send size={16} style={{ marginRight: '8px' }} />
                                    Envío masivo a la DIAN
                                </Button>

                                <Button
                                    bg="purple.500"
                                    color="white"
                                    _hover={{ bg: "purple.600" }}
                                    size="md"
                                    flex={1} // <--- ESTA ES LA CLAVE: Hace que ocupe el otro 50%
                                    onClick={() => router.push('/invoices/create')}
                                >
                                    <Plus size={18} style={{ marginRight: '8px' }} />
                                    Crear factura
                                </Button>
                            </Flex>
                        </Box>

                        {/* SEPARADOR VERTICAL */}
                        <Divider orientation="vertical" h="100%" borderColor="gray.200" display={{ base: "none", lg: "block" }} />

                        {/* === COLUMNA DERECHA: Iconos y Stats (Ahora más limpia) === */}
                        <Flex direction="column">

                            {/* Iconos de herramientas (Bajados para mejor estética) */}
                            <Flex justify="space-around" color="purple.500" mb={8} mt={8}>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}>
                                    <FileText size={18} />
                                    <Text fontSize="xs" mt={1}>Reporte</Text>
                                </Flex>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}>
                                    <Settings size={18} />
                                    <Text fontSize="xs" mt={1}>Ajustes</Text>
                                </Flex>
                                <Flex 
                                    direction="column" 
                                    align="center" 
                                    cursor="pointer" 
                                    _hover={{ color: "purple.700" }}
                                    onClick={handleRefresh}
                                >
                                    <RotateCcw size={18} />
                                    <Text fontSize="xs" mt={1}>Actualizar</Text>
                                </Flex>
                            </Flex>

                            {/* Estadísticas */}
                            <Box>
                                <InvoiceStatsCards stats={stats} />
                            </Box>

                        </Flex>
                    </Grid>
                </Box>
                {/* === FIN PANEL === */}

                {/* Tabla de Resultados */}
                <Box bg="purple.200" borderRadius="xl" boxShadow="sm" overflow="hidden">
                    <InvoiceTable
                        invoices={filteredInvoices}
                        isLoading={isLoading}
                    />
                    <Flex justify="space-between" align="center" p={4} borderTop="1px solid" borderColor="gray.100">
                        <Box fontSize="sm" color="gray.500">
                            Mostrando {filteredInvoices.length} de {mockInvoices.length} facturas
                        </Box>
                    </Flex>
                </Box>

            </Container>
        </Box>
    )
}