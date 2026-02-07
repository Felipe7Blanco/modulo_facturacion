/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import {
    Box, Container, Flex, Heading, Button, Input, Stack, Text, Card, IconButton, Badge
} from '@chakra-ui/react'
import { ArrowLeft, Save, FileText, Plus, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ClientDrawer } from '@/app/invoices/create/components/ClientDrawer'
import { InvoiceItemsTable } from '@/app/invoices/create/components/InvoiceItemsTable'
import { IInvoiceItem, IUser } from '@/types/invoice.types'
import { Grid } from '@chakra-ui/layout'
import { mockUsers } from '@/data/MockingInVoices'
// IMPORTANTE: Importamos el guardado real
import { saveInvoice } from '@/utils/invoiceStorage'

const EXCHANGE_RATES: Record<string, number> = { 'COP': 1, 'USD': 4050.50, 'EUR': 4320.10 }

const CONSUMIDOR_FINAL: IUser = {
    _id: 'cf-generic',
    name: 'CONSUMIDOR FINAL',
    email: '',
    avatar: { url: '' }
}

export default function CreateInvoicePage() {
    const router = useRouter()
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isConsumerFinal, setIsConsumerFinal] = useState(false)
    
    // Estado para manejar lista combinada de clientes (Mock + Nuevos Locales)
    const [availableClients, setAvailableClients] = useState<IUser[]>(mockUsers)

    // Cargar clientes guardados localmente al iniciar
    useEffect(() => {
        const savedClientsStr = localStorage.getItem('localClients')
        if (savedClientsStr) {
            const savedClients = JSON.parse(savedClientsStr)
            setAvailableClients([...mockUsers, ...savedClients])
        }
    }, [])

    const [formData, setFormData] = useState({
        invoiceType: 'venta',
        currency: 'COP',
        customer: null as IUser | null,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'efectivo',
        paymentType: 'contado',
        purchaseOrder: '',
        notes: '',
    })

    const [items, setItems] = useState<IInvoiceItem[]>([
        {
            _id: `item-${Date.now()}`,
            name: '', description: '', price: 0, quantity: 1, discount: 0, tax: 0, total: 0,
        },
    ])

    const invoiceTypes = [
        { value: 'venta', label: 'Factura de Venta' },
        { value: 'exportacion', label: 'Factura de Exportación' },
        { value: 'contingencia', label: 'Factura de Contingencia' },
        { value: 'mandato', label: 'Factura de Mandato' },
    ]

    const paymentMethods = [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'giro-referenciado', label: 'Giro Referenciado' },
        { value: 'debito-ach', label: 'Débito ACH' },
        { value: 'tarjeta-debito', label: 'Tarjeta Débito' },
        { value: 'transferencia-credito', label: 'Transferencia Crédito' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'consignacion-bancaria', label: 'Consignación Bancaria' },
        { value: 'tarjeta-credito', label: 'Tarjeta Crédito' },
        { value: 'otro', label: 'Otro' },
    ]

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value }
            if (field === 'paymentType' && value === 'contado') {
                newState.dueDate = newState.issueDate
            }
            if (field === 'issueDate' && prev.paymentType === 'contado') {
                newState.dueDate = value
            }
            return newState
        })
    }

    const handleClientTypeChange = (type: 'registered' | 'final') => {
        if (type === 'final') {
            setIsConsumerFinal(true)
            handleChange('customer', CONSUMIDOR_FINAL)
        } else {
            setIsConsumerFinal(false)
            handleChange('customer', null)
        }
    }

    const handleSelectClientFromList = (userId: string) => {
        const user = availableClients.find(u => u._id === userId)
        if (user) handleChange('customer', user)
    }

    const handleSelectClientFromDrawer = (client: IUser) => {
        // 1. Seleccionar el cliente en el formulario
        handleChange('customer', client)
        setIsConsumerFinal(false)
        setIsClientDrawerOpen(false)

        // 2. Guardar el nuevo cliente en la lista local y localStorage
        const newClientList = [...availableClients, client]
        setAvailableClients(newClientList)
        
        // Obtenemos solo los nuevos para guardar en local
        const currentLocal = JSON.parse(localStorage.getItem('localClients') || '[]')
        localStorage.setItem('localClients', JSON.stringify([...currentLocal, client]))
    }

    const applyCreditTerm = (days: number) => {
        if (formData.paymentType !== 'credito') return
        const issueDate = new Date(formData.issueDate)
        const dueDate = new Date(issueDate.setDate(issueDate.getDate() + days))
        handleChange('dueDate', dueDate.toISOString().split('T')[0])
    }

    const handleAddItem = () => {
        setItems(prev => [...prev, {
            _id: `item-${Date.now()}`, name: '', description: '', price: 0, quantity: 1, discount: 0, tax: 0, total: 0,
        }])
    }

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    const handleUpdateItem = (index: number, field: keyof IInvoiceItem, value: any) => {
        setItems(prev => {
            const newItems = [...prev]
            newItems[index] = { ...newItems[index], [field]: value }
            // Recalcular total se hará en la tabla visualmente, pero aquí actualizamos el state
            // Nota: En la tabla ya calculamos visualmente, pero es bueno tener el dato 'total' actualizado en el state
            const item = newItems[index]
            const sub = item.price * item.quantity
            const disc = (sub * (item.discount || 0)) / 100
            const tax = ((sub - disc) * (item.tax || 0)) / 100
            newItems[index].total = sub - disc + tax
            return newItems
        })
    }

    const calculateTotals = () => {
        // Recalcular todo basado en items
        let subtotal = 0
        let totalDiscount = 0
        let totalTax = 0
        
        items.forEach(item => {
            const sub = item.price * item.quantity
            const disc = (sub * (item.discount || 0)) / 100
            const tax = ((sub - disc) * (item.tax || 0)) / 100
            
            subtotal += sub
            totalDiscount += disc
            totalTax += tax
        })
        
        return { subtotal, totalDiscount, totalTax, total: subtotal - totalDiscount + totalTax }
    }

    const totals = calculateTotals()

    const handleSave = async () => {
        if (!formData.customer) {
            alert("Por favor seleccione un cliente")
            return
        }
        setIsSaving(true)
        
        try {
            // Construir objeto Factura final
            // NOTA: Usamos 'any' temporal en conversions para que coincida con IInvoice que espera Dates
            // saveInvoice generará el ID y createdAt
            const invoiceData: any = {
                invoiceNumber: `TW${Math.floor(Math.random() * 9000) + 1000}`, // Generar número aleatorio para demo
                institute: 'inst-001',
                student: formData.customer, // Asumimos student = customer para este caso
                customer: formData.customer,
                issueDate: new Date(formData.issueDate),
                dueDate: new Date(formData.dueDate),
                currency: formData.currency as any,
                paymentMethod: formData.paymentMethod as any,
                paymentType: formData.paymentType as any,
                purchaseOrder: formData.purchaseOrder,
                invoiceItems: items,
                subtotal: totals.subtotal,
                totalDiscount: totals.totalDiscount,
                totalTax: totals.totalTax,
                total: totals.total,
                notes: formData.notes,
                status: 'pending', // Por defecto pendiente
                createdAt: new Date(),
                updatedAt: new Date()
            }

            // GUARDAR EN LOCALSTORAGE USANDO TU UTILITY
            saveInvoice(invoiceData)

            setTimeout(() => {
                setIsSaving(false)
                router.push('/invoices') // Volver a la lista
            }, 800)
        } catch (error) {
            console.error(error)
            setIsSaving(false)
            alert("Error al guardar")
        }
    }

    const SafeDivider = () => <Box h="1px" bg="gray.100" w="full" my={6} />

    return (
        <Box minH="100vh" bg="purple.50" py={8}>
            <Container maxW="container.xl">
                {/* HEADER */}
                <Flex justify="space-between" align="center" mb={8}>
                    <Flex align="center" gap={4}>
                        <IconButton
                            aria-label="Volver" variant="ghost" colorPalette="gray" bg="white" shadow="sm" size="md" rounded="full"
                            onClick={() => router.push('/invoices')}
                            _hover={{ bg: 'purple.100', color: 'purple.600', transform: 'translateX(-2px)' }}
                        >
                            <ArrowLeft size={20} />
                        </IconButton>
                        <Box>
                            <Heading size="xl" color="purple.500" fontWeight="700" lineHeight="1.1">Nueva Factura</Heading>
                            <Flex align="center" gap={2} color="gray.500" fontSize="sm">
                                <FileText size={14}/>
                                <Text>Complete la información para generar el documento</Text>
                            </Flex>
                        </Box>
                    </Flex>
                    <Flex gap={3}>
                        <Button variant="subtle" colorPalette="gray" fontWeight="600" onClick={() => router.push('/invoices')}>Cancelar</Button>
                        <Button colorPalette="purple" size="md" fontWeight="bold" shadow="md" loading={isSaving} loadingText="Guardando..." onClick={handleSave} _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Guardar Factura
                        </Button>
                    </Flex>
                </Flex>

                {/* FORMULARIO */}
                <Card.Root bg="white" shadow="md" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                    <Card.Body p={0}>
                        <Stack gap={0} divideY="1px" divideColor="gray.100">
                            
                            {/* 1. GENERAL */}
                            <Box p={8}>
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" mb={4} textTransform="uppercase" letterSpacing="wider">Información General</Text>
                                <Flex gap={6} flexDirection={{ base: 'column', md: 'row' }}>
                                    <Box flex={1}>
                                        <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Tipo de documento</Text>
                                        <select value={formData.invoiceType} onChange={(e) => handleChange('invoiceType', e.target.value)} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'white', outline: 'none' }}>
                                            {invoiceTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                                        </select>
                                    </Box>
                                    <Box w={{ base: '100%', md: '250px' }}>
                                        <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Moneda</Text>
                                        <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'white', outline: 'none' }}>
                                            <option value="COP">Pesos Colombianos (COP)</option>
                                            <option value="USD">Dólar Americano (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                        </select>
                                    </Box>
                                </Flex>
                            </Box>

                            {/* 2. CLIENTE */}
                            <Box p={8} bg="gray.50" position="relative">
                                {formData.currency !== 'COP' && (
                                    <Box mb={6} p={3} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="lg" animation="fade-in 0.3s">
                                        <Flex align="center" gap={3}>
                                            <Badge colorPalette="blue" variant="solid" px={2}>TRM HOY</Badge>
                                            <Text fontSize="sm" color="blue.800" fontWeight="600">1 {formData.currency} = ${EXCHANGE_RATES[formData.currency].toLocaleString('es-CO')} COP</Text>
                                        </Flex>
                                    </Box>
                                )}

                                <Flex gap={8} flexDirection={{ base: 'column', lg: 'row' }}>
                                    <Box flex={1}>
                                        <Flex justify="space-between" mb={3} align="center">
                                            <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" letterSpacing="wider">Datos del Cliente</Text>
                                            <Flex bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={1} gap={1}>
                                                <Button size="xs" variant={!isConsumerFinal ? 'solid' : 'ghost'} colorPalette={!isConsumerFinal ? 'purple' : 'gray'} onClick={() => handleClientTypeChange('registered')}><User size={14} style={{marginRight: '4px'}}/> Cliente</Button>
                                                <Button size="xs" variant={isConsumerFinal ? 'solid' : 'ghost'} colorPalette={isConsumerFinal ? 'purple' : 'gray'} onClick={() => handleClientTypeChange('final')}>Consumidor Final</Button>
                                            </Flex>
                                        </Flex>
                                        
                                        <Flex gap={2}>
                                            <select disabled={isConsumerFinal} value={formData.customer?._id || ""} onChange={(e) => handleSelectClientFromList(e.target.value)} style={{ flex: 1, padding: '10px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: isConsumerFinal ? '#EDF2F7' : 'white', color: isConsumerFinal ? '#A0AEC0' : 'inherit', cursor: isConsumerFinal ? 'not-allowed' : 'pointer', outline: 'none' }}>
                                                <option value="" disabled>{isConsumerFinal ? "Consumidor Final (222222222222)" : "Seleccione un cliente..."}</option>
                                                {!isConsumerFinal && availableClients.map(user => (<option key={user._id} value={user._id}>{user.name}</option>))}
                                            </select>
                                            <IconButton aria-label="Crear cliente" colorPalette="purple" variant="outline" disabled={isConsumerFinal} onClick={() => setIsClientDrawerOpen(true)}><Plus size={20} /></IconButton>
                                        </Flex>
                                        {formData.customer && (<Text fontSize="xs" color="gray.500" mt={2} ml={1}>{isConsumerFinal ? 'NIT Genérico: 222222222222' : `Email: ${formData.customer.email}`}</Text>)}
                                    </Box>

                                    <Flex gap={4} w={{ base: '100%', lg: 'auto' }} direction="column">
                                        <Flex gap={4}>
                                            <Box w="180px">
                                                <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Fecha Emisión</Text>
                                                <Input type="date" bg="white" value={formData.issueDate} onChange={(e) => handleChange('issueDate', e.target.value)} />
                                            </Box>
                                            <Box w="180px">
                                                <Flex justify="space-between" mb={1.5}>
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700">Vencimiento</Text>
                                                    {formData.paymentType === 'contado' && (<Badge colorPalette="green" size="sm" variant="surface">Contado</Badge>)}
                                                </Flex>
                                                <Input type="date" bg={formData.paymentType === 'contado' ? 'gray.100' : 'white'} value={formData.dueDate} readOnly={formData.paymentType === 'contado'} onChange={(e) => handleChange('dueDate', e.target.value)} />
                                            </Box>
                                        </Flex>
                                        {formData.paymentType === 'credito' && (
                                            <Flex gap={2} justify="flex-end" animation="fade-in 0.3s">
                                                <Button size="xs" variant="outline" onClick={() => applyCreditTerm(30)}>30 días</Button>
                                                <Button size="xs" variant="outline" onClick={() => applyCreditTerm(60)}>60 días</Button>
                                                <Button size="xs" variant="outline" onClick={() => applyCreditTerm(90)}>90 días</Button>
                                            </Flex>
                                        )}
                                    </Flex>
                                </Flex>
                            </Box>

                            {/* 3. PAGO */}
                            <Box p={8}>
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" mb={4} textTransform="uppercase" letterSpacing="wider">Detalles de Pago</Text>
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={6}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Tipo de pago</Text>
                                        <select value={formData.paymentType} onChange={(e) => handleChange('paymentType', e.target.value)} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'white', outline: 'none' }}>
                                            <option value="contado">Contado</option>
                                            <option value="credito">Crédito</option>
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Método de pago</Text>
                                        <select value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'white', outline: 'none' }}>
                                            {paymentMethods.map((method) => (<option key={method.value} value={method.value}>{method.label}</option>))}
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">Orden de Compra</Text>
                                        <Input placeholder="Opcional" value={formData.purchaseOrder} onChange={(e) => handleChange('purchaseOrder', e.target.value)} />
                                    </Box>
                                </Grid>
                            </Box>

                            {/* 4. ITEMS */}
                            <Box p={8} bg="white">
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" mb={4} textTransform="uppercase" letterSpacing="wider">Items de la factura</Text>
                                <InvoiceItemsTable items={items} onUpdateItem={handleUpdateItem} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} />
                            </Box>

                            {/* 5. TOTALES */}
                            <Box p={8} bg="gray.50">
                                <Flex justify="space-between" gap={8} flexDirection={{ base: 'column', md: 'row' }}>
                                    <Box flex={1}>
                                        <Text fontSize="sm" fontWeight="500" mb={2} color="gray.700">Notas / Comentarios</Text>
                                        <textarea placeholder="Información adicional para el cliente..." value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} style={{ width: '100%', minHeight: '120px', padding: '12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: 'white', resize: 'vertical', fontFamily: 'inherit' }} />
                                    </Box>
                                    <Box w={{ base: '100%', md: '380px' }} bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                                        <Stack gap={4}>
                                            <Flex justify="space-between" align="center"><Text color="gray.500">Subtotal</Text><Text fontWeight="600" fontSize="lg">${totals.subtotal.toLocaleString('es-CO')}</Text></Flex>
                                            <Flex justify="space-between" align="center"><Text color="gray.500">Descuentos</Text><Text fontWeight="500" color="red.500">-${totals.totalDiscount.toLocaleString('es-CO')}</Text></Flex>
                                            <Flex justify="space-between" align="center"><Text color="gray.500">Impuestos</Text><Text fontWeight="500">+${totals.totalTax.toLocaleString('es-CO')}</Text></Flex>
                                            <SafeDivider />
                                            <Flex justify="space-between" align="center"><Text fontSize="lg" fontWeight="800" color="purple.900">Total a Pagar ({formData.currency})</Text><Text fontSize="2xl" fontWeight="800" color="purple.600">${totals.total.toLocaleString('es-CO')}</Text></Flex>
                                        </Stack>
                                    </Box>
                                </Flex>
                            </Box>
                        </Stack>
                    </Card.Body>
                </Card.Root>
            </Container>

            <ClientDrawer isOpen={isClientDrawerOpen} onClose={() => setIsClientDrawerOpen(false)} onSelectClient={handleSelectClientFromDrawer} />
        </Box>
    )
}