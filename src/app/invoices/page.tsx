'use client'

import { useState, useMemo } from "react"
import { Box, Container, Flex, Heading, Button, Grid, Text } from "@chakra-ui/react"
import { Divider } from "@chakra-ui/layout"
import { Plus, RotateCcw, FileText, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvoiceStatsCards } from "@/app/invoices/components/InvoiceStatsCards"
import { InvoiceFilters } from "@/app/invoices/components/InvoiceFilters"
import { InvoiceTable } from "@/app/invoices/components/InvoiceTable"
import { mockInvoices, calculateInvoiceStats, filterInvoices } from "@/data/MockingInVoices"
import { InvoiceStatus } from "@/types/invoice.types"

export default function InvoicesPage() {
    const router = useRouter()

    // Estados

    // REEMPLAZA el estado de searchValue por estos dos:
    const [clientSearch, setClientSearch] = useState('')
    const [invoiceSearch, setInvoiceSearch] = useState('')

    const [statusValue, setStatusValue] = useState<InvoiceStatus | ''>('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading] = useState(false)

    // Lógica de filtrado por estados y búsqueda
    const filteredInvoices = useMemo(() => {
        // 1. Filtro local específico para separar los inputs
        let data = mockInvoices.filter(invoice => {
            // CORRECCIÓN BASADA EN TU INTERFAZ (IInvoice):
            // Usamos 'customer' en lugar de 'client'
            // Usamos 'invoiceNumber' en lugar de 'number'

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

        // 2. Pasamos el resto a tu helper
        // Nota: Asegúrate de que tu helper 'filterInvoices' también use las propiedades correctas internamente.
        // Si el helper usa 'search' genérico, le pasamos '' aquí porque ya filtramos el texto arriba.
        return filterInvoices(data, {
            search: '',
            status: statusValue || undefined,
            startDate: startDate ? new Date(startDate) : undefined, // Convertimos string a Date si tu helper espera Date
            endDate: endDate ? new Date(endDate) : undefined,
        })
    }, [clientSearch, invoiceSearch, statusValue, startDate, endDate])

    const stats = useMemo(() => {
        return calculateInvoiceStats(filteredInvoices)
    }, [filteredInvoices])

    /**==============================================================================================
     * ================ INICIO DE LA PÁGINA DE FACTURAS CON PANEL DE CONTROL UNIFICADO ==============
     * ==============================================================================================
     */
    return (
        <Box minH="200vh" bg="purple.100" py={8}>
            <Container maxW="container.xl">

                {/* === PANEL DE CONTROL UNIFICADO === */}
                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" mb={6}>

                    {/* Título dentro de la caja */}
                    <Heading size="xl" color="purple.600" mb={1}>
                        Búsqueda de Facturas
                    </Heading>

                    {/* Layout dividido: Filtros (Izquierda) | Panel Acciones (Derecha) */}
                    <Grid templateColumns={{ base: "1fr", lg: "7fr 1px 4fr" }} gap={4}>

                        {/* COLUMNA IZQUIERDA: Filtros */}
                        <Box>
                            <InvoiceFilters
                                // NUEVOS PROPS
                                clientSearch={clientSearch}
                                onClientSearchChange={setClientSearch}
                                invoiceSearch={invoiceSearch}
                                onInvoiceSearchChange={setInvoiceSearch}
                                // Props que ya tenías (manténlos)
                                statusValue={statusValue}
                                startDate={startDate}
                                endDate={endDate}
                                onStatusChange={setStatusValue}
                                onDateRangeChange={(start, end) => {
                                    setStartDate(start)
                                    setEndDate(end)
                                }}
                            // BORRA: searchValue={searchValue} y onSearchChange={...}
                            />
                        </Box>

                        {/* SEPARADOR VERTICAL */}
                        <Divider orientation="vertical" h="100%" borderColor="gray.200" display={{ base: "none", lg: "block" }} />

                        {/* COLUMNA DERECHA: Acciones y KPIs */}
                        <Flex direction="column" justify="space-between">

                            {/* Iconos de herramientas (Superior) */}
                            <Flex justify="space-around" color="purple.500" mb={4}>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}>
                                    <FileText size={18} />
                                    <Text fontSize="xs" mt={1}>Reporte</Text>
                                </Flex>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}>
                                    <Settings size={18} />
                                    <Text fontSize="xs" mt={1}>Ajustes</Text>
                                </Flex>
                                <Flex direction="column" align="center" cursor="pointer" _hover={{ color: "purple.700" }}>
                                    <RotateCcw size={18} />
                                    <Text fontSize="xs" mt={1}>Actualizar</Text>
                                </Flex>
                            </Flex>

                            {/* Estadísticas integradas */}
                            <Box mb={4}>

                                <InvoiceStatsCards stats={stats} />
                            </Box>

                            {/* Botones de Acción */}
                            <Flex gap={3} direction="column">
                                <Button
                                    bg="purple.500"
                                    color="white"
                                    _hover={{ bg: "purple.600" }}
                                    width="full"
                                    onClick={() => router.push('/invoices/create')}
                                >
                                    <Plus size={18} style={{ marginRight: '8px' }} />
                                    Crear factura
                                </Button>
                                <Button
                                    variant="outline"
                                    colorScheme="purple"
                                    width="full"
                                    fontSize="sm"
                                >
                                    Envío masivo a la DIAN
                                </Button>
                            </Flex>

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