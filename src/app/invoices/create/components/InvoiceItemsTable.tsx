'use client'

import { Button, Box, Table, Input, IconButton, Flex, Text } from '@chakra-ui/react'
import { Trash2, Package, Wrench, Search } from 'lucide-react'
import { IInvoiceItem } from '@/types/invoice.types'
import { useState } from 'react'
import { mockProducts, mockServices } from '@/data/mockProducts'

interface InvoiceItemsTableProps {
    items: IInvoiceItem[]
    onUpdateItem: (index: number, field: keyof IInvoiceItem, value: any) => void
    onAddItem: () => void
    onRemoveItem: (index: number) => void
}

export function InvoiceItemsTable({
    items,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
}: InvoiceItemsTableProps) {

    return (
        <Box>
            <Box overflowX="auto">
                <Table.Root size="sm" variant="outline">
                    <Table.Header>
                        <Table.Row bg="gray.100">
                            <Table.ColumnHeader w="50px" textAlign="center">N°</Table.ColumnHeader>
                            <Table.ColumnHeader minW="300px">Búsqueda y Descripción</Table.ColumnHeader>
                            <Table.ColumnHeader w="80px" textAlign="center">Cant</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="right">Precio</Table.ColumnHeader>
                            <Table.ColumnHeader w="80px" textAlign="center">Desc %</Table.ColumnHeader>
                            <Table.ColumnHeader w="100px" textAlign="center">Impuesto</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="right">Total</Table.ColumnHeader>
                            <Table.ColumnHeader w="50px"></Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {items.map((item, index) => (
                            <ItemRow
                                key={item._id}
                                item={item}
                                index={index}
                                onUpdateItem={onUpdateItem}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* SOLO EL BOTÓN DE AGREGAR ITEM A LA DERECHA */}
            <Flex justify="flex-end" mt={4}>
                <Button size="sm" colorPalette="blue" onClick={onAddItem}>
                    + Agregar ítem
                </Button>
            </Flex>
        </Box>
    )
}

// --- SUBCOMPONENTE DE FILA PARA MANEJAR ESTADO INDIVIDUAL Y BUSQUEDA REF ---
function ItemRow({ item, index, onUpdateItem, onRemoveItem }: any) {
    const [sourceType, setSourceType] = useState<'product' | 'service'>('product')

    // Calcular total local
    const subtotal = item.price * item.quantity
    const discountVal = (subtotal * (item.discount || 0)) / 100
    const taxVal = ((subtotal - discountVal) * (item.tax || 0)) / 100
    const total = subtotal - discountVal + taxVal

    // BÚSQUEDA POR REF DINÁMICA
    const handleRefSearch = (refCode: string) => {
        const foundProduct = mockProducts.find(p => p.id === refCode || p.id.includes(refCode))
        const foundService = mockServices.find(s => s.id === refCode || s.id.includes(refCode))

        const selected = foundProduct || foundService

        if (selected) {
            setSourceType(foundProduct ? 'product' : 'service')
            onUpdateItem(index, 'name', selected.name)
            onUpdateItem(index, 'price', selected.price)
            onUpdateItem(index, 'tax', selected.tax)
            onUpdateItem(index, 'description', foundProduct ? 'Producto de venta' : 'Servicio prestado')
        }
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        const source = sourceType === 'product' ? mockProducts : mockServices
        const selected = source.find(s => s.id === id)

        if (selected) {
            onUpdateItem(index, 'name', selected.name)
            onUpdateItem(index, 'price', selected.price)
            onUpdateItem(index, 'tax', selected.tax)
            onUpdateItem(index, 'description', sourceType === 'product' ? 'Producto de venta' : 'Servicio prestado')
        }
    }

    return (
        <Table.Row _hover={{ bg: 'gray.50' }}>
            <Table.Cell textAlign="center">{index + 1}</Table.Cell>

            <Table.Cell>
                <Flex direction="column" gap={2}>

                    {/* BUSCADOR POR REFERENCIA */}
                    <Box position="relative">
                        <Box position="absolute" left="8px" top="50%" transform="translateY(-50%)" color="gray.400">
                            <Search size={14} />
                        </Box>
                        <Input
                            size="sm"
                            pl="28px"
                            placeholder="Buscar por REF (Ej: prod-1, serv-1)"
                            onChange={(e) => handleRefSearch(e.target.value)}
                            bg="white"
                            borderColor="gray.200"
                        />
                    </Box>

                    {/* Botones de selección */}
                    <Flex gap={2}>
                        <Button
                            size="xs"
                            variant={sourceType === 'product' ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => setSourceType('product')}
                            flex={1}
                        >
                            <Package size={12} style={{ marginRight: '4px' }} /> Producto
                        </Button>
                        <Button
                            size="xs"
                            variant={sourceType === 'service' ? 'solid' : 'outline'}
                            colorPalette="purple"
                            onClick={() => setSourceType('service')}
                            flex={1}
                        >
                            <Wrench size={12} style={{ marginRight: '4px' }} /> Servicio
                        </Button>
                    </Flex>

                    {/* ComboBox según selección */}
                    <select
                        style={{
                            width: '100%',
                            padding: '6px',
                            fontSize: '13px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            backgroundColor: 'white'
                        }}
                        onChange={handleSelectChange}
                        defaultValue=""
                    >
                        <option value="" disabled>Seleccione {sourceType === 'product' ? 'un producto' : 'un servicio'}...</option>
                        {(sourceType === 'product' ? mockProducts : mockServices).map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name} - ${opt.price.toLocaleString()}
                            </option>
                        ))}
                    </select>

                    {/* Input manual por si quieren editar el nombre */}
                    <Input
                        size="xs"
                        value={item.name}
                        placeholder="Nombre del ítem..."
                        onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                    />
                </Flex>
            </Table.Cell>

            <Table.Cell>
                <Input
                    size="sm" type="number" min="1" textAlign="center"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                />
            </Table.Cell>

            <Table.Cell>
                <Input
                    size="sm" type="number" textAlign="right"
                    value={item.price}
                    onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value))}
                />
            </Table.Cell>

            <Table.Cell>
                <Input
                    size="sm" type="number" textAlign="center"
                    value={item.discount}
                    onChange={(e) => onUpdateItem(index, 'discount', parseFloat(e.target.value))}
                />
            </Table.Cell>

            <Table.Cell>
                <select
                    value={item.tax}
                    onChange={(e) => onUpdateItem(index, 'tax', parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #E2E8F0', borderRadius: '4px' }}
                >
                    <option value="0">0%</option>
                    <option value="19">19%</option>
                    <option value="5">5%</option>
                </select>
            </Table.Cell>

            <Table.Cell textAlign="right" fontWeight="bold">
                ${total.toLocaleString('es-CO')}
            </Table.Cell>

            <Table.Cell>
                {/* ICONO DE BORRAR RESTAURADO (Transparente y rojo al hacer hover/click natural) */}
                <IconButton
                    size="sm" 
                    variant="ghost" 
                    aria-label="Borrar"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    onClick={() => onRemoveItem(index)}
                >
                    <Trash2 size={16} />
                </IconButton>
            </Table.Cell>
        </Table.Row>
    )
}