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
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ClientDrawer } from '@/components/invoices/ClientDrawer'
import { InvoiceItemsTable } from '@/components/invoices/InvoiceItemsTable'
import { IInvoiceItem } from '@/types/invoice.types'

export default function CreateInvoicePage() {
    const router = useRouter()
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)

    // Estado del formulario
    const [formData, setFormData] = useState({
        invoiceType: 'venta',
        currency: 'COP',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line react-hooks/purity
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
        <Box minH="100vh" bg="gray.50" py={8}>
            <Container maxW="container.xl">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6}>
                    <Flex align="center" gap={3}>
                        <Button
                            variant="ghost"
                            colorScheme="gray"
                            onClick={() => router.push('/invoices')}

                        >
                            Volver
                        </Button>
                        <Heading size="lg" color="gray.800">
                            Nueva Factura
                        </Heading>
                    </Flex>

                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <Save size={18} />
                        Guardar Factura
                    </button>
                </Flex>

                {/* Formulario */}
                <Stack gap={6}>
                    {/* Sección 1: Tipo de factura y moneda */}
                    <Card.Root bg="white" p={6}>
                        <Card.Body>
                            <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                {/* Tipo de factura */}
                                <Box flex={1}>
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        TIPO DE FACTURA
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
                                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                                            MONEDA
                                        </Text>
                                        <Box
                                            as="span"
                                            fontSize="xs"
                                            color="blue.500"
                                            cursor="pointer"
                                            textDecoration="underline"
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
                        </Card.Body>
                    </Card.Root>

                    {/* Sección 2: Cliente y fechas */}
                    <Card.Root bg="white" p={6}>
                        <Card.Body>
                            <Flex gap={6} flexDirection={{ base: 'column', lg: 'row' }}>
                                {/* Cliente */}
                                <Box flex={1}>
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        CLIENTE
                                    </Text>
                                    <Flex gap={2}>
                                        {formData.customer ? (
                                            <Box
                                                flex={1}
                                                p={3}
                                                border="1px solid"
                                                borderColor="gray.200"
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
                                <Box w={{ base: '100%', md: '200px' }}>
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        FECHA EMISIÓN
                                    </Text>
                                    <Input
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={(e) => handleChange('issueDate', e.target.value)}
                                    />
                                </Box>

                                {/* Fecha Vencimiento */}
                                <Box w={{ base: '100%', md: '200px' }}>
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        FECHA VENCIMIENTO
                                    </Text>
                                    <Input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => handleChange('dueDate', e.target.value)}
                                    />
                                    <Flex gap={2} mt={2}>
                                        <Button size="xs" variant="outline" colorScheme="gray">30</Button>
                                        <Button size="xs" variant="outline" colorScheme="gray">60</Button>
                                        <Button size="xs" variant="outline" colorScheme="gray">90</Button>
                                    </Flex>
                                </Box>
                            </Flex>
                        </Card.Body>
                    </Card.Root>

                    {/* Sección 3: Método de pago y orden de compra */}
                    <Card.Root bg="white" p={6}>
                        <Card.Body>
                            <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                {/* Método de pago */}
                                <Box flex={1}>
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        MÉTODO DE PAGO
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
                                    <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                        TIPO DE PAGO
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
                            <Box mt={4}>
                                <Text fontSize="sm" fontWeight="600" mb={2} color="gray.700">
                                    ORDEN DE COMPRA
                                </Text>
                                <Input
                                    placeholder="Número de orden de compra (opcional)"
                                    value={formData.purchaseOrder}
                                    onChange={(e) => handleChange('purchaseOrder', e.target.value)}
                                />
                            </Box>
                        </Card.Body>
                    </Card.Root>

                    {/* Sección 4: Items de la factura */}
                    <Card.Root bg="white" p={6}>
                        <Card.Body>
                            <InvoiceItemsTable
                                items={items}
                                onUpdateItem={handleUpdateItem}
                                onAddItem={handleAddItem}
                                onRemoveItem={handleRemoveItem}
                            />

                            {/* Botones adicionales */}
                            <Flex gap={3} mt={4}>
                                <Button size="sm" variant="outline" colorScheme="gray">
                                    Agregar AIU
                                </Button>
                                <Button size="sm" variant="outline" colorScheme="gray">
                                    Agregar Imp Bolsa Plástica
                                </Button>
                            </Flex>
                        </Card.Body>
                    </Card.Root>

                    {/* Sección 5: Resumen y totales */}
                    <Card.Root bg="white" p={6}>
                        <Card.Body>
                            <Flex justify="space-between" gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                {/* Notas */}
                                <Box flex={1}>
                                    <Flex align="center" gap={2} mb={2}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                                            Notas
                                        </Text>
                                        <Button size="xs" variant="ghost" colorScheme="blue">
                                            <Plus size={14} />
                                        </Button>
                                    </Flex>
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
                                        }}
                                    />
                                </Box>

                                {/* Totales */}
                                <Box w={{ base: '100%', md: '350px' }}>
                                    <Stack gap={3}>
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Subtotal</Text>
                                            <Text fontSize="sm" fontWeight="600">
                                                ${totals.subtotal.toLocaleString('es-CO')}
                                            </Text>
                                        </Flex>

                                        <Flex justify="space-between" align="center">
                                            <Flex align="center" gap={2}>
                                                <Text fontSize="sm" color="blue.500" cursor="pointer">
                                                    + Cargo / Descuento
                                                </Text>
                                            </Flex>
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
                        </Card.Body>
                    </Card.Root>
                </Stack>
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