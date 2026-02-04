'use client'

import { useState, useMemo } from "react"
import { Box, Container, Flex, Heading, Button } from "@chakra-ui/react"
import { Plus, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { InvoiceStatsCards } from "@/components/invoices/InvoiceStatsCards"
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { mockInvoices, calculateInvoiceStats, filterInvoices } from "@/data/MockingInVoices"
import { InvoiceStatus } from "@/types/invoice.types"

export default function InvoicesPage() {
    const router = useRouter()

    // Estados para filtros
    const [searchValue, setSearchValue] = useState('')
    const [statusValue, setStatusValue] = useState<InvoiceStatus | ''>('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Filtrar facturas basado en los criterios
    const filteredInvoices = useMemo(() => {
        return filterInvoices(mockInvoices, {
            search: searchValue,
            status: statusValue || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        })
    }, [searchValue, statusValue, startDate, endDate])

    // Calcular estadísticas
    const stats = useMemo(() => {
        return calculateInvoiceStats(filteredInvoices)
    }, [filteredInvoices])

    // Función para descargar todas las facturas
    const handleDownloadAll = () => {
        console.log('Descargando todas las facturas...')
        // TODO: Implementar descarga de Excel
    }

    // Función para crear nueva factura
    const handleCreateInvoice = () => {
        router.push('/invoices/create')
    }

    return (
        <Box minH="100vh" bg="gray.50" py={8}>
            <Container maxW="container.xl">
                {/* Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    mb={8}
                    flexDirection={{ base: "column", md: "row" }}
                    gap={4}
                >
                    <Box>
                        <Heading
                            size="xl"
                            color="gray.800"
                            mb={2}
                        >
                            Búsqueda de Facturas
                        </Heading>
                        <Box fontSize="sm" color="gray.600">
                            Gestiona y consulta todas tus facturas
                        </Box>
                    </Box>

                    <Flex gap={3} flexDirection={{ base: "column", sm: "row" }} w={{ base: "100%", md: "auto" }}>
                        {/* Botón descargar todas */}
                        <Button
                            variant="outline"
                            colorScheme="blue"
                            onClick={handleDownloadAll}
                            size="md"
                            w={{ base: "100%", sm: "auto" }}
                        >
                            Descargar todas
                        </Button>

                        {/* Botón crear factura */}
                        <button
                            className="btn-primary"
                            color="purple.500"
                            onClick={handleCreateInvoice}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                justifyContent: 'center',
                                
                            }}
                        >
                            <Plus size={18} />
                            Crear factura
                        </button>
                    </Flex>
                </Flex>

                {/* Tarjetas de estadísticas */}
                <InvoiceStatsCards stats={stats} />

                {/* Filtros */}
                <InvoiceFilters
                    searchValue={searchValue}
                    statusValue={statusValue}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearchValue}
                    onStatusChange={setStatusValue}
                    onDateRangeChange={(start, end) => {
                        setStartDate(start)
                        setEndDate(end)
                    }}
                />

                {/* Tabla de facturas */}
                <InvoiceTable
                    invoices={filteredInvoices}
                    isLoading={isLoading}
                />

                {/* Información adicional */}
                <Flex justify="space-between" align="center" mt={6}>
                    <Box fontSize="sm" color="gray.600">
                        Mostrando {filteredInvoices.length} de {mockInvoices.length} facturas
                    </Box>
                </Flex>
            </Container>
        </Box>
    )
}