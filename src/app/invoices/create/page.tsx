/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import {
    Box,
    Container,
    Flex,
    Heading,
    Button,
    Input,
    Stack,
    Text,
    Card,
} from '@chakra-ui/react'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ClientDrawer } from '@/app/invoices/create/components/ClientDrawer'
import { InvoiceItemsTable } from '@/app/invoices/create/components/InvoiceItemsTable'
import { IInvoiceItem } from '@/types/invoice.types'

export default function CreateInvoicePage() {
    const router = useRouter()
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)

    // Estado del formulario
    const [formData, setFormData] = useState({
        invoiceType: 'venta',
        currency: 'COP',
        customer: null as any,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'efectivo',
        paymentType: 'contado',
        purchaseOrder: '',
        notes: '',
    })

    // Items de la factura
    const [items, setItems] = useState<IInvoiceItem[]>([
        {
            _id: `item-${Date.now()}`,
            name: '',
            description: '',
            price: 0,
            quantity: 1,
            discount: 0,
            tax: 0,
            total: 0,
        },
    ])

    // Opciones de tipo de factura
    const invoiceTypes = [
        { value: 'venta', label: 'Factura de Venta' },
        { value: 'exportacion', label: 'Factura de Exportación' },
        { value: 'contingencia', label: 'Factura de Contingencia' },
        { value: 'mandato', label: 'Factura de Mandato' },
    ]

    // Opciones de método de pago
    const paymentMethods = [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'giro-referenciado', label: 'Giro Referenciado' },
        { value: 'debito-ach', label: 'Débito ACH' },
        { value: 'tarjeta-debito', label: 'Tarjeta Débito' },
        { value: 'transferencia-credito', label: 'Transferencia Crédito' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'transferencia-debito-bancaria', label: 'Transferencia Débito Bancaria' },
        { value: 'consignacion-bancaria', label: 'Consignación Bancaria' },
        { value: 'tarjeta-credito', label: 'Tarjeta Crédito' },
        { value: 'otro', label: 'Otro' },
        { value: 'transferencia-debito-interbancario', label: 'Transferencia Débito Interbancario' },
        { value: 'transferencia-credito-bancario', label: 'Transferencia Crédito Bancario' },
        { value: 'credito-ach', label: 'Crédito ACH' },
    ]

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSelectClient = (client: any) => {
        handleChange('customer', client)
    }

    const handleAddItem = () => {
        setItems(prev => [
            ...prev,
            {
                _id: `item-${Date.now()}`,
                name: '',
                description: '',
                price: 0,
                quantity: 1,
                discount: 0,
                tax: 0,
                total: 0,
            },
        ])
    }

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpdateItem = (index: number, field: keyof IInvoiceItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev]
            newItems[index] = { ...newItems[index], [field]: value }

            // Calcular total del item
            const item = newItems[index]
            const subtotal = item.price * item.quantity
            const discount = item.discount || 0
            const tax = item.tax || 0
            newItems[index].total = subtotal - discount + tax

            return newItems
        })
    }

    // Calcular totales
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0)
        const totalTax = items.reduce((sum, item) => sum + (item.tax || 0), 0)
        const total = subtotal - totalDiscount + totalTax

        return { subtotal, totalDiscount, totalTax, total }
    }

    const totals = calculateTotals()

    const handleSave = () => {
        console.log('Guardando factura...', { formData, items, totals })
        // TODO: Implementar guardado
    }

    return (
        <Box minH="100vh" bg="purple.100" py={4}>
            <Container maxW="container.xl">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6}>
                    <Flex align="center" gap={3}>
                        <Button
                            variant="outline"
                            colorScheme="purple"
                            onClick={() => router.push('/invoices')}
                            size="md"
                            fontWeight="600"
                            borderWidth="2px"
                            _hover={{
                                bg: 'purple.50',
                                transform: 'translateX(-4px)',
                                borderColor: 'purple.600'
                            }}
                            transition="all 0.2s"
                        >
                            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                            Volver
                        </Button>
                    </Flex>

                    <Button
                        colorScheme="green"
                        size="lg"
                        onClick={handleSave}
                    >
                        <Save size={18} style={{ marginRight: '8px' }} />
                        Guardar Factura
                    </Button>
                </Flex>

                {/* TARJETA UNIFICADA - Todo en una sola card */}
                <Card.Root bg="white" shadow="sm" borderRadius="lg" overflow="hidden">
                    <Card.Body p={0}>
                        <Stack gap={0} divideY="1px" divideColor="gray.200">
                            <Heading size="xl" color="purple.600" mb={1}>
                                Nueva Factura
                            </Heading>
                            {/* Sección 1: Tipo de factura y moneda */}
                            <Box p={6}>
                                <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                    {/* Tipo de factura */}
                                    <Box flex={1}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Tipo de factura
                                        </Text>
                                        <select
                                            value={formData.invoiceType}
                                            onChange={(e) => handleChange('invoiceType', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '14px',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '6px',
                                                backgroundColor: 'white',
                                            }}
                                        >
                                            {invoiceTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Box>

                                    {/* Moneda */}
                                    <Box w={{ base: '100%', md: '200px' }}>
                                        <Flex align="center" gap={2} mb={2}>
                                            <Text fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase">
                                                Moneda
                                            </Text>
                                            <Box
                                                as="span"
                                                fontSize="xs"
                                                color="blue.500"
                                                cursor="pointer"
                                            >
                                                ℹ️
                                            </Box>
                                        </Flex>
                                        <Flex align="center" gap={2}>
                                            <Text fontSize="lg" fontWeight="700">
                                                {formData.currency}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                color="blue.500"
                                                cursor="pointer"
                                                textDecoration="underline"
                                                onClick={() => {
                                                    const currencies = ['COP', 'USD', 'EUR']
                                                    const currentIndex = currencies.indexOf(formData.currency)
                                                    const nextCurrency = currencies[(currentIndex + 1) % currencies.length]
                                                    handleChange('currency', nextCurrency)
                                                }}
                                            >
                                                Editar
                                            </Text>
                                        </Flex>
                                    </Box>
                                </Flex>
                            </Box>

                            {/* Sección 2: Cliente y fechas */}
                            <Box p={6}>
                                <Flex gap={6} flexDirection={{ base: 'column', lg: 'row' }}>
                                    {/* Cliente */}
                                    <Box flex={1}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Cliente
                                        </Text>
                                        <Flex gap={2}>
                                            {formData.customer ? (
                                                <Box
                                                    flex={1}
                                                    p={3}
                                                    border="1px solid"
                                                    borderColor="blue.200"
                                                    borderRadius="md"
                                                    bg="blue.50"
                                                >
                                                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                                                        {formData.customer.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.600">
                                                        {formData.customer.email}
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Input
                                                    placeholder="Seleccione Cliente"
                                                    flex={1}
                                                    cursor="pointer"
                                                    onClick={() => setIsClientDrawerOpen(true)}
                                                    readOnly
                                                />
                                            )}
                                            <Button
                                                colorScheme="blue"
                                                onClick={() => setIsClientDrawerOpen(true)}
                                            >
                                                {formData.customer ? 'Cambiar' : 'Nuevo'}
                                            </Button>
                                        </Flex>
                                    </Box>

                                    {/* Fecha Emisión */}
                                    <Box w={{ base: '100%', md: '220px' }}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Fecha emisión
                                        </Text>
                                        <Input
                                            type="date"
                                            value={formData.issueDate}
                                            onChange={(e) => handleChange('issueDate', e.target.value)}
                                        />
                                    </Box>

                                    {/* Fecha Vencimiento */}
                                    <Box w={{ base: '100%', md: '220px' }}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Fecha vencimiento
                                        </Text>
                                        <Input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => handleChange('dueDate', e.target.value)}
                                        />
                                        <Flex gap={2} mt={2}>
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="gray"
                                                fontSize="xs"
                                            >
                                                30
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="gray"
                                                fontSize="xs"
                                            >
                                                60
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                colorScheme="gray"
                                                fontSize="xs"
                                            >
                                                90
                                            </Button>
                                        </Flex>
                                    </Box>
                                </Flex>
                            </Box>

                            {/* Sección 3: Método de pago y orden de compra */}
                            <Box p={6}>
                                <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }} mb={4}>
                                    {/* Método de pago */}
                                    <Box flex={1}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Método de pago
                                        </Text>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '14px',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '6px',
                                                backgroundColor: 'white',
                                            }}
                                        >
                                            {paymentMethods.map((method) => (
                                                <option key={method.value} value={method.value}>
                                                    {method.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Box>

                                    {/* Tipo de pago */}
                                    <Box flex={1}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Tipo de pago
                                        </Text>
                                        <select
                                            value={formData.paymentType}
                                            onChange={(e) => handleChange('paymentType', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '14px',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '6px',
                                                backgroundColor: 'white',
                                            }}
                                        >
                                            <option value="contado">Contado</option>
                                            <option value="credito">Crédito</option>
                                        </select>
                                    </Box>
                                </Flex>

                                {/* Orden de compra */}
                                <Box>
                                    <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                        Orden de compra
                                    </Text>
                                    <Input
                                        placeholder="Número de orden de compra (opcional)"
                                        value={formData.purchaseOrder}
                                        onChange={(e) => handleChange('purchaseOrder', e.target.value)}
                                    />
                                </Box>
                            </Box>

                            {/* Sección 4: Items de la factura */}
                            <Box p={6}>
                                <InvoiceItemsTable
                                    items={items}
                                    onUpdateItem={handleUpdateItem}
                                    onAddItem={handleAddItem}
                                    onRemoveItem={handleRemoveItem}
                                />
                            </Box>

                            {/* Sección 5: Resumen y totales */}
                            <Box p={6}>
                                <Flex justify="space-between" gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                    {/* Notas */}
                                    <Box flex={1}>
                                        <Text fontSize="xs" fontWeight="600" mb={2} color="black.100" textTransform="uppercase">
                                            Notas
                                        </Text>
                                        <textarea
                                            placeholder="Agregar notas o comentarios adicionales..."
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                            style={{
                                                width: '100%',
                                                minHeight: '100px',
                                                padding: '10px',
                                                fontSize: '14px',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '6px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                            }}
                                        />
                                    </Box>

                                    {/* Totales */}
                                    <Box w={{ base: '100%', md: '350px' }}>
                                        <Stack gap={3}>
                                            <Flex justify="space-between">
                                                <Text fontSize="sm" color="black.100">Subtotal</Text>
                                                <Text fontSize="sm" fontWeight="600">
                                                    ${totals.subtotal.toLocaleString('es-CO')}
                                                </Text>
                                            </Flex>

                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="sm" color="blue.500" cursor="pointer">
                                                    + Cargo / Descuento
                                                </Text>
                                            </Flex>

                                            <Box h="1px" bg="gray.200" />

                                            <Flex justify="space-between">
                                                <Text fontSize="lg" fontWeight="700" color="gray.800">
                                                    Total
                                                </Text>
                                                <Text fontSize="lg" fontWeight="700" color="blue.600">
                                                    ${totals.total.toLocaleString('es-CO')}
                                                </Text>
                                            </Flex>
                                        </Stack>
                                    </Box>
                                </Flex>
                            </Box>

                        </Stack>
                    </Card.Body>
                </Card.Root>
            </Container>

            {/* Client Drawer */}
            <ClientDrawer
                isOpen={isClientDrawerOpen}
                onClose={() => setIsClientDrawerOpen(false)}
                onSelectClient={handleSelectClient}
            />
        </Box>
    )
}