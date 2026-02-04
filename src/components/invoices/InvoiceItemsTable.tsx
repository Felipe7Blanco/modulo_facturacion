'use client'

import { Button, Box, Table, Input, IconButton, Flex, Text } from '@chakra-ui/react'
import { Trash2, Plus } from 'lucide-react'
import { IInvoiceItem } from '@/types/invoice.types'

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

    // Calcular total del item
    const calculateItemTotal = (item: IInvoiceItem) => {
        const subtotal = item.price * item.quantity
        const discount = item.discount || 0
        const tax = item.tax || 0
        return subtotal - discount + tax
    }

    return (
        <Box>
            <Box overflowX="auto">
                <Table.Root size="sm">
                    <Table.Header>
                        <Table.Row bg="gray.50">
                            <Table.ColumnHeader w="60px" textAlign="center">REF</Table.ColumnHeader>
                            <Table.ColumnHeader w="80px" textAlign="center">EA ⚖️</Table.ColumnHeader>
                            <Table.ColumnHeader minW="200px">DESCRIPCIÓN</Table.ColumnHeader>
                            <Table.ColumnHeader w="100px" textAlign="center">CANTIDAD</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="right">PRECIO</Table.ColumnHeader>
                            <Table.ColumnHeader w="100px" textAlign="center">DESCUENTO</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="center">RET.FUENTE</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="center">IMPUESTO</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="right">SUBTOTAL</Table.ColumnHeader>
                            <Table.ColumnHeader w="120px" textAlign="right">TOTAL</Table.ColumnHeader>
                            <Table.ColumnHeader w="60px" textAlign="center">
                                <IconButton
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {items.map((item, index) => (
                            <Table.Row key={item._id}>
                                {/* REF */}
                                <Table.Cell textAlign="center">
                                    <Text fontSize="sm" fontWeight="500">
                                        {index + 1}
                                    </Text>
                                </Table.Cell>

                                {/* EA (Unidad de medida) */}
                                <Table.Cell>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <option value="UND">UND</option>
                                        <option value="KG">KG</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                    </select>
                                </Table.Cell>

                                {/* DESCRIPCIÓN */}
                                <Table.Cell>
                                    <Input
                                        size="sm"
                                        placeholder="Descripción del producto/servicio"
                                        value={item.name}
                                        onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                                    />
                                    <Input
                                        size="sm"
                                        placeholder="Descripción adicional (opcional)"
                                        value={item.description || ''}
                                        onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                                        mt={1}
                                        fontSize="xs"
                                        color="gray.600"
                                    />
                                </Table.Cell>

                                {/* CANTIDAD */}
                                <Table.Cell>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                        textAlign="center"
                                    />
                                </Table.Cell>

                                {/* PRECIO */}
                                <Table.Cell>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        textAlign="right"
                                    />
                                </Table.Cell>

                                {/* DESCUENTO */}
                                <Table.Cell>
                                    <Flex align="center" gap={1}>
                                        <Input
                                            size="sm"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.discount || 0}
                                            onChange={(e) => onUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                            textAlign="center"
                                            w="70px"
                                        />
                                        <Text fontSize="xs">%</Text>
                                    </Flex>
                                </Table.Cell>

                                {/* RETENCIÓN FUENTE */}
                                <Table.Cell>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <option value="excluido">Excluido</option>
                                        <option value="1">1%</option>
                                        <option value="2">2%</option>
                                        <option value="2.5">2.5%</option>
                                        <option value="3.5">3.5%</option>
                                        <option value="4">4%</option>
                                        <option value="6">6%</option>
                                        <option value="10">10%</option>
                                        <option value="11">11%</option>
                                    </select>
                                </Table.Cell>

                                {/* IMPUESTO */}
                                <Table.Cell>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '4px',
                                        }}
                                        onChange={(e) => onUpdateItem(index, 'tax', parseFloat(e.target.value) || 0)}
                                    >
                                        <option value="0">Excluido</option>
                                        <option value="5">5%</option>
                                        <option value="19">19%</option>
                                    </select>
                                </Table.Cell>

                                {/* SUBTOTAL */}
                                <Table.Cell textAlign="right">
                                    <Text fontSize="sm" fontWeight="500">
                                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                                    </Text>
                                </Table.Cell>

                                {/* TOTAL */}
                                <Table.Cell textAlign="right">
                                    <Text fontSize="sm" fontWeight="700" color="blue.600">
                                        ${calculateItemTotal(item).toLocaleString('es-CO')}
                                    </Text>
                                </Table.Cell>

                                {/* ELIMINAR */}
                                <Table.Cell textAlign="center">
                                    <IconButton
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        aria-label="Eliminar item"
                                        onClick={() => onRemoveItem(index)}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Botón agregar línea */}
            <Flex justify="flex-end" mt={4}>
                <Button
                    size="sm"
                    variant="outline"
                    colorScheme="blue"

                    onClick={onAddItem}
                >
                    + Línea
                </Button>
            </Flex>
        </Box>
    )
}