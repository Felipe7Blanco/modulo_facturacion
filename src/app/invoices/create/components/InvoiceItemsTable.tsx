'use client'

import { Button, Box, Table, Input, IconButton, Flex, Text } from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
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
                <Table.Root size="sm" variant="outline">
                    <Table.Header>
                        <Table.Row bg="gray.100" borderBottom="2px solid" borderColor="gray.200">
                            <Table.ColumnHeader
                                w="50px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                REF
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="80px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                EA ⚖️
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                minW="250px"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Descripción
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="100px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Cantidad
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="120px"
                                textAlign="right"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Precio
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="100px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Descuento
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="130px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Ret.Fuente
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="120px"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Impuesto
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="120px"
                                textAlign="right"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Subtotal
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="120px"
                                textAlign="right"
                                fontSize="xs"
                                fontWeight="700"
                                color="gray.700"
                                textTransform="uppercase"
                                py={3}
                            >
                                Total
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                                w="50px"
                                textAlign="center"
                                py={3}
                            >
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {items.map((item, index) => (
                            <Table.Row
                                key={item._id}
                                _hover={{ bg: 'gray.50' }}
                                transition="background 0.2s"
                                borderBottom="1px solid"
                                borderColor="gray.100"
                            >
                                {/* REF */}
                                <Table.Cell textAlign="center" py={3}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                                        {index + 1}
                                    </Text>
                                </Table.Cell>

                                {/* EA (Unidad de medida) */}
                                <Table.Cell py={3}>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '6px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value="UND">UND</option>
                                        <option value="KG">KG</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                    </select>
                                </Table.Cell>

                                {/* DESCRIPCIÓN */}
                                <Table.Cell py={3}>
                                    <Input
                                        size="sm"
                                        placeholder="Descripción del producto/servicio"
                                        value={item.name}
                                        onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                                        borderColor="gray.300"
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                                    />
                                    <Input
                                        size="sm"
                                        placeholder="Descripción adicional (opcional)"
                                        value={item.description || ''}
                                        onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                                        mt={1}
                                        fontSize="xs"
                                        color="gray.600"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                                    />
                                </Table.Cell>

                                {/* CANTIDAD */}
                                <Table.Cell py={3}>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                        textAlign="center"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                                    />
                                </Table.Cell>

                                {/* PRECIO */}
                                <Table.Cell py={3}>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        textAlign="right"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                                    />
                                </Table.Cell>

                                {/* DESCUENTO */}
                                <Table.Cell py={3}>
                                    <Flex align="center" gap={1}>
                                        <Input
                                            size="sm"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.discount || 0}
                                            onChange={(e) => onUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                            textAlign="center"
                                            w="60px"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                                        />
                                        <Text fontSize="xs" color="gray.600" fontWeight="500">%</Text>
                                    </Flex>
                                </Table.Cell>

                                {/* RETENCIÓN FUENTE */}
                                <Table.Cell py={3}>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '6px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
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
                                <Table.Cell py={3}>
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '6px 8px',
                                            fontSize: '13px',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '6px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                        }}
                                        onChange={(e) => onUpdateItem(index, 'tax', parseFloat(e.target.value) || 0)}
                                    >
                                        <option value="0">Excluido</option>
                                        <option value="5">5%</option>
                                        <option value="19">19%</option>
                                    </select>
                                </Table.Cell>

                                {/* SUBTOTAL */}
                                <Table.Cell textAlign="right" py={3}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                                    </Text>
                                </Table.Cell>

                                {/* TOTAL */}
                                <Table.Cell textAlign="right" py={3}>
                                    <Text fontSize="sm" fontWeight="700" color="blue.600">
                                        ${calculateItemTotal(item).toLocaleString('es-CO')}
                                    </Text>
                                </Table.Cell>

                                {/* ELIMINAR */}
                                <Table.Cell textAlign="center" py={3}>
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

            {/* Botón agregar línea + Botones AIU */}
            <Flex justify="space-between" align="center" mt={4}>
                <Flex gap={3}>
                    <Button size="sm" variant="outline" colorScheme="gray">
                        Agregar AIU
                    </Button>
                    <Button size="sm" variant="outline" colorScheme="gray">
                        Agregar Imp Bolsa Plástica
                    </Button>
                </Flex>

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