/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import {
    Box, Container, Flex, Heading, Button, Input, Stack, Text, Card, IconButton, Badge, Grid
} from '@chakra-ui/react'
import { ArrowLeft, Save, FileText, Plus, User, Minus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ClientDrawer } from '@/app/invoices/create/components/ClientDrawer'
import { InvoiceItemsTable } from '@/app/invoices/create/components/InvoiceItemsTable'
import { IInvoiceItem, IUser, InvoiceStatus } from '@/types/invoice.types'
import { mockUsers } from '@/data/MockingInVoices'
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
    
    // Estado para ocultar/mostrar notas
    const [showNotes, setShowNotes] = useState(false)
    
    const [availableClients, setAvailableClients] = useState<IUser[]>(mockUsers)

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
        status: 'pending' as InvoiceStatus,
        transport: 0,
        bonus: 0,
        hasAIU: false,
        bagCount: 0,
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

    const statusOptions = [
        { value: 'pending', label: 'Pendiente' },
        { value: 'draft', label: 'Borrador' },
        { value: 'paid', label: 'Pagada' },
        { value: 'sent', label: 'Enviada' },
    ]

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value }
            
            // Lógica de fechas (Contado)
            if (field === 'paymentType' && value === 'contado') {
                const today = new Date().toISOString().split('T')[0]
                newState.issueDate = today
                newState.dueDate = today
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
        handleChange('customer', client)
        setIsConsumerFinal(false)
        setIsClientDrawerOpen(false)

        const newClientList = [...availableClients, client]
        setAvailableClients(newClientList)
        
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
            const item = newItems[index]
            const sub = item.price * item.quantity
            const disc = (sub * (item.discount || 0)) / 100
            const tax = ((sub - disc) * (item.tax || 0)) / 100
            newItems[index].total = sub - disc + tax
            return newItems
        })
    }

    const calculateTotals = () => {
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
        
        const transport = Number(formData.transport) || 0
        const bonus = Number(formData.bonus) || 0
        
        // CÁLCULOS AIU y BOLSA
        const aiuValue = formData.hasAIU ? subtotal * 0.10 : 0
        const bagTaxValue = (Number(formData.bagCount) || 0) * 73

        const finalTotal = subtotal - totalDiscount + totalTax + transport - bonus + aiuValue + bagTaxValue

        return { subtotal, totalDiscount, totalTax, aiuValue, bagTaxValue, total: finalTotal }
    }

    const totals = calculateTotals()

    const handleSave = async () => {
        if (!formData.customer) {
            alert("Por favor seleccione un cliente")
            return
        }
        setIsSaving(true)
        
        try {
            const invoiceData: any = {
                invoiceNumber: `TW${Math.floor(Math.random() * 9000) + 1000}`,
                institute: 'inst-001',
                student: formData.customer,
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
                additionalCharges: Number(formData.transport) || 0,
                additionalDiscount: Number(formData.bonus) || 0,
                hasAIU: formData.hasAIU,
                bagCount: formData.bagCount,
                status: formData.status,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            saveInvoice(invoiceData)

            setTimeout(() => {
                setIsSaving(false)
                router.push('/invoices')
            }, 800)
        } catch (error) {
            console.error(error)
            setIsSaving(false)
            alert("Error al guardar")
        }
    }

    const SafeDivider = () => <Box h="1px" bg="gray.100" w="full" my={4} />

    return (
        <Box minH="100vh" bg="purple.50" py={8}>
            <Container maxW="container.xl">
                {/* HEADER */}
                <Flex justify="space-between" align="center" mb={6}>
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
                </Flex>

                {/* FORMULARIO */}
                <Card.Root bg="white" shadow="md" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100" mb={6}>
                    <Card.Body p={0}>
                        <Stack gap={0} divideY="1px" divideColor="gray.100">
                            
                            {/* 1. INFORMACIÓN GENERAL */}
                            <Box p={6} bg="gray.50" position="relative">
                                
                                {formData.currency !== 'COP' && (
                                    <Box mb={4} p={2} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" animation="fade-in 0.3s">
                                        <Flex align="center" gap={3}>
                                            <Badge colorPalette="blue" variant="solid" px={2}>TRM HOY</Badge>
                                            <Text fontSize="sm" color="blue.800" fontWeight="600">1 {formData.currency} = ${EXCHANGE_RATES[formData.currency].toLocaleString('es-CO')} COP</Text>
                                        </Flex>
                                    </Box>
                                )}

                                <Flex gap={6} flexDirection={{ base: 'column', lg: 'row' }}>
                                    
                                    {/* Cliente */}
                                    <Box flex={1.5}>
                                        <Flex justify="space-between" mb={2} align="center">
                                            <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" letterSpacing="wider">Cliente</Text>
                                            <Flex bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" p={1} gap={1}>
                                                <Button size="xs" variant={!isConsumerFinal ? 'solid' : 'ghost'} colorPalette={!isConsumerFinal ? 'purple' : 'gray'} onClick={() => handleClientTypeChange('registered')}><User size={14} style={{marginRight: '4px'}}/> Cliente</Button>
                                                <Button size="xs" variant={isConsumerFinal ? 'solid' : 'ghost'} colorPalette={isConsumerFinal ? 'purple' : 'gray'} onClick={() => handleClientTypeChange('final')}>Consumidor Final</Button>
                                            </Flex>
                                        </Flex>
                                        
                                        <Flex gap={2}>
                                            <select disabled={isConsumerFinal} value={formData.customer?._id || ""} onChange={(e) => handleSelectClientFromList(e.target.value)} style={{ flex: 1, padding: '8px 12px', fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: isConsumerFinal ? '#EDF2F7' : 'white', color: isConsumerFinal ? '#A0AEC0' : 'inherit', cursor: isConsumerFinal ? 'not-allowed' : 'pointer', outline: 'none' }}>
                                                <option value="" disabled>{isConsumerFinal ? "Consumidor Final (222222222222)" : "Seleccione un cliente..."}</option>
                                                {!isConsumerFinal && availableClients.map(user => (<option key={user._id} value={user._id}>{user.name}</option>))}
                                            </select>
                                            <IconButton aria-label="Crear cliente" colorPalette="purple" variant="outline" size="sm" disabled={isConsumerFinal} onClick={() => setIsClientDrawerOpen(true)}><Plus size={18} /></IconButton>
                                        </Flex>
                                        {formData.customer && (<Text fontSize="xs" color="gray.500" mt={1} ml={1}>{isConsumerFinal ? 'NIT Genérico: 222222222222' : `Email: ${formData.customer.email}`}</Text>)}
                                    </Box>

                                    {/* Documento y Moneda */}
                                    <Box flex={1}>
                                        <Grid templateColumns="1fr 1fr" gap={4}>
                                            <Box>
                                                <Text fontSize="xs" fontWeight="600" mb={1} color="gray.600">Tipo de Factura</Text>
                                                <select value={formData.invoiceType} onChange={(e) => handleChange('invoiceType', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white', outline: 'none' }}>
                                                    {invoiceTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                                                </select>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" fontWeight="600" mb={1} color="gray.600">Moneda</Text>
                                                <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white', outline: 'none' }}>
                                                    <option value="COP">COP</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </select>
                                            </Box>
                                        </Grid>
                                    </Box>

                                    {/* Fechas */}
                                    <Box flex={1}>
                                        <Flex gap={4}>
                                            <Box flex={1}>
                                                <Text fontSize="xs" fontWeight="600" mb={1} color="gray.600">F. Emisión</Text>
                                                <Input 
                                                    type="date" size="sm" 
                                                    bg={formData.paymentType === 'contado' ? 'gray.100' : 'white'}
                                                    value={formData.issueDate} 
                                                    readOnly={formData.paymentType === 'contado'} 
                                                    onChange={(e) => handleChange('issueDate', e.target.value)} 
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Flex justify="space-between" mb={1} align="center">
                                                    <Text fontSize="xs" fontWeight="600" color="gray.600">Vencimiento</Text>
                                                    {formData.paymentType === 'contado' && (<Badge colorPalette="green" size="xs">Contado</Badge>)}
                                                </Flex>
                                                <Input 
                                                    type="date" size="sm" 
                                                    bg={formData.paymentType === 'contado' ? 'gray.100' : 'white'} 
                                                    value={formData.dueDate} 
                                                    readOnly={formData.paymentType === 'contado'} 
                                                    onChange={(e) => handleChange('dueDate', e.target.value)} 
                                                />
                                            </Box>
                                        </Flex>
                                        {formData.paymentType === 'credito' && (
                                            <Flex gap={1} justify="flex-end" mt={1}>
                                                <Button size="xs" variant="outline" h="20px" fontSize="10px" onClick={() => applyCreditTerm(30)}>30d</Button>
                                                <Button size="xs" variant="outline" h="20px" fontSize="10px" onClick={() => applyCreditTerm(60)}>60d</Button>
                                                <Button size="xs" variant="outline" h="20px" fontSize="10px" onClick={() => applyCreditTerm(90)}>90d</Button>
                                            </Flex>
                                        )}
                                    </Box>

                                </Flex>
                            </Box>

                            {/* 2. PAGO (3 Columnas estrictas) */}
                            <Box p={6}>
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" mb={3} textTransform="uppercase" letterSpacing="wider">Detalles de Pago</Text>
                                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1} color="gray.700">Tipo de pago</Text>
                                        <select value={formData.paymentType} onChange={(e) => handleChange('paymentType', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white', outline: 'none' }}>
                                            <option value="contado">Contado</option>
                                            <option value="credito">Crédito</option>
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1} color="gray.700">Método de pago</Text>
                                        <select value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white', outline: 'none' }}>
                                            {paymentMethods.map((method) => (<option key={method.value} value={method.value}>{method.label}</option>))}
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" fontWeight="500" mb={1} color="gray.700">Orden de Compra</Text>
                                        <Input size="sm" placeholder="Opcional" value={formData.purchaseOrder} onChange={(e) => handleChange('purchaseOrder', e.target.value)} />
                                    </Box>
                                </Grid>
                            </Box>

                            {/* 3. ITEMS */}
                            <Box p={6} bg="white">
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" mb={3} textTransform="uppercase" letterSpacing="wider">Items de la factura</Text>
                                <InvoiceItemsTable items={items} onUpdateItem={handleUpdateItem} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} />
                            </Box>

                            {/* 4. FOOTER (50/50 Grid) */}
                            <Box p={6} bg="gray.50">
                                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
                                    
                                    {/* IZQUIERDA: Notas (Ocupa 50%) */}
                                    <Box>
                                        <Flex align="center" gap={2} mb={2}>
                                            <IconButton 
                                                size="xs" variant="outline" colorPalette="purple" 
                                                onClick={() => setShowNotes(!showNotes)} aria-label="Toggle Notas" rounded="full"
                                            >
                                                {showNotes ? <Minus size={14} /> : <Plus size={14} />}
                                            </IconButton>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700">Notas / Comentarios (Opcional)</Text>
                                        </Flex>
                                        
                                        {showNotes && (
                                            <Box w="100%" animation="fade-in 0.2s">
                                                <textarea 
                                                    placeholder="Información adicional para el cliente..." 
                                                    value={formData.notes} 
                                                    onChange={(e) => handleChange('notes', e.target.value)} 
                                                    style={{ width: '100%', height: '80px', padding: '10px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: 'white', resize: 'none', fontFamily: 'inherit' }} 
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* DERECHA: Totales Completos (Ocupa 50%) */}
                                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                                        <Stack gap={3}>
                                            
                                            {/* Selector de Estado */}
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <Text fontSize="sm" fontWeight="600" color="gray.600">Estado</Text>
                                                <select 
                                                    value={formData.status} 
                                                    onChange={(e) => handleChange('status', e.target.value)} 
                                                    style={{ width: '140px', padding: '4px 8px', fontSize: '12px', border: '1px solid #E2E8F0', borderRadius: '4px', backgroundColor: 'white', outline: 'none' }}
                                                >
                                                    {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                                </select>
                                            </Flex>

                                            <SafeDivider />

                                            <Flex justify="space-between" align="center">
                                                <Text color="gray.500" fontSize="sm">Subtotal</Text>
                                                <Text fontWeight="600" fontSize="md">${totals.subtotal.toLocaleString('es-CO')}</Text>
                                            </Flex>
                                            <Flex justify="space-between" align="center">
                                                <Text color="gray.500" fontSize="sm">Descuentos</Text>
                                                <Text fontWeight="500" color="red.500" fontSize="sm">-${totals.totalDiscount.toLocaleString('es-CO')}</Text>
                                            </Flex>
                                            <Flex justify="space-between" align="center">
                                                <Text color="gray.500" fontSize="sm">Impuestos</Text>
                                                <Text fontWeight="500" fontSize="sm">+${totals.totalTax.toLocaleString('es-CO')}</Text>
                                            </Flex>
                                            
                                            <SafeDivider />

                                            {/* Botones AIU y Bolsa Integrados */}
                                            <Flex gap={2} mb={2}>
                                                <Button 
                                                    flex={1}
                                                    size="xs" 
                                                    variant={formData.hasAIU ? "solid" : "outline"} 
                                                    colorPalette={formData.hasAIU ? "blue" : "gray"}
                                                    fontSize="xs"
                                                    onClick={() => setFormData(prev => ({ ...prev, hasAIU: !prev.hasAIU }))}
                                                >
                                                    {formData.hasAIU ? "Quitar AIU" : "AIU (10%)"}
                                                </Button>
                                                <Button 
                                                    flex={1}
                                                    size="xs" 
                                                    variant={formData.bagCount > 0 ? "solid" : "outline"} 
                                                    colorPalette={formData.bagCount > 0 ? "blue" : "gray"}
                                                    fontSize="xs"
                                                    onClick={() => setFormData(prev => ({ ...prev, bagCount: prev.bagCount + 1 }))}
                                                >
                                                    Bolsa ($73)
                                                </Button>
                                            </Flex>

                                            {/* Filas de valores AIU y Bolsa (Solo si activos) */}
                                            {formData.hasAIU && (
                                                <Flex justify="space-between" align="center" animation="fade-in 0.3s">
                                                    <Text color="blue.600" fontWeight="500" fontSize="sm">AIU (10%)</Text>
                                                    <Text fontWeight="600" fontSize="sm">+${totals.aiuValue.toLocaleString('es-CO')}</Text>
                                                </Flex>
                                            )}

                                            {formData.bagCount > 0 && (
                                                <Flex justify="space-between" align="center" animation="fade-in 0.3s">
                                                    <Flex align="center" gap={2}>
                                                        <Text color="blue.600" fontWeight="500" fontSize="sm">Imp. Bolsa (x{formData.bagCount})</Text>
                                                        <IconButton 
                                                            aria-label="Borrar bolsas" 
                                                            size="xs" 
                                                            variant="ghost" 
                                                            color="gray.400"
                                                            _hover={{ color: "red.500", bg: "red.50" }}
                                                            height="18px"
                                                            minW="18px"
                                                            onClick={() => setFormData(prev => ({ ...prev, bagCount: 0 }))}
                                                        >
                                                            <Trash2 size={12}/>
                                                        </IconButton>
                                                    </Flex>
                                                    <Flex align="center" gap={2}>
                                                        <Input 
                                                            type="number" size="xs" w="50px" textAlign="center" 
                                                            value={formData.bagCount} 
                                                            onChange={(e) => setFormData(prev => ({ ...prev, bagCount: parseInt(e.target.value) || 0 }))}
                                                        />
                                                        <Text fontWeight="600" fontSize="sm">+${totals.bagTaxValue.toLocaleString('es-CO')}</Text>
                                                    </Flex>
                                                </Flex>
                                            )}
                                            
                                            {/* Transporte (Suma) */}
                                            <Flex justify="space-between" align="center">
                                                <Text color="gray.600" fontWeight="500" fontSize="sm">Transporte (+)</Text>
                                                <Input 
                                                    type="number" size="sm" w="120px" textAlign="right" 
                                                    value={formData.transport || ''} 
                                                    onChange={(e) => handleChange('transport', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </Flex>
                                            
                                            {/* Bono (Resta) */}
                                            <Flex justify="space-between" align="center">
                                                <Text color="gray.600" fontWeight="500" fontSize="sm">Bono (-)</Text>
                                                <Input 
                                                    type="number" size="sm" w="120px" textAlign="right" 
                                                    value={formData.bonus || ''} 
                                                    onChange={(e) => handleChange('bonus', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </Flex>

                                            <SafeDivider />
                                            
                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="lg" fontWeight="800" color="purple.900">Total a Pagar</Text>
                                                <Text fontSize="2xl" fontWeight="800" color="purple.600">${totals.total.toLocaleString('es-CO')}</Text>
                                            </Flex>
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Box>
                        </Stack>
                    </Card.Body>
                </Card.Root>

                {/* BOTONES AL PIE DE PÁGINA */}
                <Flex justify="flex-end" gap={4} mt={6} mb={12}>
                    <Button 
                        variant="outline" 
                        colorPalette="gray" 
                        size="md" 
                        fontWeight="600" 
                        onClick={() => router.push('/invoices')}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        colorPalette="purple" 
                        size="md" 
                        fontWeight="bold" 
                        shadow="md" 
                        loading={isSaving} 
                        loadingText="Guardando..." 
                        onClick={handleSave} 
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    >
                        <Save size={18} style={{ marginRight: '8px' }} /> Guardar Factura
                    </Button>
                </Flex>

            </Container>

            <ClientDrawer isOpen={isClientDrawerOpen} onClose={() => setIsClientDrawerOpen(false)} onSelectClient={handleSelectClientFromDrawer} />
        </Box>
    )
}